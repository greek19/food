export const mealShares = { breakfast: 0.2, lunch: 0.35, dinner: 0.35, snack: 0.1 };

export function personPortions(item, people) {
  try { const parsed = JSON.parse(item.notes || "{}"); if (parsed.portions) return parsed.portions; } catch { /* Legacy notes. */ }
  return Object.fromEntries(people.map((person) => [person.id, Number(item.servings || 1) / Math.max(1, people.length)]));
}

// Bounded coordinate descent: compare the entire day's nutrients, keeping each
// meal between half and one-and-a-half of its calorie-based starting portion.
export function balanceDay(items, people) {
  if (!items.length) return [];
  const fraction = [...new Set(items.map((item) => item.meal_type))].reduce((sum, meal) => sum + (mealShares[meal] || 0), 0);
  const portions = items.map((item) => ({ ...personPortions(item, people) }));
  for (const person of people) {
    if (!(Number(person.calorie_target) > 0) || items.some((item) => !(Number(item.recipe?.calories) > 0))) throw new Error("Calories targets and recipe calories must be greater than zero.");
    const targets = [person.calorie_target, person.protein_target_g, person.carbs_target_g, person.fat_target_g].map((value) => Number(value || 0) * fraction);
    const base = items.map((item) => Number(person.calorie_target) * mealShares[item.meal_type] / item.recipe.calories);
    const nutrients = items.map((item) => [item.recipe.calories, item.recipe.protein_g, item.recipe.carbs_g, item.recipe.fat_g].map((value) => Number(value || 0)));
    const values = [...base];
    for (let pass = 0; pass < 40; pass += 1) {
      for (let index = 0; index < items.length; index += 1) {
        let numerator = 0.1 / Math.max(base[index], 0.05);
        let denominator = 0.1 / Math.max(base[index], 0.05) ** 2;
        for (let macro = 0; macro < 4; macro += 1) {
          if (targets[macro] <= 0) continue;
          const weight = (macro === 0 ? 4 : 1) / targets[macro] ** 2;
          const other = nutrients.reduce((sum, row, j) => sum + (j === index ? 0 : row[macro] * values[j]), 0);
          numerator += weight * nutrients[index][macro] * (targets[macro] - other);
          denominator += weight * nutrients[index][macro] ** 2;
        }
        values[index] = Math.max(0.05, Math.max(base[index] * 0.5, Math.min(base[index] * 1.5, numerator / denominator)));
      }
    }
    values.forEach((value, index) => { portions[index][person.id] = Math.round(value * 100) / 100; });
  }
  return items.map((item, index) => {
    let notes = {}; try { notes = JSON.parse(item.notes || "{}"); } catch { notes = { text: item.notes }; }
    return { ...item, servings: Object.values(portions[index]).reduce((sum, value) => sum + Number(value), 0), notes: JSON.stringify({ ...notes, portions: portions[index] }) };
  });
}
