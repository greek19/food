import { useEffect, useId, useState } from "react";

export function RecipePicker({ recipes, value, onChange, disabled }) {
  const id = useId();
  const selected = recipes.find((recipe) => recipe.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = recipes.filter((recipe) => `${recipe.title} ${recipe.cuisine || ""}`.toLocaleLowerCase("en").includes(query.trim().toLocaleLowerCase("en")));
  useEffect(() => { if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, id]);
  function choose(recipe) { onChange(recipe.id); setQuery(""); setOpen(false); setActive(0); }
  return <div className="recipe-picker" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(""); } }}>
    <label htmlFor={id}>Recipe</label>
    <div className={`recipe-picker-field${open ? " is-open" : ""}`}><span aria-hidden="true">⌕</span><input id={id} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && results[active] ? `${id}-${active}` : undefined} disabled={disabled} value={open ? query : selected?.title || ""} placeholder={selected?.title || "Search recipes…"} onFocus={() => { setOpen(true); setActive(0); }} onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true); }} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); setQuery(""); }
      if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); setActive((index) => Math.max(0, Math.min(results.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))); }
      if (event.key === "Enter" && open) { event.preventDefault(); if (results[active]) choose(results[active]); }
    }} /><span aria-hidden="true" className="picker-chevron">⌄</span></div>
    {open && <div id={`${id}-list`} role="listbox" aria-label="Available recipes" className="recipe-picker-results">{results.length ? results.map((recipe, index) => <button id={`${id}-${index}`} type="button" role="option" aria-selected={recipe.id === value} className={active === index ? "is-highlighted" : ""} key={recipe.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(recipe)}><span><strong>{recipe.title}</strong><small>{recipe.cuisine || "Recipe"} · {recipe.calories || 0} kcal / serving</small></span>{recipe.id === value && <span aria-hidden="true">✓</span>}</button>) : <p>No recipes found.</p>}</div>}
  </div>;
}
