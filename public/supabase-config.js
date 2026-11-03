/* Runtime fallback. Local Supabase values belong in the ignored .env.local file. */
const foodRuntimeConfig = window.__FOOD_RUNTIME_CONFIG__ ?? {};
window.FOOD_SUPABASE_CONFIG = Object.freeze({
  url: foodRuntimeConfig.SUPABASE_URL ?? "",
  anonKey: foodRuntimeConfig.SUPABASE_PUBLISHABLE_KEY ?? foodRuntimeConfig.SUPABASE_ANON_KEY ?? "",
});
