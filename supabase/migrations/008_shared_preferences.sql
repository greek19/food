-- Shared optional meal settings. No existing meal is deleted or changed.
create table if not exists public.space_preferences (
  space_id uuid primary key references public.spaces(id) on delete cascade,
  breakfast_enabled boolean not null default false,
  snack_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.space_preferences enable row level security;
drop policy if exists "members read preferences" on public.space_preferences;
create policy "members read preferences" on public.space_preferences for select
  to authenticated using (public.is_space_member(space_id));
drop policy if exists "members insert preferences" on public.space_preferences;
create policy "members insert preferences" on public.space_preferences for insert
  to authenticated with check (public.is_space_member(space_id));
drop policy if exists "members update preferences" on public.space_preferences;
create policy "members update preferences" on public.space_preferences for update
  to authenticated using (public.is_space_member(space_id)) with check (public.is_space_member(space_id));
grant select, insert, update on public.space_preferences to authenticated;

create or replace function public.set_food_meal_preference(p_space_id uuid, p_meal text, p_enabled boolean)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null or not public.is_space_member(p_space_id) then
    raise exception 'Accesso allo spazio non consentito';
  end if;
  if p_meal is null or p_meal not in ('breakfast', 'snack') or p_enabled is null then
    raise exception 'Preferenza non valida';
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
revoke all on function public.set_food_meal_preference(uuid, text, boolean) from public, anon;
grant execute on function public.set_food_meal_preference(uuid, text, boolean) to authenticated;
