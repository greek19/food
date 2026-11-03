export const dietOptions = [
  { value: "omnivore", label: "Onnivora" },
  { value: "vegetarian", label: "Vegetariana" },
  { value: "vegan", label: "Vegana" },
  { value: "pescatarian", label: "Pescetariana" },
];
export const recipeDietOptions = dietOptions.filter((option) => option.value !== "omnivore");

export function matchesDiet(recipe, diet = "omnivore") {
  const tags = recipe.diet_tags ?? [];
  if (diet === "omnivore") return true;
  if (diet === "vegan") return tags.includes("vegan");
  if (diet === "vegetarian") return tags.includes("vegetarian") || tags.includes("vegan");
  if (diet === "pescatarian") return tags.some((tag) => ["pescatarian", "vegetarian", "vegan"].includes(tag));
  return false;
}

export function parseDietTags(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((tag) => !recipeDietOptions.some((option) => option.value === tag))) throw new Error("diet_tags deve contenere solo vegetarian, vegan o pescatarian.");
  return [...new Set(value)];
}
