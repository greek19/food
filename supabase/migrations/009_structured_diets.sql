-- Explicit recipe classification; legacy recipes are intentionally unclassified.
alter table public.household_profiles add column if not exists diet_type text not null default 'omnivore'
  check (diet_type in ('omnivore', 'vegetarian', 'vegan', 'pescatarian'));
alter table public.recipes add column if not exists diet_tags text[] not null default '{}'
  check (diet_tags <@ array['vegetarian', 'vegan', 'pescatarian']::text[] and array_position(diet_tags, null) is null);

-- Applies to manual edits and atomic generation alike. Existing plans remain intact.
create or replace function public.check_food_plan_diet()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  v_tags text[];
  v_space uuid;
begin
  select diet_tags, space_id into v_tags, v_space from public.recipes where id = new.recipe_id;
  if v_space is null then raise exception 'Ricetta non disponibile'; end if;
  if exists (
    select 1 from public.household_profiles p where p.space_id = v_space and p.is_active and not (
      p.diet_type = 'omnivore'
      or (p.diet_type = 'vegan' and 'vegan' = any(v_tags))
      or (p.diet_type = 'vegetarian' and v_tags && array['vegan', 'vegetarian']::text[])
      or (p.diet_type = 'pescatarian' and v_tags && array['vegan', 'vegetarian', 'pescatarian']::text[])
    )
  ) then raise exception 'Ricetta non compatibile con i profili alimentari dello spazio'; end if;
  return new;
end;
$$;
drop trigger if exists food_plan_diet_check on public.meal_plan_items;
create trigger food_plan_diet_check before insert or update on public.meal_plan_items
  for each row execute function public.check_food_plan_diet();
revoke all on function public.check_food_plan_diet() from public, anon;
