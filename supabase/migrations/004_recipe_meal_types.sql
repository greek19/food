-- FOOD migration 004: allow a recipe to belong to multiple meal moments.
-- Idempotent and preserving: existing recipes inherit their current meal_type.

alter table if exists public.recipes
  add column if not exists meal_types text[];

update public.recipes
set meal_types = array[meal_type]
where meal_types is null or cardinality(meal_types) = 0;

alter table public.recipes
  alter column meal_types set default array['dinner']::text[],
  alter column meal_types set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recipes_meal_types_valid'
      and conrelid = 'public.recipes'::regclass
  ) then
    alter table public.recipes
      add constraint recipes_meal_types_valid
      check (
        cardinality(meal_types) > 0
        and meal_types <@ array['breakfast', 'lunch', 'dinner', 'snack']::text[]
      );
  end if;
end $$;
