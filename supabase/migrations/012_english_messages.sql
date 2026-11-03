-- Refresh messages and future-row defaults in already-installed schemas.
-- Existing records, permissions, identifiers, and legacy shopping keys are preserved.
begin;

create or replace function public.save_food_plan(
  p_space_id uuid, p_week_start date, p_items jsonb, p_generate boolean default false
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_item jsonb;
begin
  if auth.uid() is null or not public.is_space_member(p_space_id) then
    raise exception 'Access to this space is not allowed';
  end if;
  if p_week_start is null or extract(isodow from p_week_start) <> 1 then
    raise exception 'The week must start on Monday';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'No meals to save';
  end if;
  -- Serializes writes to the same space/week, including first-time generation.
  perform pg_advisory_xact_lock(hashtextextended(p_space_id::text || p_week_start::text, 0));
  insert into public.meal_plans(space_id, week_start, created_by)
    values(p_space_id, p_week_start, auth.uid())
    on conflict(space_id, week_start) do nothing;
  select id into strict v_plan_id from public.meal_plans
    where space_id = p_space_id and week_start = p_week_start for update;
  if p_generate and exists(select 1 from public.meal_plan_items where meal_plan_id = v_plan_id) then
    raise exception 'This week already has a plan. Edit individual meals instead.';
  end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    if not exists(select 1 from public.recipes where id = (v_item->>'recipe_id')::uuid and space_id = p_space_id) then
      raise exception 'Recipe is not available in this space';
    end if;
    insert into public.meal_plan_items(meal_plan_id, recipe_id, day_of_week, meal_type, servings, notes)
      values(v_plan_id, (v_item->>'recipe_id')::uuid, (v_item->>'day_of_week')::smallint,
        v_item->>'meal_type', (v_item->>'servings')::numeric, coalesce(v_item->>'notes', ''))
      on conflict(meal_plan_id, day_of_week, meal_type) do update set
        recipe_id = excluded.recipe_id, servings = excluded.servings, notes = excluded.notes, updated_at = now();
  end loop;

  -- Preserve existing row IDs and checked flags for ingredients still required.
  with ingredients as (
    select trim(i->>'name') as name,
      lower(regexp_replace(trim(i->>'name'), '\s+', ' ', 'g')) || '|' || coalesce(i->>'unit', 'pz') || '|' || coalesce(i->>'category', 'Altro') as ingredient_key,
      coalesce(i->>'unit', 'pz') as unit, coalesce(i->>'category', 'Altro') as category,
      coalesce((i->>'quantity')::numeric, 0) * m.servings / r.servings as quantity
    from public.meal_plan_items m join public.recipes r on r.id = m.recipe_id
      cross join lateral jsonb_array_elements(r.ingredients) i
    where m.meal_plan_id = v_plan_id
  )
  insert into public.shopping_items(space_id, meal_plan_id, ingredient_key, name, quantity, unit, category)
    select p_space_id, v_plan_id, ingredient_key, min(name), sum(quantity), unit, category
    from ingredients group by ingredient_key, unit, category
    on conflict(meal_plan_id, ingredient_key) do update set
      name = excluded.name, quantity = excluded.quantity, unit = excluded.unit,
      category = excluded.category, updated_at = now();

  delete from public.shopping_items s where s.meal_plan_id = v_plan_id and not exists (
    select 1 from public.meal_plan_items m join public.recipes r on r.id = m.recipe_id
      cross join lateral jsonb_array_elements(r.ingredients) i
    where m.meal_plan_id = v_plan_id and s.ingredient_key =
      lower(regexp_replace(trim(i->>'name'), '\s+', ' ', 'g')) || '|' || coalesce(i->>'unit', 'pz') || '|' || coalesce(i->>'category', 'Altro')
  );
  update public.meal_plans set updated_at = now() where id = v_plan_id;
end;
$$;

create or replace function public.set_food_meal_preference(p_space_id uuid, p_meal text, p_enabled boolean)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null or not public.is_space_member(p_space_id) then
    raise exception 'Access to this space is not allowed';
  end if;
  if p_meal is null or p_meal not in ('breakfast', 'snack') or p_enabled is null then
    raise exception 'Invalid preference';
  end if;
  insert into public.space_preferences(space_id, breakfast_enabled, snack_enabled)
  values(p_space_id, case when p_meal = 'breakfast' then p_enabled else false end,
    case when p_meal = 'snack' then p_enabled else false end)
  on conflict(space_id) do update set
    breakfast_enabled = case when p_meal = 'breakfast' then p_enabled else space_preferences.breakfast_enabled end,
    snack_enabled = case when p_meal = 'snack' then p_enabled else space_preferences.snack_enabled end,
    updated_at = now();
end;
$$;

create or replace function public.check_food_plan_diet()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  v_tags text[];
  v_space uuid;
begin
  select diet_tags, space_id into v_tags, v_space from public.recipes where id = new.recipe_id;
  if v_space is null then raise exception 'Recipe unavailable'; end if;
  if exists (
    select 1 from public.household_profiles p where p.space_id = v_space and p.is_active and not (
      p.diet_type = 'omnivore'
      or (p.diet_type = 'vegan' and 'vegan' = any(v_tags))
      or (p.diet_type = 'vegetarian' and v_tags && array['vegan', 'vegetarian']::text[])
      or (p.diet_type = 'pescatarian' and v_tags && array['vegan', 'vegetarian', 'pescatarian']::text[])
    )
  ) then raise exception 'Recipe does not match the space diet profiles'; end if;
  return new;
end;
$$;

create or replace function public.check_food_plan_space()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  v_space uuid;
  v_recipe_space uuid;
begin
  select space_id into v_space from public.meal_plans where id = new.meal_plan_id;
  if v_space is null then raise exception 'Plan unavailable in this space'; end if;
  if tg_table_name = 'shopping_items' then
    if new.space_id is distinct from v_space then
      raise exception 'Shopping list and meal plan must belong to the same space';
    end if;
  elsif tg_table_name = 'meal_plan_items' then
    select space_id into v_recipe_space from public.recipes where id = new.recipe_id;
    if v_recipe_space is distinct from v_space then
      raise exception 'Recipe and meal plan must belong to the same space';
    end if;
  end if;
  return new;
end;
$$;

alter table public.profiles alter column display_name set default 'New profile';
alter table public.spaces alter column name set default 'Home FOOD';
alter table public.meal_plans alter column title set default 'FOOD plan';
alter table public.shopping_items alter column unit set default 'pcs', alter column category set default 'Other';

commit;
