-- Atomic meal edits/generation and shopping refresh, using existing RLS policies.
-- Run in the Supabase SQL Editor before releasing the corresponding frontend.
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
revoke all on function public.save_food_plan(uuid, date, jsonb, boolean) from public, anon;
grant execute on function public.save_food_plan(uuid, date, jsonb, boolean) to authenticated;
