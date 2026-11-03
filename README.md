# FOOD

A private, shared meal-planning app built with React, Vite, and Supabase.

Live site: [greek19.github.io/food](https://greek19.github.io/food/)

Repository: [github.com/greek19/food](https://github.com/greek19/food)

## Features

- Email/password authentication and shared household data protected by row-level security.
- Recipe editing, multiple meal times, per-serving nutrition and fiber, and non-destructive JSON import.
- Private recipe photo uploads with previews, JPEG/PNG/WebP support, and a 5 MB limit.
- Individual calorie and macro targets, diet types, and ingredient exclusions.
- Weekly calendar, searchable recipe selection, individual servings, and daily balancing previews.
- Atomic meal-plan and shopping-list saves, preserving existing shopping checks.
- Shared optional breakfast and snack settings.
- Local demo mode during development only; production requires configured Supabase authentication.

English is the default application language. Use the **Language** selector in the top bar or sign-in screen
to switch to **Italiano**. The choice is saved on the current device and also applies to dates and messages.
Switching languages preserves the current page and unsaved form state. Recipe titles, ingredients, profile
names, and other household content are not translated automatically.
Source comments, documentation, and test output remain in English; Italian interface messages live in
the explicit translation catalog at `src/translations.js`. No database migration is needed to change the interface language.

## Local development

Requires Node.js 20.12+ and npm or pnpm.

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, usually [localhost:5173](http://localhost:5173).
Copy `.env.example` to `.env.local` and set the public Supabase configuration to connect to a real project:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use the project origin without API suffixes. The legacy `VITE_SUPABASE_ANON_KEY` name is also supported.
Never place service-role keys, account passwords, or secret keys in frontend variables.
Local environment files are ignored by Git.

## Database setup

Enable Email/Password authentication in Supabase. For a new project, run
[`schema.sql`](supabase/schema.sql), then the numbered files in
[`supabase/migrations`](supabase/migrations) in ascending order.
For an existing project, apply only pending migrations; do not rerun the initial schema.

| Migration | Purpose |
| --- | --- |
| 002 | Household profiles, meal plans, and shopping lists |
| 003 | Authenticated table grants |
| 004 | Multiple meal times per recipe |
| 005 | Fiber per serving |
| 006 | Optional meals and excluded foods |
| 007 | Atomic meal-plan and shopping-list writes |
| 008 | Shared breakfast/snack preferences |
| 009 | Structured diets and recipe compatibility |
| 010 | Cross-space reference checks |
| 011 | Private recipe photo storage |
| 012 | English messages for existing database functions |

Account creation and shared-space membership are separate. Accounts must belong to the same space to share data.
Member invitations are still a roadmap item.

## Recipe import and photos

Open **Recipes → Import JSON** to download the template, paste an array, or select a JSON file.
The preview validates records and detects duplicate titles. Existing recipes are never overwritten.
Fix validation errors before importing.

Nutrition values describe **one serving**. Ingredient quantities describe the full recipe's **base servings**.
The shopping list scales those quantities to the planned total servings.

Photo selection is local until **Save recipe** is pressed. Uploaded photos use a private bucket and temporary
signed links; existing external image URLs remain supported. See [photo storage notes](integration/photos.md).

## Tests

```powershell
npm test
npm run test:rls
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
```

Browser tests use an isolated local demo fixture, not real Supabase accounts.
SQL tests apply the repository's actual migrations in a local PostgreSQL engine.
Live checks require credentials in an ignored local file; see [integration instructions](integration/README.md).
Never commit test credentials or paste passwords into chat.

## Deployment

The [GitHub Pages workflow](.github/workflows/deploy-pages.yml) checks application logic, SQL policies,
desktop/mobile browser flows, lint, and the production build before publishing `dist/` on pushes to `main`.
Set GitHub Pages to **GitHub Actions** and configure repository variables
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
Without Supabase configuration, production shows a setup screen instead of entering demo mode.

The runtime fallback is [public/supabase-config.js](public/supabase-config.js).
It accepts `window.__FOOD_RUNTIME_CONFIG__` with public `SUPABASE_URL` and
`SUPABASE_PUBLISHABLE_KEY` values provided by the hosting environment.

## Project layout

- `src/App.jsx`: application shell, authentication, recipes, household profiles, and page integration.
- `src/Planner.jsx`: weekly calendar and meal editing.
- `src/data.js`: Supabase/demo data adapters.
- `src/nutrition.js`: individual portions and daily optimization.
- `src/diets.js`: explicit diet compatibility.
- `src/RecipePhotoField.jsx` and `src/photos.js`: upload UI and file validation.
- `styles.css`: shared visual tokens and responsive components.
- `src/i18n.js`, `src/translations.js`, and `src/LanguageSelector.jsx`: language persistence, Italian messages, and selection UI.
- `supabase/`: schema, grants, policies, and migrations.
- `e2e/`: isolated desktop/mobile browser tests.
- `integration/`: local policy tests and opt-in live checks.

See [STATUS.md](STATUS.md) for the verified state and [ROADMAP.md](ROADMAP.md) for remaining work.
