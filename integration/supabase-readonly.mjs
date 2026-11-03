import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

// Credentials come only from local environment variables, never browser bundles.
const required = ['SUPABASE_TEST_URL', 'SUPABASE_TEST_KEY', 'FOOD_TEST_A_EMAIL', 'FOOD_TEST_A_PASSWORD', 'FOOD_TEST_B_EMAIL', 'FOOD_TEST_B_PASSWORD'];
if (required.some((name) => !process.env[name])) {
  console.error('Configurazione test remoti incompleta. Compila .env.supabase-test.local seguendo integration/.env.example.');
  process.exit(1);
}
const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;
if (key.startsWith('sb_secret_')) throw new Error('Usa solo una chiave publishable/anon.');
if (key.split('.').length === 3) {
  const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
  if (payload.role !== 'anon') throw new Error('Usa solo una chiave publishable/anon.');
}
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const clients = [createClient(url, key, options), createClient(url, key, options)];
async function read(query, label) {
  const result = await query;
  if (result.error) throw new Error(`Controllo non riuscito: ${label} (verifica configurazione, permessi e migrazioni).`);
  return result.data;
}
async function rows(client, table, space) {
  const result = [];
  for (let from = 0; ; from += 1000) {
    const query = table === 'meal_plan_items'
      ? client.from(table).select('id,meal_plan:meal_plans!inner(space_id)').eq('meal_plan.space_id', space)
      : client.from(table).select('id').eq('space_id', space);
    const batch = await read(query.order('id').range(from, from + 999), table);
    result.push(...batch.map((row) => row.id));
    if (batch.length < 1000) return result;
  }
}
try {
  const users = [];
  for (const [index, prefix] of ['A', 'B'].entries()) {
    const session = await clients[index].auth.signInWithPassword({ email: process.env[`FOOD_TEST_${prefix}_EMAIL`], password: process.env[`FOOD_TEST_${prefix}_PASSWORD`] });
    if (session.error || !session.data.user) throw new Error(`Accesso utente di test ${prefix} non riuscito.`);
    users.push(session.data.user.id);
  }
  assert.notEqual(users[0], users[1], 'Servono due account distinti.');
  const memberships = await Promise.all(clients.map((client, index) => read(client.from('space_members').select('space_id').eq('user_id', users[index]), 'membership')));
  const shared = memberships[0].find((row) => memberships[1].some((other) => other.space_id === row.space_id))?.space_id;
  assert.ok(shared, 'I due utenti non condividono uno spazio.');
  for (const table of ['recipes', 'household_profiles', 'meal_plans', 'meal_plan_items', 'shopping_items']) {
    const [a, b] = await Promise.all(clients.map((client) => rows(client, table, shared)));
    assert.deepEqual(a, b, `Visibilità differente: ${table}. Evita modifiche durante il test.`);
    console.log(`PASS ${table}: entrambi gli utenti vedono le stesse ${a.length} righe.`);
  }
  const preferences = await Promise.all(clients.map((client) => read(client.from('space_preferences').select('breakfast_enabled,snack_enabled').eq('space_id', shared).maybeSingle(), 'preferenze')));
  assert.deepEqual(preferences[0], preferences[1], 'Preferenze diverse tra i due utenti.');
  console.log('PASS preferenze: lettura coerente tra i due utenti.');
  const anonymous = createClient(url, key, options);
  for (const table of ['recipes', 'household_profiles', 'meal_plans', 'shopping_items', 'space_preferences']) {
    const result = await anonymous.from(table).select('space_id').eq('space_id', shared).limit(1);
    if (result.error && result.error.code !== '42501') throw new Error(`Controllo anonimo non conclusivo: ${table}.`);
    assert.equal(result.data?.length ?? 0, 0, `Dati accessibili senza sessione: ${table}.`);
  }
  console.log('PASS accesso anonimo: nessuna riga condivisa visibile.');
  const privateSpace = process.env.FOOD_TEST_PRIVATE_SPACE_ID;
  if (privateSpace) {
    assert.ok(memberships[1].some((row) => row.space_id === privateSpace), 'Lo spazio privato deve essere accessibile a B.');
    assert.ok(!memberships[0].some((row) => row.space_id === privateSpace), 'Lo spazio privato non deve essere accessibile ad A.');
    for (const table of ['recipes', 'household_profiles', 'meal_plans', 'meal_plan_items', 'shopping_items']) assert.deepEqual(await rows(clients[0], table, privateSpace), []);
    const hidden = await read(clients[0].from('spaces').select('id').eq('id', privateSpace), 'spazio privato');
    assert.equal(hidden.length, 0);
    console.log('PASS spazio privato di B non visibile ad A.');
  } else console.log('NON ESEGUITO: isolamento da uno spazio remoto esterno (manca FOOD_TEST_PRIVATE_SPACE_ID).');
  console.log('Controlli remoti in sola lettura completati; nessun dato applicativo modificato.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await Promise.allSettled(clients.map((client) => client.auth.signOut({ scope: 'local' })));
}
