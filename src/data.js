import { matchesDiet, parseDietTags } from "./diets.js";
import { balanceDay } from "./nutrition.js";
import { PHOTO_BUCKET, validatePhoto, demoPhoto } from "./photos.js";
export { personPortions } from "./nutrition.js";

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
    title: "Zucchini carbonara",
    description: "Creamy vegetarian pasta with zucchini, pecorino, and black pepper.",
    image_url: imageUrls.zucchini,
    meal_type: "lunch",
    cuisine: "Italian",
    prep_minutes: 25,
    calories: 490,
    protein_g: 21,
    carbs_g: 58,
    fat_g: 17,
    servings: 2,
    ingredients: [
      { name: "Whole-wheat pasta", quantity: 160, unit: "g", category: "Pantry" },
      { name: "Zucchini", quantity: 300, unit: "g", category: "Produce" },
      { name: "Pecorino", quantity: 40, unit: "g", category: "Refrigerated" },
      { name: "Eggs", quantity: 2, unit: "pcs", category: "Refrigerated" },
    ],
    steps: ["Slice and sauté the zucchini.", "Cook the pasta until al dente.", "Remove from heat, add eggs and pecorino, and stir until creamy."],
  },
  {
    id: "demo-salmon",
    title: "Sesame salmon",
    description: "Sesame-glazed salmon with rice and crunchy vegetables.",
    image_url: imageUrls.salmon,
    meal_type: "dinner",
    cuisine: "Mediterranean",
    prep_minutes: 30,
    calories: 580,
    protein_g: 35,
    carbs_g: 32,
    fat_g: 28,
    servings: 2,
    ingredients: [
      { name: "Salmon fillets", quantity: 300, unit: "g", category: "Fish counter" },
      { name: "Basmati rice", quantity: 120, unit: "g", category: "Pantry" },
      { name: "Sesame", quantity: 20, unit: "g", category: "Pantry" },
      { name: "Broccoli", quantity: 300, unit: "g", category: "Produce" },
    ],
    steps: ["Season the salmon with soy sauce and sesame.", "Cook the rice and steam the broccoli.", "Sear the salmon and serve together."],
  },
  {
    id: "demo-bowl",
    title: "Mediterranean bowl",
    description: "Farro, chickpeas, vegetables, and feta, ready in fifteen minutes.",
    image_url: imageUrls.bowl,
    meal_type: "lunch",
    cuisine: "Mediterranean",
    prep_minutes: 15,
    calories: 420,
    protein_g: 16,
    carbs_g: 48,
    fat_g: 15,
    servings: 2,
    ingredients: [
      { name: "Pearled farro", quantity: 140, unit: "g", category: "Pantry" },
      { name: "Cooked chickpeas", quantity: 240, unit: "g", category: "Pantry" },
      { name: "Cherry tomatoes", quantity: 250, unit: "g", category: "Produce" },
      { name: "Feta", quantity: 80, unit: "g", category: "Refrigerated" },
    ],
    steps: ["Cook the farro and let it cool slightly.", "Chop the vegetables and crumble the feta.", "Assemble the bowls and dress with olive oil and lemon."],
  },
  {
    id: "demo-curry",
    title: "Chickpea curry",
    description: "Chickpeas, coconut milk, and spices for a satisfying plant-based dinner.",
    image_url: imageUrls.curry,
    meal_type: "dinner",
    cuisine: "Vegetarian",
    prep_minutes: 35,
    calories: 510,
    protein_g: 19,
    carbs_g: 62,
    fat_g: 18,
    servings: 2,
    ingredients: [
      { name: "Cooked chickpeas", quantity: 400, unit: "g", category: "Pantry" },
      { name: "Coconut milk", quantity: 200, unit: "ml", category: "Pantry" },
      { name: "Spinach", quantity: 200, unit: "g", category: "Produce" },
      { name: "Basmati rice", quantity: 120, unit: "g", category: "Pantry" },
    ],
    steps: ["Sauté the onion and spices.", "Add chickpeas and coconut milk.", "Add spinach and serve with rice."],
  },
  {
    id: "demo-chicken",
    title: "Lemon chicken and vegetables",
    description: "Tender chicken breast with lemon and seasonal vegetables.",
    image_url: imageUrls.chicken,
    meal_type: "dinner",
    cuisine: "Italian",
    prep_minutes: 30,
    calories: 540,
    protein_g: 32,
    carbs_g: 35,
    fat_g: 21,
    servings: 2,
    ingredients: [
      { name: "Chicken breast", quantity: 400, unit: "g", category: "Refrigerated" },
      { name: "Potatoes", quantity: 350, unit: "g", category: "Produce" },
      { name: "Zucchini", quantity: 250, unit: "g", category: "Produce" },
      { name: "Lemons", quantity: 2, unit: "pcs", category: "Produce" },
    ],
    steps: ["Chop the potatoes and zucchini.", "Sear the chicken with lemon.", "Bake until golden."],
  },
];

const demoPeople = [
  { id: "person-greco", display_name: "Greco", goal: "Maintenance", calorie_target: 2100, protein_target_g: 110, carbs_target_g: 260, fat_target_g: 70, dietary_preferences: "Omnivore · No allergies" },
  { id: "person-martina", display_name: "Martina", goal: "Energy and wellbeing", calorie_target: 1800, protein_target_g: 90, carbs_target_g: 220, fat_target_g: 60, dietary_preferences: "Omnivore · Mild flavors" },
];

function isoDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function mondayOf(date = new Date()) { const result = new Date(date); const day = (result.getDay() + 6) % 7; result.setDate(result.getDate() - day); result.setHours(0, 0, 0, 0); return isoDate(result); }
function stableSeed(value) { return [...value].reduce((total, char) => total + char.charCodeAt(0), 0); }
function normalizeIngredient(value) { return value.trim().toLocaleLowerCase("en-GB").replace(/\s+/g, " "); }
function recipeMealTypes(recipe) { return Array.isArray(recipe.meal_types) && recipe.meal_types.length ? recipe.meal_types : [recipe.meal_type ?? "dinner"]; }

function makeDemoPlan(recipeList = demoRecipes, weekStart = mondayOf()) {
  const lunch = recipeList.filter((recipe) => recipeMealTypes(recipe).includes("lunch"));
  const dinner = recipeList.filter((recipe) => recipeMealTypes(recipe).includes("dinner"));
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
      const unit = ingredient.unit ?? "pcs";
      const key = `${normalizeIngredient(ingredient.name)}|${unit}|${ingredient.category ?? "Other"}`;
      const current = grouped.get(key) ?? { id: `shopping-${key}`, name: ingredient.name, quantity: 0, unit, category: ingredient.category ?? "Other", checked: false };
      const scale = Number(item.servings ?? 1) / Number(recipe.servings ?? 1);
      current.quantity += Number(ingredient.quantity ?? 0) * scale;
      current.ingredient_key = key;
      grouped.set(key, current);
    });
  });
  return [...grouped.values()].sort((a, b) => `${a.category}${a.name}`.localeCompare(`${b.category}${b.name}`, "en"));
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
  const mealTypes = recipeMealTypes(row);
  return { ...row, meal_types: mealTypes, meal_type: row.meal_type ?? mealTypes[0], ingredients: Array.isArray(row.ingredients) ? row.ingredients : [], steps: Array.isArray(row.steps) ? row.steps : [], servings: row.servings ?? 2, fiber_g: row.fiber_g ?? 0 };
}

const allowedMealTypes = new Set(["breakfast", "lunch", "dinner", "snack"]);
function asNumber(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function asList(value) { return Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean) : []; }

export function parseRecipeImport(text) {
  const errors = [];
  let records;
  try {
    const parsed = JSON.parse(text);
    records = Array.isArray(parsed) ? parsed : parsed?.recipes;
    if (!Array.isArray(records)) throw new Error("JSON must be an array or an object with a recipes property.");
  } catch (error) {
    return { recipes: [], errors: [error instanceof SyntaxError ? "Invalid JSON." : error.message || "Invalid JSON."] };
  }
  const recipes = records.map((record, index) => {
    const rowNumber = index + 1;
    if (!record || typeof record !== "object") { errors.push(`Row ${rowNumber}: invalid item.`); return null; }
    const title = String(record.title ?? "").trim();
    const mealTypes = (Array.isArray(record.meal_types) ? record.meal_types : [record.meal_type ?? "dinner"]).map((item) => String(item).trim().toLowerCase()).filter(Boolean);
    const invalidMealTypes = mealTypes.filter((item) => !allowedMealTypes.has(item));
    if (!title) errors.push(`Row ${rowNumber}: title is required.`);
    if (!mealTypes.length || invalidMealTypes.length) errors.push(`Row ${rowNumber}: invalid meal_types (${invalidMealTypes.join(", ") || "empty"}).`);
    const servings = asNumber(record.servings, 0);
    if (servings <= 0) errors.push(`Row ${rowNumber}: servings must be greater than zero.`);
    if (!title || !mealTypes.length || invalidMealTypes.length || servings <= 0) return null;
    const ingredients = Array.isArray(record.ingredients) ? record.ingredients : [];
    let dietTags;
    try { dietTags = parseDietTags(record.diet_tags); } catch (error) { errors.push(`Row ${rowNumber}: ${error.message}`); return null; }
    const steps = asList(record.steps);
    return {
      title,
      diet_tags: dietTags,
      description: String(record.description ?? "").trim(),
      image_url: String(record.image_url ?? "").trim(),
      meal_types: [...new Set(mealTypes)],
      meal_type: mealTypes[0],
      cuisine: String(record.cuisine ?? "").trim(),
      prep_minutes: Math.max(0, Math.round(asNumber(record.prep_minutes, 0))),
      calories: Math.max(0, Math.round(asNumber(record.calories, 0))),
      protein_g: Math.max(0, asNumber(record.protein_g)),
      carbs_g: Math.max(0, asNumber(record.carbs_g)),
      fat_g: Math.max(0, asNumber(record.fat_g)),
      fiber_g: Math.max(0, asNumber(record.fiber_g)),
      servings,
      ingredients,
      steps,
    };
  }).filter(Boolean);
  return { recipes, errors };
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
      if (!userId) throw new Error("Supabase session unavailable.");
      const memberships = await client.from("space_members").select("space_id").eq("user_id", userId).limit(1);
      if (memberships.error) throw memberships.error;
      if (memberships.data?.[0]?.space_id) return memberships.data[0].space_id;
      const created = await client.from("spaces").insert({ name: "Home FOOD", owner_id: userId }).select("id").single();
      if (created.error) throw created.error;
      const membership = await client.from("space_members").insert({ space_id: created.data.id, user_id: userId, role: "owner" });
      if (membership.error) throw membership.error;
      return created.data.id;
    })();
    return spaceIdPromise;
  }

  async function loadAll(weekStart = mondayOf()) {
    if (!remote) {
      const store = readDemoStore();
      const previous = new Map((store.shopping ?? []).map((item) => [item.id, item.checked]));
      const plan = store.plan.filter((item) => item.week_start === weekStart).map((item) => ({ ...item, recipe: store.recipes.find((recipe) => recipe.id === item.recipe_id) }));
      const shopping = makeShopping(plan, store.recipes).map((item) => ({ ...item, checked: previous.get(item.id) ?? false }));
      return { ...store, plan, shopping, preferences: store.preferences ?? { breakfast_enabled: false, snack_enabled: false } };
    }
    const spaceId = await getSpaceId();
    const [recipeResult, peopleResult, planResult, preferences] = await Promise.all([
      client.from("recipes").select("*").eq("space_id", spaceId).order("created_at", { ascending: false }),
      client.from("household_profiles").select("*").eq("space_id", spaceId).eq("is_active", true).order("created_at"),
      client.from("meal_plan_items").select("*, recipe:recipes(*) , meal_plan:meal_plans!inner(*)").eq("meal_plan.space_id", spaceId).eq("meal_plan.week_start", weekStart).order("day_of_week"),
      loadPreferences(),
    ]);
    [recipeResult, peopleResult, planResult].forEach((result) => { if (result.error) throw result.error; });
    const rows = [...recipeResult.data, ...planResult.data.map((row) => row.recipe).filter(Boolean)];
    const paths = [...new Set(rows.map((row) => row.image_path).filter((path) => path?.startsWith(`${spaceId}/`)))];
    const signed = paths.length ? await client.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 86400) : { data: [] };
    const urls = new Map((signed.data ?? []).map((item) => [item.path, item.signedUrl]));
    const withPhoto = (row) => mapRecipe({ ...row, image_url: row.image_path ? urls.get(row.image_path) || '' : row.image_url });
    const recipeList = recipeResult.data.map(withPhoto);
    const plan = planResult.data.map((row) => ({ ...row, week_start: weekStart, recipe: row.recipe ? withPhoto(row.recipe) : null }));
    const mealPlanId = planResult.data?.[0]?.meal_plan?.id;
    const shoppingResult = mealPlanId ? await client.from("shopping_items").select("*").eq("meal_plan_id", mealPlanId).order("category").order("name") : { data: [] };
    if (shoppingResult.error) throw shoppingResult.error;
    return { recipes: recipeList, people: peopleResult.data, plan, shopping: shoppingResult.data ?? makeShopping(plan, recipeList), preferences };
  }

  async function loadPreferences() {
    const defaults = { breakfast_enabled: false, snack_enabled: false };
    if (!remote) return readDemoStore().preferences ?? defaults;
    const spaceId = await getSpaceId();
    const result = await client.from("space_preferences").select("breakfast_enabled,snack_enabled").eq("space_id", spaceId).maybeSingle();
    if (["PGRST205", "42P01"].includes(result.error?.code)) return { ...defaults, available: false };
    if (result.error) throw result.error;
    return result.data ?? defaults;
  }

  async function saveMealPreference(meal, enabled) {
    if (!["breakfast", "snack"].includes(meal) || typeof enabled !== "boolean") throw new Error("Invalid preference.");
    if (!remote) { const store = readDemoStore(); store.preferences = { ...(store.preferences ?? {}), [`${meal}_enabled`]: enabled }; writeDemoStore(store); return; }
    const spaceId = await getSpaceId();
    const result = await client.rpc("set_food_meal_preference", { p_space_id: spaceId, p_meal: meal, p_enabled: enabled });
    if (result.error?.code === "PGRST202") throw new Error("Shared preferences are not available yet. Complete the database update first.");
    if (result.error) throw result.error;
  }

  async function saveRecipe(recipe, photoFile = null) {
    if (photoFile) validatePhoto(photoFile);
    if (!remote) {
      const store = readDemoStore();
      const mealTypes = recipeMealTypes(recipe);
      const saved = { ...recipe, ...(photoFile ? { image_url: await demoPhoto(photoFile), image_path: null } : {}), meal_types: mealTypes, meal_type: mealTypes[0], id: recipe.id ?? `demo-recipe-${Date.now()}` };
      const index = store.recipes.findIndex((item) => item.id === saved.id);
      index >= 0 ? store.recipes.splice(index, 1, saved) : store.recipes.unshift(saved);
      writeDemoStore(store);
      return saved;
    }
    const spaceId = await getSpaceId();
    const session = await auth.getSession();
    const mealTypes = recipeMealTypes(recipe);
    const payload = { ...recipe, meal_types: mealTypes, meal_type: mealTypes[0], space_id: spaceId, author_id: session.user.id };
    delete payload.mealTypes;
    delete payload.ingredientsText;
    delete payload.stepsText;
    let uploadedPath;
    if (photoFile) {
      uploadedPath = `${spaceId}/${crypto.randomUUID()}.${validatePhoto(photoFile)}`;
      const upload = await client.storage.from(PHOTO_BUCKET).upload(uploadedPath, photoFile, { contentType: photoFile.type, upsert: false });
      if (upload.error) throw new Error('Photo upload failed. Check your connection and Storage setup.');
      payload.image_path = uploadedPath;
    }
    if (payload.image_path) payload.image_url = null;
    try {
      const result = await client.from("recipes").upsert(payload).select().single();
      if (result.error) throw result.error;
      return mapRecipe(result.data);
    } catch (error) {
      if (uploadedPath) await client.storage.from(PHOTO_BUCKET).remove([uploadedPath]).catch(() => {});
      throw error;
    }
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

  function planPayload(item) {
    if (!item.recipe_id || !Number.isFinite(Number(item.servings)) || Number(item.servings) <= 0) throw new Error("Choose a recipe and a valid serving count.");
    return { recipe_id: item.recipe_id, day_of_week: item.day_of_week, meal_type: item.meal_type, servings: Number(item.servings), notes: item.notes ?? "" };
  }

  async function persistPlan(weekStart, items, generate = false) {
    const spaceId = await getSpaceId();
    const result = await client.rpc("save_food_plan", {
      p_space_id: spaceId, p_week_start: weekStart, p_items: items.map(planPayload), p_generate: generate,
    });
    if (result.error) {
      if (result.error.code === "PGRST202") throw new Error("Database update required: apply migration 007 before saving the plan.");
      throw result.error;
    }
  }

  async function savePlanItem(item) {
    planPayload(item);
    if (!remote) {
      const store = readDemoStore();
      const index = store.plan.findIndex((entry) => entry.week_start === item.week_start && entry.day_of_week === item.day_of_week && entry.meal_type === item.meal_type);
      index >= 0 ? store.plan.splice(index, 1, item) : store.plan.push(item);
      const previous = new Map((store.shopping ?? []).map((saved) => [saved.id, saved.checked]));
      store.shopping = makeShopping(store.plan.filter((entry) => entry.week_start === item.week_start), store.recipes).map((shopping) => ({ ...shopping, checked: previous.get(shopping.id) ?? false }));
      writeDemoStore(store);
      return item;
    }
    await persistPlan(item.week_start, [item]);
    return item;
  }

  async function generatePlan(weekStart = mondayOf(), recipeList, people, meals = ["lunch", "dinner"]) {
    if (!recipeList?.length) throw new Error("Add at least one recipe before generating a plan.");
    const existing = await loadAll(weekStart);
    if (existing.plan.length) throw new Error("This week already has a plan. Edit individual meals instead.");
    const generated = buildPersonalPlan(recipeList, people, weekStart, meals);
    if (!remote) { const store = readDemoStore(); store.plan.push(...generated); store.shopping = makeShopping(generated, recipeList); writeDemoStore(store); return generated; }
    await persistPlan(weekStart, generated, true);
    return generated;
  }

  async function saveDay(items) {
    if (!items.length) throw new Error("No meals to balance.");
    if (items.some((item) => item.week_start !== items[0].week_start || item.day_of_week !== items[0].day_of_week)) throw new Error("Select meals from the same day.");
    items.forEach(planPayload);
    if (remote) { await persistPlan(items[0].week_start, items); return; }
    const store = readDemoStore();
    const replacements = new Map(items.map((item) => [`${item.week_start}|${item.day_of_week}|${item.meal_type}`, item]));
    store.plan = store.plan.map((item) => replacements.get(`${item.week_start}|${item.day_of_week}|${item.meal_type}`) ?? item);
    const checks = new Map(store.shopping.map((item) => [item.id, item.checked]));
    store.shopping = makeShopping(store.plan.filter((item) => item.week_start === items[0].week_start), store.recipes).map((item) => ({ ...item, checked: checks.get(item.id) ?? false }));
    writeDemoStore(store);
  }

  async function toggleShopping(itemId, checked) {
    if (!remote) { const store = readDemoStore(); store.shopping = makeShopping(store.plan, store.recipes).map((item) => item.id === itemId ? { ...item, checked } : { ...item, checked: (store.shopping ?? []).find((saved) => saved.id === item.id)?.checked ?? false }); writeDemoStore(store); return; }
    const result = await client.from("shopping_items").update({ checked }).eq("id", itemId);
    if (result.error) throw result.error;
  }

  return { remote, loadAll, loadPreferences, saveMealPreference, saveRecipe, deleteRecipe, savePerson, savePlanItem, saveDay, generatePlan, toggleShopping };
}

export function calculatePlanNutrition(plan, people = []) {
  const totals = plan.reduce((accumulator, item) => {
    const recipe = item.recipe;
    if (!recipe) return accumulator;
    const scale = Number(item.servings ?? 1);
    accumulator.calories += Number(recipe.calories ?? 0) * scale;
    accumulator.protein += Number(recipe.protein_g ?? 0) * scale;
    accumulator.carbs += Number(recipe.carbs_g ?? 0) * scale;
    accumulator.fat += Number(recipe.fat_g ?? 0) * scale;
    return accumulator;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const divisor = Math.max(1, people.length);
  return { ...totals, perPerson: { calories: totals.calories / divisor, protein: totals.protein / divisor, carbs: totals.carbs / divisor, fat: totals.fat / divisor } };
}

export function compatibleRecipe(recipe, people) {
  const ingredients = (recipe.ingredients ?? []).map((item) => normalizeIngredient(item.name)).join(" ");
  return people.every((person) => {
    if (!matchesDiet(recipe, person.diet_type)) return false;
    const excluded = String(person.excluded_foods ?? "").split(",").map((item) => normalizeIngredient(item)).filter(Boolean);
    return excluded.every((term) => !ingredients.includes(term));
  });
}

export function buildPersonalPlan(recipes, people, weekStart, meals) {
  const weights = { breakfast: 0.2, lunch: 0.35, dinner: 0.35, snack: 0.1 };
  const plan = Array.from({ length: 7 }, (_, day) => meals.map((mealType) => {
    const candidates = recipes.filter((recipe) => recipeMealTypes(recipe).includes(mealType) && compatibleRecipe(recipe, people) && Number(recipe.calories) > 0);
    if (!candidates.length) throw new Error(`No compatible recipe for ${mealType}. Check your recipes and exclusions.`);
    // Compare protein/carbohydrate/fat density at each person's calorie target.
    const ranked = candidates.map((recipe) => ({ recipe, score: people.reduce((score, person) => {
      const portions = Number(person.calorie_target) * weights[mealType] / recipe.calories;
      return score + [["protein_g", "protein_target_g"], ["carbs_g", "carbs_target_g"], ["fat_g", "fat_target_g"]].reduce((sum, [macro, target]) => {
        const goal = Number(person[target] || 0) * weights[mealType];
        return sum + (goal ? Math.abs(Number(recipe[macro] || 0) * portions - goal) / goal : 0);
      }, 0);
    }, 0) })).sort((a, b) => a.score - b.score);
    const best = ranked.slice(0, Math.min(3, ranked.length));
    const recipe = best[(stableSeed(weekStart) + day) % best.length].recipe;
    const portions = Object.fromEntries(people.map((person) => [person.id, Math.max(0.05, Math.round(Number(person.calorie_target) * weights[mealType] / recipe.calories * 100) / 100)]));
    return { id: `draft-${weekStart}-${day}-${mealType}`, week_start: weekStart, day_of_week: day, meal_type: mealType, recipe_id: recipe.id, recipe, servings: Object.values(portions).reduce((sum, value) => sum + value, 0) || 1, notes: JSON.stringify({ portions }) };
  })).flat();
  return Array.from({ length: 7 }, (_, day) => balanceDay(plan.filter((item) => item.day_of_week === day), people)).flat();
}

export { imageUrls, mondayOf };
