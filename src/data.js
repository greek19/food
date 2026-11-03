const DEMO_STORE_KEY = "food.demo.data.v2";

const imageUrls = {
  zucchini: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80",
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=80",
  bowl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
  curry: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80",
  chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80",
  breakfast: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
};

const demoRecipes = [
  {
    id: "demo-zucchini",
    title: "Carbonara di zucchine",
    description: "Una pasta cremosa e vegetariana con zucchine, pecorino e pepe nero.",
    image_url: imageUrls.zucchini,
    meal_type: "lunch",
    cuisine: "Italiana",
    prep_minutes: 25,
    calories: 490,
    protein_g: 21,
    carbs_g: 58,
    fat_g: 17,
    servings: 2,
    ingredients: [
      { name: "Pasta integrale", quantity: 160, unit: "g", category: "Dispensa" },
      { name: "Zucchine", quantity: 300, unit: "g", category: "Ortofrutta" },
      { name: "Pecorino", quantity: 40, unit: "g", category: "Frigo" },
      { name: "Uova", quantity: 2, unit: "pz", category: "Frigo" },
    ],
    steps: ["Taglia le zucchine e saltale in padella.", "Cuoci la pasta al dente.", "Unisci uova e pecorino fuori dal fuoco, poi manteca."],
  },
  {
    id: "demo-salmon",
    title: "Salmone al sesamo",
    description: "Salmone glassato al sesamo con riso e verdure croccanti.",
    image_url: imageUrls.salmon,
    meal_type: "dinner",
    cuisine: "Mediterranea",
    prep_minutes: 30,
    calories: 580,
    protein_g: 35,
    carbs_g: 32,
    fat_g: 28,
    servings: 2,
    ingredients: [
      { name: "Filetti di salmone", quantity: 300, unit: "g", category: "Pescheria" },
      { name: "Riso basmati", quantity: 120, unit: "g", category: "Dispensa" },
      { name: "Sesamo", quantity: 20, unit: "g", category: "Dispensa" },
      { name: "Broccoli", quantity: 300, unit: "g", category: "Ortofrutta" },
    ],
    steps: ["Condisci il salmone con soia e sesamo.", "Cuoci il riso e i broccoli al vapore.", "Rosola il salmone e servi insieme."],
  },
  {
    id: "demo-bowl",
    title: "Bowl mediterranea",
    description: "Farro, ceci, verdure e feta: pronta in un quarto d'ora.",
    image_url: imageUrls.bowl,
    meal_type: "lunch",
    cuisine: "Mediterranea",
    prep_minutes: 15,
    calories: 420,
    protein_g: 16,
    carbs_g: 48,
    fat_g: 15,
    servings: 2,
    ingredients: [
      { name: "Farro perlato", quantity: 140, unit: "g", category: "Dispensa" },
      { name: "Ceci cotti", quantity: 240, unit: "g", category: "Dispensa" },
      { name: "Pomodorini", quantity: 250, unit: "g", category: "Ortofrutta" },
      { name: "Feta", quantity: 80, unit: "g", category: "Frigo" },
    ],
    steps: ["Cuoci il farro e lascialo intiepidire.", "Taglia le verdure e sbriciola la feta.", "Componi le bowl e condisci con olio e limone."],
  },
  {
    id: "demo-curry",
    title: "Curry di ceci",
    description: "Ceci, latte di cocco e spezie per una cena vegetale e saziante.",
    image_url: imageUrls.curry,
    meal_type: "dinner",
    cuisine: "Vegetariana",
    prep_minutes: 35,
    calories: 510,
    protein_g: 19,
    carbs_g: 62,
    fat_g: 18,
    servings: 2,
    ingredients: [
      { name: "Ceci cotti", quantity: 400, unit: "g", category: "Dispensa" },
      { name: "Latte di cocco", quantity: 200, unit: "ml", category: "Dispensa" },
      { name: "Spinaci", quantity: 200, unit: "g", category: "Ortofrutta" },
      { name: "Riso basmati", quantity: 120, unit: "g", category: "Dispensa" },
    ],
    steps: ["Soffriggi cipolla e spezie.", "Aggiungi ceci e latte di cocco.", "Completa con spinaci e servi con riso."],
  },
  {
    id: "demo-chicken",
    title: "Pollo al limone e verdure",
    description: "Petto di pollo tenero, limone e verdure di stagione.",
    image_url: imageUrls.chicken,
    meal_type: "dinner",
    cuisine: "Italiana",
    prep_minutes: 30,
    calories: 540,
    protein_g: 32,
    carbs_g: 35,
    fat_g: 21,
    servings: 2,
    ingredients: [
      { name: "Petto di pollo", quantity: 400, unit: "g", category: "Frigo" },
      { name: "Patate", quantity: 350, unit: "g", category: "Ortofrutta" },
      { name: "Zucchine", quantity: 250, unit: "g", category: "Ortofrutta" },
      { name: "Limoni", quantity: 2, unit: "pz", category: "Ortofrutta" },
    ],
    steps: ["Taglia patate e zucchine.", "Rosola il pollo con il limone.", "Cuoci tutto in forno fino a doratura."],
  },
];

const demoPeople = [
  { id: "person-greco", display_name: "Greco", goal: "Mantenimento", calorie_target: 2100, protein_target_g: 110, carbs_target_g: 260, fat_target_g: 70, dietary_preferences: "Onnivoro · Nessuna allergia" },
  { id: "person-martina", display_name: "Martina", goal: "Energia e benessere", calorie_target: 1800, protein_target_g: 90, carbs_target_g: 220, fat_target_g: 60, dietary_preferences: "Onnivora · Poco piccante" },
];

function isoDate(date) { return date.toISOString().slice(0, 10); }
function mondayOf(date = new Date()) { const result = new Date(date); const day = (result.getDay() + 6) % 7; result.setDate(result.getDate() - day); result.setHours(0, 0, 0, 0); return isoDate(result); }
function stableSeed(value) { return [...value].reduce((total, char) => total + char.charCodeAt(0), 0); }
function normalizeIngredient(value) { return value.trim().toLocaleLowerCase("it-IT").replace(/\s+/g, " "); }

function makeDemoPlan(recipeList = demoRecipes, weekStart = mondayOf()) {
  const lunch = recipeList.filter((recipe) => recipe.meal_type === "lunch");
  const dinner = recipeList.filter((recipe) => recipe.meal_type === "dinner");
  const seed = stableSeed(weekStart);
  return Array.from({ length: 7 }, (_, day) => ["lunch", "dinner"].map((mealType, index) => {
    const candidates = mealType === "lunch" ? lunch : dinner;
    if (!candidates.length) return null;
    const recipe = candidates[(seed + day + index) % candidates.length];
    return { id: `demo-plan-${weekStart}-${day}-${mealType}`, week_start: weekStart, day_of_week: day, meal_type: mealType, recipe_id: recipe.id, servings: 2, recipe };
  }).filter(Boolean)).flat();
}

function makeShopping(plan, recipeList) {
  const byId = new Map(recipeList.map((recipe) => [recipe.id, recipe]));
  const grouped = new Map();
  plan.forEach((item) => {
    const recipe = item.recipe ?? byId.get(item.recipe_id);
    if (!recipe) return;
    (recipe.ingredients ?? []).forEach((ingredient) => {
      const unit = ingredient.unit ?? "pz";
      const key = `${normalizeIngredient(ingredient.name)}|${unit}|${ingredient.category ?? "Altro"}`;
      const current = grouped.get(key) ?? { id: `shopping-${key}`, name: ingredient.name, quantity: 0, unit, category: ingredient.category ?? "Altro", checked: false };
      const scale = Number(item.servings ?? 1) / Number(recipe.servings ?? 1);
      current.quantity += Number(ingredient.quantity ?? 0) * scale;
      current.ingredient_key = key;
      grouped.set(key, current);
    });
  });
  return [...grouped.values()].sort((a, b) => `${a.category}${a.name}`.localeCompare(`${b.category}${b.name}`, "it"));
}

function readDemoStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_STORE_KEY) ?? "null");
    if (saved?.recipes?.length && saved?.people?.length) return saved;
  } catch { /* fallback to seed */ }
  const store = { recipes: demoRecipes, people: demoPeople, plan: makeDemoPlan(), shopping: [] };
  store.shopping = makeShopping(store.plan, store.recipes);
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  return store;
}

function writeDemoStore(store) { localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store)); return store; }

function mapRecipe(row) {
  return { ...row, ingredients: Array.isArray(row.ingredients) ? row.ingredients : [], steps: Array.isArray(row.steps) ? row.steps : [], servings: row.servings ?? 2 };
}

export function createFoodData({ auth }) {
  const remote = auth.mode === "supabase";
  const client = auth.getClient?.() ?? null;
  let spaceIdPromise;

  async function getSpaceId() {
    if (!remote || !client) return "demo-space";
    if (!spaceIdPromise) spaceIdPromise = (async () => {
      const session = await auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Sessione Supabase non disponibile.");
      const memberships = await client.from("space_members").select("space_id").eq("user_id", userId).limit(1);
      if (memberships.error) throw memberships.error;
      if (memberships.data?.[0]?.space_id) return memberships.data[0].space_id;
      const created = await client.from("spaces").insert({ name: "Casa FOOD", owner_id: userId }).select("id").single();
      if (created.error) throw created.error;
      const membership = await client.from("space_members").insert({ space_id: created.data.id, user_id: userId, role: "owner" });
      if (membership.error) throw membership.error;
      return created.data.id;
    })();
    return spaceIdPromise;
  }

  async function loadAll() {
    if (!remote) {
      const store = readDemoStore();
      const previous = new Map((store.shopping ?? []).map((item) => [item.id, item.checked]));
      const shopping = makeShopping(store.plan, store.recipes).map((item) => ({ ...item, checked: previous.get(item.id) ?? false }));
      return { ...store, shopping };
    }
    const spaceId = await getSpaceId();
    const [recipeResult, peopleResult, planResult] = await Promise.all([
      client.from("recipes").select("*").eq("space_id", spaceId).order("created_at", { ascending: false }),
      client.from("household_profiles").select("*").eq("space_id", spaceId).eq("is_active", true).order("created_at"),
      client.from("meal_plan_items").select("*, recipe:recipes(*) , meal_plan:meal_plans!inner(*)").eq("meal_plan.space_id", spaceId).eq("meal_plan.week_start", mondayOf()).order("day_of_week"),
    ]);
    [recipeResult, peopleResult, planResult].forEach((result) => { if (result.error) throw result.error; });
    const recipeList = recipeResult.data.map(mapRecipe);
    const plan = planResult.data.map((row) => ({ ...row, recipe: row.recipe ? mapRecipe(row.recipe) : null }));
    const mealPlanId = planResult.data?.[0]?.meal_plan?.id;
    const shoppingResult = mealPlanId ? await client.from("shopping_items").select("*").eq("meal_plan_id", mealPlanId).order("category").order("name") : { data: [] };
    if (shoppingResult.error) throw shoppingResult.error;
    return { recipes: recipeList, people: peopleResult.data, plan, shopping: shoppingResult.data ?? makeShopping(plan, recipeList) };
  }

  async function saveRecipe(recipe) {
    if (!remote) {
      const store = readDemoStore();
      const saved = { ...recipe, id: recipe.id ?? `demo-recipe-${Date.now()}` };
      const index = store.recipes.findIndex((item) => item.id === saved.id);
      index >= 0 ? store.recipes.splice(index, 1, saved) : store.recipes.unshift(saved);
      writeDemoStore(store);
      return saved;
    }
    const spaceId = await getSpaceId();
    const session = await auth.getSession();
    const payload = { ...recipe, space_id: spaceId, author_id: session.user.id };
    const result = await client.from("recipes").upsert(payload).select().single();
    if (result.error) throw result.error;
    return mapRecipe(result.data);
  }

  async function deleteRecipe(recipeId) {
    if (!remote) { const store = readDemoStore(); store.recipes = store.recipes.filter((recipe) => recipe.id !== recipeId); writeDemoStore(store); return; }
    const result = await client.from("recipes").delete().eq("id", recipeId);
    if (result.error) throw result.error;
  }

  async function savePerson(person) {
    if (!remote) { const store = readDemoStore(); const saved = { ...person, id: person.id ?? `demo-person-${Date.now()}` }; const index = store.people.findIndex((item) => item.id === saved.id); index >= 0 ? store.people.splice(index, 1, saved) : store.people.push(saved); writeDemoStore(store); return saved; }
    const spaceId = await getSpaceId();
    const result = await client.from("household_profiles").upsert({ ...person, space_id: spaceId }).select().single();
    if (result.error) throw result.error;
    return result.data;
  }

  async function savePlanItem(item) {
    if (!remote) { const store = readDemoStore(); const index = store.plan.findIndex((entry) => entry.id === item.id); index >= 0 ? store.plan.splice(index, 1, item) : store.plan.push(item); const previous = new Map((store.shopping ?? []).map((saved) => [saved.id, saved.checked])); store.shopping = makeShopping(store.plan, store.recipes).map((shopping) => ({ ...shopping, checked: previous.get(shopping.id) ?? false })); writeDemoStore(store); return item; }
    const spaceId = await getSpaceId();
    let plan = await client.from("meal_plans").select("id").eq("space_id", spaceId).eq("week_start", item.week_start).maybeSingle();
    if (plan.error) throw plan.error;
    if (!plan.data) {
      const session = await auth.getSession();
      plan = await client.from("meal_plans").insert({ space_id: spaceId, week_start: item.week_start, title: "Piano FOOD", created_by: session.user.id }).select("id").single();
      if (plan.error) throw plan.error;
    }
    const payload = { meal_plan_id: plan.data.id, recipe_id: item.recipe_id, day_of_week: item.day_of_week, meal_type: item.meal_type, servings: item.servings, notes: item.notes ?? "" };
    const result = await client.from("meal_plan_items").upsert(payload, { onConflict: "meal_plan_id,day_of_week,meal_type" }).select().single();
    if (result.error) throw result.error;
    return result.data;
  }

  async function generatePlan(weekStart = mondayOf(), recipeList, people) {
    if (!recipeList?.length) throw new Error("Aggiungi almeno una ricetta prima di generare il piano.");
    const generated = makeDemoPlan(recipeList, weekStart).map((item) => ({ ...item, servings: Math.max(1, people.length) }));
    if (!remote) { const store = readDemoStore(); const previous = new Map((store.shopping ?? []).map((saved) => [saved.id, saved.checked])); store.plan = generated; store.shopping = makeShopping(generated, recipeList).map((shopping) => ({ ...shopping, checked: previous.get(shopping.id) ?? false })); writeDemoStore(store); return generated; }
    for (const item of generated) await savePlanItem(item);
    await persistRemoteShopping(generated, recipeList, weekStart);
    return generated;
  }

  async function persistRemoteShopping(plan, recipeList, weekStart) {
    if (!remote) return;
    const spaceId = await getSpaceId();
    const planResult = await client.from("meal_plans").select("id").eq("space_id", spaceId).eq("week_start", weekStart).single();
    if (planResult.error) throw planResult.error;
    const items = makeShopping(plan, recipeList).map(({ id: _demoId, ...item }) => ({ ...item, space_id: spaceId, meal_plan_id: planResult.data.id }));
    const remove = await client.from("shopping_items").delete().eq("meal_plan_id", planResult.data.id);
    if (remove.error) throw remove.error;
    if (!items.length) return;
    const insert = await client.from("shopping_items").insert(items);
    if (insert.error) throw insert.error;
  }

  async function toggleShopping(itemId, checked) {
    if (!remote) { const store = readDemoStore(); store.shopping = makeShopping(store.plan, store.recipes).map((item) => item.id === itemId ? { ...item, checked } : { ...item, checked: (store.shopping ?? []).find((saved) => saved.id === item.id)?.checked ?? false }); writeDemoStore(store); return; }
    const result = await client.from("shopping_items").update({ checked }).eq("id", itemId);
    if (result.error) throw result.error;
  }

  return { remote, loadAll, saveRecipe, deleteRecipe, savePerson, savePlanItem, generatePlan, toggleShopping };
}

export function calculatePlanNutrition(plan, people = []) {
  const totals = plan.reduce((accumulator, item) => {
    const recipe = item.recipe;
    if (!recipe) return accumulator;
    const scale = Number(item.servings ?? 1) / Number(recipe.servings ?? 1);
    accumulator.calories += Number(recipe.calories ?? 0) * scale;
    accumulator.protein += Number(recipe.protein_g ?? 0) * scale;
    accumulator.carbs += Number(recipe.carbs_g ?? 0) * scale;
    accumulator.fat += Number(recipe.fat_g ?? 0) * scale;
    return accumulator;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const divisor = Math.max(1, people.length);
  return { ...totals, perPerson: { calories: totals.calories / divisor, protein: totals.protein / divisor, carbs: totals.carbs / divisor, fat: totals.fat / divisor } };
}

export { imageUrls, mondayOf };
