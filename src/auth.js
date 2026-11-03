import { createClient } from "@supabase/supabase-js";

const DEMO_SESSION_KEY = "food.demo.session";

function hasSupabaseConfig(config) {
  return Boolean(config?.url?.trim() && config?.anonKey?.trim());
}

function demoUser() {
  return { id: "demo-user", email: "greco@food.local", name: "Greco Casa" };
}

function mapSupabaseSession(session) {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata ?? {};
  return {
    source: "supabase",
    raw: session,
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: metadata.display_name ?? metadata.full_name ?? session.user.email?.split("@")[0] ?? "FOOD",
    },
  };
}

export function createFoodAuth(config = {}, { demoAllowed = false } = {}) {
  const supabaseEnabled = hasSupabaseConfig(config);
  const client = supabaseEnabled ? createClient(config.url.trim(), config.anonKey.trim()) : null;
  const mode = supabaseEnabled ? "supabase" : demoAllowed ? "demo" : "unconfigured";

  async function getSession() {
    if (client) {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) return mapSupabaseSession(data.session);
    }

    if (!demoAllowed) return null;
    if (localStorage.getItem(DEMO_SESSION_KEY) === null) localStorage.setItem(DEMO_SESSION_KEY, "active");
    return localStorage.getItem(DEMO_SESSION_KEY) === "active"
      ? { source: "demo", user: demoUser() }
      : null;
  }

  async function signIn(email, password) {
    if (!email || !password) throw new Error("Inserisci email e password.");
    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return mapSupabaseSession(data.session);
    }
    if (!demoAllowed) throw new Error("Supabase non è configurato per questo ambiente.");
    localStorage.setItem(DEMO_SESSION_KEY, "active");
    return { source: "demo", user: { ...demoUser(), email } };
  }

  async function continueDemo() {
    if (!demoAllowed) throw new Error("La modalità demo è disponibile solo in sviluppo locale.");
    localStorage.setItem(DEMO_SESSION_KEY, "active");
    return { source: "demo", user: demoUser() };
  }

  async function signOut() {
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
  }

  return { mode, getSession, signIn, continueDemo, signOut };
}
