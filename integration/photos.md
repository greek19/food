# Recipe photos

Apply `supabase/migrations/011_recipe_photos.sql` before using private photo uploads.
It adds `recipes.image_path`, creates the private `recipe-images` bucket with a 5 MB limit
and JPEG/PNG/WebP content types, and grants access through member-only object policies.
The first path segment is the space ID; random file names prevent overwrites.

Recipes store the Storage path. Signed URLs are generated when data loads and expire after 24 hours;
they are not persisted in the database. Reloading the page renews them.
Existing external image URLs remain supported and are not migrated automatically.
The local demo stores a data URL in localStorage and is subject to browser storage quotas.

Selecting a file creates a local preview. Upload starts only when the recipe is saved.
If the database write fails after upload, the adapter attempts to remove the new object.
A failed connection during cleanup may leave an unreferenced object.
Replaced or detached photos are retained rather than risking deletion of objects used elsewhere.
A reference-aware cleanup strategy remains on the roadmap.

Verification covers file validation and upload rollback with a simulated client,
desktop/mobile demo uploads and persistence, and Storage policies on simulated local metadata.
Live verification has passed: temporary upload, second-member download and signing,
denied public download/anonymous signing, and confirmed cleanup.
Repeat it with `npm run test:storage:remote`; it uses the configured local test credentials.

References: [private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
and [access control](https://supabase.com/docs/guides/storage/security/access-control).
