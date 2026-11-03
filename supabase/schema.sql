-- FOOD / Supabase data model
-- Run this in the Supabase SQL editor after creating a project.
-- Never expose a service_role key in the browser. RLS is part of the model.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New profile',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Home FOOD',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

create table if not exists public.nutrition_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  goal text not null default 'maintenance',
  calorie_target integer not null default 2100 check (calorie_target between 800 and 10000),
  protein_target_g numeric(7,2) not null default 110,
  carbs_target_g numeric(7,2) not null default 260,
  fat_target_g numeric(7,2) not null default 70,
  dietary_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  title text not null,
  description text,
  image_url text,
  meal_type text not null default 'dinner' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine text,
  prep_minutes integer check (prep_minutes is null or prep_minutes > 0),
  calories integer check (calories is null or calories >= 0),
  protein_g numeric(7,2) check (protein_g is null or protein_g >= 0),
  carbs_g numeric(7,2) check (carbs_g is null or carbs_g >= 0),
  fat_g numeric(7,2) check (fat_g is null or fat_g >= 0),
  fiber_g numeric(7,2) not null default 0 check (fiber_g >= 0),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_space_id_idx on public.recipes(space_id);
create index if not exists space_members_user_id_idx on public.space_members(user_id);

create or replace function public.is_space_member(target_space_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.space_members
    where space_id = target_space_id and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.nutrition_profiles enable row level security;
alter table public.recipes enable row level security;

create policy "profiles are readable by the owner"
  on public.profiles for select using (id = auth.uid());
create policy "profiles are editable by the owner"
  on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "members can read their spaces"
  on public.spaces for select using (public.is_space_member(id));
create policy "owners can manage their spaces"
  on public.spaces for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "members can read memberships in their spaces"
  on public.space_members for select using (public.is_space_member(space_id));
create policy "owners can manage memberships"
  on public.space_members for all using (
    exists (select 1 from public.spaces where id = space_id and owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.spaces where id = space_id and owner_id = auth.uid())
  );

create policy "users can manage their nutrition profile"
  on public.nutrition_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "space members can read recipes"
  on public.recipes for select using (public.is_space_member(space_id));
create policy "space members can create recipes"
  on public.recipes for insert with check (public.is_space_member(space_id) and author_id = auth.uid());
create policy "authors can update recipes"
  on public.recipes for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors can delete recipes"
  on public.recipes for delete using (author_id = auth.uid());
