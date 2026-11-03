const basePath = import.meta.env.BASE_URL;
const envConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? "",
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
};

function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${basePath}${path}`;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Impossibile caricare ${path}`));
    document.head.appendChild(script);
  });
}

export async function loadRuntimeConfig() {
  if (envConfig.url && envConfig.anonKey) return envConfig;
  await loadScript("supabase-config.js");
  return window.FOOD_SUPABASE_CONFIG ?? { url: "", anonKey: "" };
}
