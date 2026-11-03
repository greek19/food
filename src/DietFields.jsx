import { dietOptions, recipeDietOptions } from "./diets.js";

export function PersonDietField({ value, onChange }) {
  return <label>Diet type<select value={value ?? "omnivore"} onChange={(event) => onChange(event.target.value)}>{dietOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>The plan suggests recipes compatible with everyone.</small></label>;
}

export function RecipeDietField({ value = [], onChange }) {
  return <fieldset className="meal-type-fieldset diet-fieldset"><legend>Diet compatibility</legend><div className="meal-type-picker">{recipeDietOptions.map((option) => <label className={`meal-type-option${value.includes(option.value) ? " is-selected" : ""}`} key={option.value}><input type="checkbox" checked={value.includes(option.value)} onChange={() => onChange(value.includes(option.value) ? value.filter((tag) => tag !== option.value) : [...value, option.value])} />{option.label}</label>)}</div><small>Select only diets verified against the ingredients. No selection means unclassified. Vegan recipes also suit vegetarian and pescatarian diets.</small></fieldset>;
}
