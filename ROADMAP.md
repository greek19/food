# FOOD roadmap

## Completed

- Shared recipes, household profiles, authentication, and persistent meal plans.
- Multi-meal recipe tags, fiber, JSON import, and duplicate protection.
- Weekly calendar, searchable recipe selection, and individual portions.
- Atomic plan/shopping saves and cross-space reference checks.
- Shared breakfast/snack settings, structured diets, and daily balancing previews.
- Private recipe photo uploads with a verified live Storage flow.
- Application, browser, and SQL-policy tests integrated into deployment.
- Read-only verification with two real shared-space accounts.

## Current work

Standardize the application, repository documentation, demo data, and diagnostics on English.
Apply migration 012 to translate messages in previously installed database functions.
Existing household content and identifiers are not translated.

## Next steps

1. **Dedicated remote verification:** concurrent writes and isolation from an external private space.
2. **People and invitations:** manage shared-space membership without manual SQL; lower priority for the current two-person household.
3. **Photo maintenance:** safely identify unreferenced objects before introducing cleanup.
4. **Structured allergens:** explicit recipe metadata, separately from the current text exclusions.
5. **Nutrition improvements:** broader recipe selection and clearer target comparisons where useful.
6. **Device coverage:** real Safari/iPhone checks and ongoing accessibility review.

No multi-space management expansion is currently requested.

## Verification boundaries

Local SQL tests apply the actual migrations and simulate auth identities and Storage metadata.
Live read-only checks confirm shared data visibility and anonymous-access denial.
The separate live Storage test writes and removes only one temporary object.
Remote external-space isolation is explicitly skipped when no private-space ID is configured.
Application data is not changed by the read-only verification.

See [integration instructions](integration/README.md), [photo notes](integration/photos.md),
and [browser test notes](e2e/README.md).
