const DEMO_SESSION_KEY = "food.demo.session";
const SUPABASE_IMPORT_URL = "https://esm.sh/@supabase/supabase-js@2";

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

export function createFoodAuth(config = {}) {
  const supabaseEnabled = hasSupabaseConfig(config);
  let clientPromise;

  async function getClient() {
    if (!supabaseEnabled) return null;
    if (!clientPromise) {
      clientPromise = import(SUPABASE_IMPORT_URL).then(({ createClient }) => createClient(config.url.trim(), config.anonKey.trim()));
    }
    return clientPromise;
  }

  async function getSession() {
    const client = await getClient();
    if (client) {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) return mapSupabaseSession(data.session);
      // A user can still choose the local demo even when Supabase is configured.
      return localStorage.getItem(DEMO_SESSION_KEY) === "active"
        ? { source: "demo", user: demoUser() }
        : null;
    }

    // Keep the phase-1 UI immediately usable without inventing a backend account.
    if (localStorage.getItem(DEMO_SESSION_KEY) === null) localStorage.setItem(DEMO_SESSION_KEY, "active");
    return localStorage.getItem(DEMO_SESSION_KEY) === "active"
      ? { source: "demo", user: demoUser() }
      : null;
  }

  async function signIn(email, password) {
    if (!email || !password) throw new Error("Inserisci email e password.");
    const client = await getClient();
    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return mapSupabaseSession(data.session);
    }

    localStorage.setItem(DEMO_SESSION_KEY, "active");
    return { source: "demo", user: { ...demoUser(), email } };
  }

  async function continueDemo() {
    localStorage.setItem(DEMO_SESSION_KEY, "active");
    return { source: "demo", user: demoUser() };
  }

  async function signOut() {
    const client = await getClient();
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
  }

  return { mode: supabaseEnabled ? "supabase" : "demo", getSession, signIn, continueDemo, signOut };
}
