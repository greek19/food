/*
 * Runtime configuration for the optional Supabase adapter.
 * Keep service_role keys out of the browser. The anon/publishable key is the
 * only key that belongs here, and it must still be protected by RLS policies.
 *
 * For local work, supabase-config.local.js is loaded before this file and
 * provides window.__FOOD_RUNTIME_CONFIG__. For a hosted deployment, a build
 * step can inject the same object before this file is loaded.
 */
const foodRuntimeConfig = window.__FOOD_RUNTIME_CONFIG__ ?? {};
window.FOOD_SUPABASE_CONFIG = Object.freeze({
  url: foodRuntimeConfig.SUPABASE_URL ?? "",
  anonKey: foodRuntimeConfig.SUPABASE_PUBLISHABLE_KEY ?? foodRuntimeConfig.SUPABASE_ANON_KEY ?? "",
});
