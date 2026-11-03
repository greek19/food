import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalPlan, calculatePlanNutrition, createFoodData, mondayOf, personPortions } from './data.js';

const recipe = { id: 'r', title: 'Pasta', meal_types: ['lunch', 'dinner'], calories: 500, protein_g: 20, servings: 2, ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }] };
const people = [{ id: 'a', calorie_target: 2000 }, { id: 'b', calorie_target: 1500 }];
test('targets produce distinct portions and nutrition uses values per serving', () => {
  const plan = buildPersonalPlan([recipe], people, '2026-11-02', ['lunch', 'dinner']);
  assert.equal(plan.length, 14);
  assert.deepEqual(personPortions(plan[0], people), { a: 1.4, b: 1.05 });
  assert.equal(calculatePlanNutrition([plan[0]], people).calories, 1225);
});
test('excluded ingredients prevent generation rather than silently ignoring preferences', () => {
  assert.throws(() => buildPersonalPlan([recipe], [{ ...people[0], excluded_foods: 'pasta' }], '2026-11-02', ['lunch']));
});
test('calendar preserves local Monday', () => {
  assert.equal(mondayOf(new Date(2026, 10, 8, 12)), '2026-11-02');
});
test('demo preserves other weeks and saved recipe changes and blocks duplicate generation', async () => {
  const memory = new Map();
  globalThis.localStorage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const adapter = createFoodData({ auth: { mode: 'demo' } });
  await adapter.generatePlan('2030-01-07', [recipe], people);
  const loaded = await adapter.loadAll('2030-01-07');
  assert.equal(loaded.plan.length, 14);
  await assert.rejects(adapter.generatePlan('2030-01-07', [recipe], people));
  assert.equal((await adapter.loadAll('2030-01-14')).plan.length, 0);
});

test('remote edits use a single atomic RPC and report a missing migration', async () => {
  const calls = [];
  const client = {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [{ space_id: 'space' }] }) }) }) }),
    rpc: async (name, payload) => { calls.push({ name, payload }); return { error: null }; },
  };
  const adapter = createFoodData({ auth: { mode: 'supabase', getClient: () => client, getSession: async () => ({ user: { id: 'user' } }) } });
  const item = { recipe_id: 'r', week_start: '2030-01-07', day_of_week: 0, meal_type: 'lunch', servings: 2, notes: '{"portions":{"a":2}}' };
  await adapter.savePlanItem(item);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'save_food_plan');
  assert.equal(calls[0].payload.p_generate, false);
  assert.equal(calls[0].payload.p_items[0].notes, item.notes);
  await assert.rejects(adapter.savePlanItem({ ...item, servings: 0 }));
  assert.equal(calls.length, 1);
  client.rpc = async () => ({ error: { code: 'PGRST202' } });
  await assert.rejects(adapter.savePlanItem(item), /migrazione 007/);
});

test('shared preferences default off and persist across demo adapter instances', async () => {
  const memory = new Map();
  globalThis.localStorage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const first = createFoodData({ auth: { mode: 'demo' } });
  assert.deepEqual(await first.loadPreferences(), { breakfast_enabled: false, snack_enabled: false });
  await first.saveMealPreference('breakfast', true);
  await first.saveMealPreference('snack', true);
  await first.saveMealPreference('breakfast', false);
  const second = createFoodData({ auth: { mode: 'demo' } });
  assert.deepEqual((await second.loadAll()).preferences, { breakfast_enabled: false, snack_enabled: true });
  await assert.rejects(first.saveMealPreference('lunch', true));
});

test('remote preferences save only the changed setting and surface permission errors', async () => {
  const calls = [];
  const client = {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [{ space_id: 'space' }] }), maybeSingle: async () => ({ data: { breakfast_enabled: true, snack_enabled: false } }) }) }) }),
    rpc: async (name, payload) => { calls.push({ name, payload }); return {}; },
  };
  const adapter = createFoodData({ auth: { mode: 'supabase', getClient: () => client, getSession: async () => ({ user: { id: 'user' } }) } });
  assert.equal((await adapter.loadPreferences()).breakfast_enabled, true);
  await adapter.saveMealPreference('snack', true);
  assert.deepEqual(calls[0], { name: 'set_food_meal_preference', payload: { p_space_id: 'space', p_meal: 'snack', p_enabled: true } });
  client.rpc = async () => ({ error: new Error('Accesso negato') });
  await assert.rejects(adapter.saveMealPreference('snack', false), /Accesso negato/);
  client.from = () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ error: { code: 'PGRST205' } }) }) }) });
  assert.deepEqual(await adapter.loadPreferences(), { breakfast_enabled: false, snack_enabled: false, available: false });
});
