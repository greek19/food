-- FOOD migration 003: explicit table privileges for the Supabase authenticated role.
-- RLS remains enabled and is still the authorization boundary.

grant select, insert, update, delete on table
  public.spaces,
  public.space_members,
  public.recipes,
  public.household_profiles,
  public.meal_plans,
  public.meal_plan_items,
  public.shopping_items
to authenticated;

grant execute on function public.is_space_member(uuid) to authenticated;
