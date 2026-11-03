-- Allow optional breakfast and snack slots. Existing rows remain unchanged.
alter table public.household_profiles add column if not exists excluded_foods text not null default '';
alter table public.meal_plan_items drop constraint if exists meal_plan_items_meal_type_check;
alter table public.meal_plan_items add constraint meal_plan_items_meal_type_check
check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack'));
