# FOOD project status

The core application is deployed to [GitHub Pages](https://greek19.github.io/food/).

## Implemented

- Shared Supabase authentication and household data with RLS.
- Recipe CRUD, JSON import, multiple meal times, nutrition, fiber, and private photos.
- Individual nutrition profiles, explicit diet compatibility, and ingredient exclusions.
- Real weekly dates, persistent meal editing, searchable recipes, and individual portions.
- Daily balancing proposals with confirmation before saving existing plans.
- Atomic plan/shopping writes and shared optional meal settings.
- Responsive navigation, internal modal scrolling, and keyboard focus management.

## Verification

- 13 application tests.
- 12 Chromium browser tests across desktop and emulated mobile layouts.
- Local SQL policy tests using actual migrations and simulated Storage metadata.
- Live, read-only two-account checks: matching recipes, profiles, plans, meals, shopping rows,
  and preferences; anonymous shared-data access denied.
- Live Storage check: temporary upload, second-member download, signed URL, denied public access,
  and confirmed removal of the temporary object.
- Checks are part of CI; live credentials remain local and are not used in public CI.

Live read-only checks observed 14 recipes, 2 profiles, 4 plans, 56 meals, and 113 shopping rows.
These are a verification snapshot, not fixed requirements.

## Current language update

The interface, documentation, demo fixtures, tests, and source messages are being standardized on English.
Migration 012 updates existing server-function messages without translating household content.
Existing recipe titles, ingredients, profile names, and space names are preserved.

## Remaining limits

- Remote isolation from an external private space and simultaneous write tests need a dedicated test setup.
- Chromium mobile emulation does not replace testing on a physical iPhone/Safari.
- Ingredient-name exclusions do not certify allergen absence or cross-contamination safety.
- Balancing adjusts servings of existing recipes and cannot guarantee exact macro targets.
- Replaced or detached photo objects are retained until a safe cleanup strategy is implemented.
- Invitations and account membership still require administrative setup.

See [ROADMAP.md](ROADMAP.md) for next steps.
