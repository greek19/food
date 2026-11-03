import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalPlan, calculatePlanNutrition, createFoodData, mondayOf, personPortions, compatibleRecipe, parseRecipeImport } from './data.js';
import { matchesDiet } from './diets.js';
import { balanceDay } from './nutrition.js';

const recipe = { id: 'r', title: 'Pasta', meal_types: ['lunch', 'dinner'], calories: 500, protein_g: 20, servings: 2, ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }] };
const people = [{ id: 'a', calorie_target: 2000 }, { id: 'b', calorie_target: 1500 }];

test('day balancing improves joint macro error without changing recipes or input', () => {
  const person = { id: 'a', calorie_target: 2000, protein_target_g: 150, carbs_target_g: 200, fat_target_g: 60 };
  const items = ['lunch', 'dinner'].map((meal, index) => ({ week_start: '2030-01-07', day_of_week: 0, meal_type: meal, recipe_id: `r${index}`, servings: 1.4, recipe: { calories: 500, protein_g: index ? 10 : 70, carbs_g: index ? 100 : 5, fat_g: 15 }, notes: '{"portions":{"a":1.4},"text":"keep"}' }));
  const copy = JSON.stringify(items);
  const score = (rows) => { const totals = calculatePlanNutrition(rows, [person]); return [[totals.calories,1400,4],[totals.protein,105,1],[totals.carbs,140,1],[totals.fat,42,1]].reduce((sum,[actual,target,weight]) => sum + weight*((actual-target)/target)**2,0); };
  const balanced = balanceDay(items, [person]);
  assert.ok(score(balanced) < score(items));
  assert.equal(JSON.stringify(items), copy);
  assert.deepEqual(balanced.map((item) => item.recipe_id), ['r0', 'r1']);
  assert.equal(JSON.parse(balanced[0].notes).text, 'keep');
  assert.ok(balanced.every((item) => item.servings >= 0.7 && item.servings <= 2.1));
});

test('disabled meal slots do not inflate calorie targets and a day saves in one RPC', async () => {
  const base = { week_start: '2030-01-07', day_of_week: 0, recipe_id: 'r', recipe: { calories: 500 } };
  const rows = balanceDay([{ ...base, meal_type: 'lunch' }, { ...base, meal_type: 'dinner' }], people);
  assert.equal(calculatePlanNutrition(rows, people).calories, 2450);
  const calls=[];
  const client={ from:()=>({select:()=>({eq:()=>({limit:async()=>({data:[{space_id:'space'}]})})})}), rpc:async(name,payload)=>{calls.push({name,payload});return {}} };
  const adapter=createFoodData({auth:{mode:'supabase',getClient:()=>client,getSession:async()=>({user:{id:'u'}})}});
  await adapter.saveDay(rows);
  assert.equal(calls.length,1);
  assert.equal(calls[0].payload.p_items.length,2);
  await assert.rejects(adapter.saveDay([rows[0],{...rows[1],day_of_week:1}]));
});

test('diet compatibility is explicit and respects vegan/vegetarian/pescatarian inheritance', () => {
  assert.equal(matchesDiet(recipe, 'omnivore'), true);
  assert.equal(matchesDiet(recipe, 'vegetarian'), false);
  assert.equal(matchesDiet({ ...recipe, diet_tags: ['vegan'] }, 'vegetarian'), true);
  assert.equal(matchesDiet({ ...recipe, diet_tags: ['vegetarian'] }, 'vegan'), false);
  assert.equal(matchesDiet({ ...recipe, diet_tags: ['vegetarian'] }, 'pescatarian'), true);
  assert.equal(matchesDiet({ ...recipe, diet_tags: ['pescatarian'] }, 'vegetarian'), false);
  const vegan = { ...recipe, diet_tags: ['vegan'] };
  assert.equal(compatibleRecipe(vegan, [{ diet_type: 'vegan' }, { diet_type: 'vegetarian' }]), true);
  assert.equal(compatibleRecipe(vegan, [{ diet_type: 'vegan', excluded_foods: 'pasta' }]), false);
  assert.throws(() => buildPersonalPlan([recipe], [{ ...people[0], diet_type: 'vegan' }], '2030-01-07', ['lunch']));
});

test('JSON import preserves diet classifications and rejects unknown tags', () => {
  const valid = parseRecipeImport(JSON.stringify([{ ...recipe, diet_tags: ['vegan', 'vegan'] }]));
  assert.deepEqual(valid.recipes[0].diet_tags, ['vegan']);
  assert.equal(valid.errors.length, 0);
  const invalid = parseRecipeImport(JSON.stringify([{ ...recipe, diet_tags: ['invented'] }]));
  assert.equal(invalid.recipes.length, 0);
  assert.equal(invalid.errors.length, 1);
});
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
