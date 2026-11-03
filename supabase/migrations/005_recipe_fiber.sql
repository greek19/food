-- FOOD migration 005: fiber grams per serving for recipes.
-- Idempotent and additive; existing recipes receive 0 until edited/imported.

alter table if exists public.recipes
  add column if not exists fiber_g numeric(7,2) not null default 0
  check (fiber_g >= 0);
