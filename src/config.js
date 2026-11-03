const basePath = import.meta.env.BASE_URL;

export function normalizeSupabaseUrl(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.pathname = url.pathname.replace(/\/(?:rest\/v1|auth\/v1|storage\/v1)\/?$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return raw.replace(/\/$/, "");
  }
}

const envConfig = {
  url: normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? ""),
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
};

function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${basePath}${path}`;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${path}`));
    document.head.appendChild(script);
  });
}

export async function loadRuntimeConfig() {
  if (envConfig.url && envConfig.anonKey) return envConfig;
  await loadScript("supabase-config.js");
  const runtimeConfig = window.FOOD_SUPABASE_CONFIG ?? { url: "", anonKey: "" };
  return { ...runtimeConfig, url: normalizeSupabaseUrl(runtimeConfig.url ?? "") };
}
