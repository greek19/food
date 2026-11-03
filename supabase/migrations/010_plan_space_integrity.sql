-- Keep references within one space, in addition to existing RLS checks.
-- Applies to future inserts/updates; no existing record is removed.
create or replace function public.check_food_plan_space()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  v_space uuid;
  v_recipe_space uuid;
begin
  select space_id into v_space from public.meal_plans where id = new.meal_plan_id;
  if v_space is null then raise exception 'Piano non disponibile nello spazio'; end if;
  if tg_table_name = 'shopping_items' then
    if new.space_id is distinct from v_space then
      raise exception 'Lista della spesa e piano devono appartenere allo stesso spazio';
    end if;
  elsif tg_table_name = 'meal_plan_items' then
    select space_id into v_recipe_space from public.recipes where id = new.recipe_id;
    if v_recipe_space is distinct from v_space then
      raise exception 'Ricetta e piano devono appartenere allo stesso spazio';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists food_shopping_space_check on public.shopping_items;
create trigger food_shopping_space_check before insert or update on public.shopping_items
  for each row execute function public.check_food_plan_space();
drop trigger if exists food_plan_space_check on public.meal_plan_items;
create trigger food_plan_space_check before insert or update on public.meal_plan_items
  for each row execute function public.check_food_plan_space();
revoke all on function public.check_food_plan_space() from public, anon;
