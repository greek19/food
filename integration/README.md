# Database and live checks

## Local policies

`npm run test:rls` applies the actual schema and migrations in an isolated PGlite PostgreSQL engine.
It simulates `auth.uid()`, authenticated/anonymous roles, two shared-space members, and an external user.
It checks shared access, isolation, forbidden role promotion, mutation RPCs, cross-space references,
and Storage metadata policies.

It does not contact Supabase or emulate Auth, PostgREST, Storage HTTP behavior, or remote connection concurrency.
PGlite provides `gen_random_uuid()` but does not package pgcrypto, so the local harness omits that extension statement.

## Read-only live verification

Copy `integration/.env.example` to `.env.supabase-test.local` in the project root.
Fill in the values **locally**; never send passwords in chat.
The local file is ignored by Git.

Use a publishable/anon key and two distinct test accounts that belong to the same space.
Run `npm run test:remote`. Avoid editing shared data during the check.

The script signs in, reads memberships, compares recipe/profile/plan/meal/shopping visibility and preferences,
and checks anonymous access. It does not insert or modify application records.
At the end, it closes only the sessions it created, without signing out existing portal sessions.

External-space isolation is checked only when `FOOD_TEST_PRIVATE_SPACE_ID` identifies an existing
space accessible to B but not A. Otherwise the script explicitly reports that check as not run.

## Live Storage verification

`npm run test:storage:remote` uses the same ignored credential file.
It uploads one uniquely named temporary image, checks second-member download and signed links,
checks that public access and anonymous signing are denied, and removes the temporary object.
It does not modify recipes, profiles, or meal plans. See [photo notes](photos.md).

Live checks are opt-in and are not executed in public CI.
