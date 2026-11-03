-- FOOD migration 002: household profiles, weekly plans and aggregated shopping.
-- Idempotent: safe to execute after supabase/schema.sql and to re-run manually.
-- Never run this with a service_role key from the browser.

create extension if not exists "pgcrypto";

-- Portion-aware planning is additive for projects that already ran schema.sql.
alter table if exists public.recipes
  add column if not exists servings numeric(7,2) not null default 2
  check (servings > 0);

create table if not exists public.household_profiles (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  goal text not null default 'maintenance',
  calorie_target integer not null default 2100 check (calorie_target between 800 and 10000),
  protein_target_g numeric(7,2) not null default 110 check (protein_target_g >= 0),
  carbs_target_g numeric(7,2) not null default 260 check (carbs_target_g >= 0),
  fat_target_g numeric(7,2) not null default 70 check (fat_target_g >= 0),
  dietary_preferences text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  week_start date not null,
  title text not null default 'FOOD plan',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, week_start)
);

create table if not exists public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete restrict,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  meal_type text not null check (meal_type in ('lunch', 'dinner')),
  servings numeric(7,2) not null default 1 check (servings > 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, day_of_week, meal_type)
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  ingredient_key text not null,
  name text not null,
  quantity numeric(9,2) not null default 0 check (quantity >= 0),
  unit text not null default 'pcs',
  category text not null default 'Other',
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, ingredient_key)
);

create index if not exists household_profiles_space_idx on public.household_profiles(space_id);
create index if not exists meal_plans_space_week_idx on public.meal_plans(space_id, week_start);
create index if not exists meal_plan_items_plan_idx on public.meal_plan_items(meal_plan_id);
create index if not exists shopping_items_plan_idx on public.shopping_items(meal_plan_id);

-- Recipes are shared content inside a space, so every authenticated member can
-- maintain them. The base schema's author-only policies are replaced here.
drop policy if exists "authors can update recipes" on public.recipes;
drop policy if exists "authors can delete recipes" on public.recipes;
drop policy if exists "members can update recipes" on public.recipes;
drop policy if exists "members can delete recipes" on public.recipes;
create policy "members can update recipes" on public.recipes
  for update using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));
create policy "members can delete recipes" on public.recipes
  for delete using (public.is_space_member(space_id));

alter table public.household_profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.shopping_items enable row level security;

drop policy if exists "members can read household profiles" on public.household_profiles;
drop policy if exists "members can create household profiles" on public.household_profiles;
drop policy if exists "members can update household profiles" on public.household_profiles;
drop policy if exists "members can delete household profiles" on public.household_profiles;
create policy "members can read household profiles" on public.household_profiles
  for select using (public.is_space_member(space_id));
create policy "members can create household profiles" on public.household_profiles
  for insert with check (public.is_space_member(space_id));
create policy "members can update household profiles" on public.household_profiles
  for update using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
create policy "members can delete household profiles" on public.household_profiles
  for delete using (public.is_space_member(space_id));

drop policy if exists "members can read meal plans" on public.meal_plans;
drop policy if exists "members can create meal plans" on public.meal_plans;
drop policy if exists "members can update meal plans" on public.meal_plans;
drop policy if exists "members can delete meal plans" on public.meal_plans;
create policy "members can read meal plans" on public.meal_plans
  for select using (public.is_space_member(space_id));
create policy "members can create meal plans" on public.meal_plans
  for insert with check (public.is_space_member(space_id) and created_by = auth.uid());
create policy "members can update meal plans" on public.meal_plans
  for update using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
create policy "members can delete meal plans" on public.meal_plans
  for delete using (public.is_space_member(space_id));

drop policy if exists "members can read meal plan items" on public.meal_plan_items;
drop policy if exists "members can create meal plan items" on public.meal_plan_items;
drop policy if exists "members can update meal plan items" on public.meal_plan_items;
drop policy if exists "members can delete meal plan items" on public.meal_plan_items;
create policy "members can read meal plan items" on public.meal_plan_items
  for select using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_space_member(p.space_id)));
create policy "members can create meal plan items" on public.meal_plan_items
  for insert with check (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_space_member(p.space_id)));
create policy "members can update meal plan items" on public.meal_plan_items
  for update using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_space_member(p.space_id)))
  with check (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_space_member(p.space_id)));
create policy "members can delete meal plan items" on public.meal_plan_items
  for delete using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_space_member(p.space_id)));

drop policy if exists "members can read shopping items" on public.shopping_items;
drop policy if exists "members can create shopping items" on public.shopping_items;
drop policy if exists "members can update shopping items" on public.shopping_items;
drop policy if exists "members can delete shopping items" on public.shopping_items;
create policy "members can read shopping items" on public.shopping_items
  for select using (public.is_space_member(space_id));
create policy "members can create shopping items" on public.shopping_items
  for insert with check (public.is_space_member(space_id));
create policy "members can update shopping items" on public.shopping_items
  for update using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
create policy "members can delete shopping items" on public.shopping_items
  for delete using (public.is_space_member(space_id));
