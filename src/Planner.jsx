import { useState } from "react";
import { RecipePicker } from "./RecipePicker.jsx";
import { mondayOf, personPortions, compatibleRecipe } from "./data.js";

const labels = { breakfast: "Colazione", lunch: "Pranzo", dinner: "Cena", snack: "Snack" };
function dateAt(week, day = 0) { const date = new Date(`${week}T12:00:00`); date.setDate(date.getDate() + day); return date; }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function Planner({ data, week, onWeek, onGenerate, onSave }) {
  const [day, setDay] = useState((new Date().getDay() + 6) % 7);
  const [optional, setOptional] = useState(() => { try { const saved = JSON.parse(localStorage.getItem("food.optionalMeals") || "[]"); return Array.isArray(saved) ? saved.filter((meal) => ["breakfast", "snack"].includes(meal)) : []; } catch { return []; } });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const meals = Object.keys(labels).filter((meal) => ["lunch", "dinner"].includes(meal) || optional.includes(meal));
  async function run(action) { setBusy(true); setError(""); try { await action(); } catch (failure) { setError(failure.message || "Operazione non riuscita. Riprova."); } finally { setBusy(false); } }
  function toggle(meal) { const next = optional.includes(meal) ? optional.filter((item) => item !== meal) : [...optional, meal]; setOptional(next); localStorage.setItem("food.optionalMeals", JSON.stringify(next)); }
  return <>
    <div className="page-heading"><div><p className="eyebrow">La vostra settimana</p><h1>Piano settimanale</h1><p>Modifica ricette e porzioni: piano e spesa vengono salvati insieme.</p></div><button className="button button-dark" disabled={busy || data.plan.length > 0} onClick={() => run(() => onGenerate(meals))}>{busy ? "Salvataggio…" : data.plan.length ? "Piano già generato" : "Genera piano"}</button></div>
    {error && <p role="alert" className="planner-error">{error}</p>}
    <div className="planner-toolbar"><div className="planner-week-controls"><label className="planner-date">Settimana del <input type="date" value={week} disabled={busy} onChange={(event) => event.target.value && onWeek(mondayOf(dateAt(event.target.value)))} /></label><button className="button button-outline" disabled={busy} onClick={() => onWeek(mondayOf())}>Oggi</button></div><div className="planner-toggles"><span className="planner-control-caption">Includi nel piano</span>{["breakfast", "snack"].map((meal) => <label className="planner-toggle" key={meal}><input type="checkbox" checked={optional.includes(meal)} onChange={() => toggle(meal)} /><span className="toggle-track" aria-hidden="true" /><span>{labels[meal]}</span></label>)}</div></div>
    <p className="heading-copy">Disattivare un momento nasconde i pasti senza cancellarli. Le porzioni automatiche coprono il 35% del target a pranzo e cena, il 20% a colazione e il 10% negli snack.</p>
    <div className="week-strip planner-week-strip"><button className="planner-week-arrow" aria-label="Settimana precedente" disabled={busy} onClick={() => onWeek(dateKey(dateAt(week, -7)))}><Chevron direction="left" /></button><div className="planner-days">{Array.from({ length: 7 }, (_, index) => { const date = dateAt(week, index); return <button key={index} className={`day-pill${day === index ? " is-active" : ""}`} aria-current={dateKey(date) === dateKey(new Date()) ? "date" : undefined} onClick={() => setDay(index)}><small>{date.toLocaleDateString("it-IT", { weekday: "short" })}</small><strong>{date.getDate()}</strong>{dateKey(date) === dateKey(new Date()) && <span className="day-dot" />}</button>; })}</div><button className="planner-week-arrow" aria-label="Settimana successiva" disabled={busy} onClick={() => onWeek(dateKey(dateAt(week, 7)))}><Chevron direction="right" /></button></div>
    <section className="panel planner-panel"><h2>{dateAt(week, day).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</h2>{meals.map((meal) => <MealEditor key={`${week}-${day}-${meal}`} meal={meal} day={day} week={week} data={data} busy={busy} save={(item) => run(() => onSave(item))} />)}</section>
    <section className="panel planner-panel"><h2>Riepilogo individuale del giorno</h2>{data.people.map((person) => { const totals = data.plan.filter((item) => item.day_of_week === day).reduce((sum, item) => { const portions = personPortions(item, data.people)[person.id] || 0; return { kcal: sum.kcal + Number(item.recipe?.calories || 0) * portions, protein: sum.protein + Number(item.recipe?.protein_g || 0) * portions }; }, { kcal: 0, protein: 0 }); return <p key={person.id}><strong>{person.display_name}</strong>: {Math.round(totals.kcal)} / {person.calorie_target} kcal · {Math.round(totals.protein)} / {person.protein_target_g} g proteine</p>; })}</section>
  </>;
}

function MealEditor({ meal, day, week, data, busy, save }) {
  const item = data.plan.find((entry) => entry.day_of_week === day && entry.meal_type === meal);
  const [recipeId, setRecipeId] = useState(item?.recipe_id || "");
  const [portions, setPortions] = useState(personPortions(item || {}, data.people));
  const candidates = data.recipes.filter((recipe) => (recipe.meal_types || [recipe.meal_type]).includes(meal) && compatibleRecipe(recipe, data.people));
  const recipe = data.recipes.find((entry) => entry.id === recipeId);
  return <form className="meal-editor" onSubmit={(event) => { event.preventDefault(); const servings = Object.values(portions).reduce((sum, value) => sum + Number(value), 0); save({ ...item, id: item?.id || `draft-${week}-${day}-${meal}`, week_start: week, day_of_week: day, meal_type: meal, recipe_id: recipeId, recipe, servings, notes: JSON.stringify({ portions }) }); }}><div className="meal-editor-heading"><span className="meal-editor-icon" aria-hidden="true">{meal === "lunch" ? "☀" : meal === "dinner" ? "☾" : "◷"}</span><h3>{labels[meal]}</h3><span>{recipe ? `${recipe.calories} kcal / porzione` : "Scegli il tuo pasto"}</span></div><RecipePicker recipes={candidates} value={recipeId} onChange={setRecipeId} disabled={busy} /><div className="planner-controls">{data.people.map((person) => <label key={person.id}>{person.display_name} · porzioni<input required type="number" min="0.05" max="20" step="0.01" value={portions[person.id] ?? 1} onChange={(event) => setPortions({ ...portions, [person.id]: Number(event.target.value) })} /></label>)}</div><div className="meal-editor-actions"><button className="button button-outline" type="button" disabled={!recipe || busy} onClick={() => { const weight = { breakfast: 0.2, lunch: 0.35, dinner: 0.35, snack: 0.1 }[meal]; if (!recipe.calories) return; setPortions(Object.fromEntries(data.people.map((person) => [person.id, Math.max(0.05, Math.round(person.calorie_target * weight / recipe.calories * 100) / 100)]))); }}>Ricalcola porzioni dai target</button> <button className="button button-dark" disabled={busy || !recipeId} type="submit">Salva pasto</button></div></form>;
}

function Chevron({ direction }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} /></svg>; }
