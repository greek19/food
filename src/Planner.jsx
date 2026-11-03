import { t, getLocale } from './i18n.js';
import { useEffect, useState } from "react";
import { RecipePicker } from "./RecipePicker.jsx";
import { balanceDay, mealShares } from "./nutrition.js";
import { mondayOf, personPortions, compatibleRecipe } from "./data.js";

const labels = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };
function dateAt(week, day = 0) {const date = new Date(`${week}T12:00:00`);date.setDate(date.getDate() + day);return date;}
function dateKey(date) {return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;}

export function Planner({ data, week, onWeek, onGenerate, onSave, onSaveDay, onPreference, onSyncPreferences }) {
  const [day, setDay] = useState((new Date().getDay() + 6) % 7);
  const optional = ["breakfast", "snack"].filter((meal) => data.preferences?.[`${meal}_enabled`]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState(null);
  const dayItems = data.plan.filter((item) => item.day_of_week === day);
  const preview = proposal?.week === week && proposal?.day === day ? proposal.items : null;
  const meals = Object.keys(labels).filter((meal) => ["lunch", "dinner"].includes(meal) || optional.includes(meal));
  async function run(action) {setBusy(true);setError("");try {await action();} catch (failure) {setError(failure.message || "Something went wrong. Please try again.");} finally {setBusy(false);}}
  function toggle(meal) {run(() => onPreference(meal, !optional.includes(meal)));}
  useEffect(() => {
    if (busy) return;
    let stopped = false;
    const sync = () => {if (!stopped && document.visibilityState === "visible") onSyncPreferences().catch(() => {if (!stopped) setError("Could not sync preferences. Refresh the page to try again.");});};
    const timer = window.setInterval(sync, 15000);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {stopped = true;window.clearInterval(timer);window.removeEventListener("focus", sync);document.removeEventListener("visibilitychange", sync);};
  }, [busy, onSyncPreferences]);
  return <>
    <div className="page-heading"><div><p className="eyebrow">{t("Your week")}</p><h1>{t("Weekly plan")}</h1><p>{t("Edit recipes and servings: your meal plan and shopping list are saved together.")}</p></div><button className="button button-dark" disabled={busy || data.plan.length > 0} onClick={() => run(() => onGenerate(meals))}>{busy ? t("Saving…") : data.plan.length ? t("Plan already generated") : t("Generate plan")}</button></div>
    {error && <p role="alert" className="planner-error">{t(error)}</p>}
    <section className="panel planner-panel"><div className="panel-heading"><div><p className="eyebrow">{t("Individual servings")}</p><h2>{t("Balance ")}{dateAt(week, day).toLocaleDateString(getLocale(), { weekday: "long", day: "numeric", month: "long" })}</h2></div><button className="button button-outline" disabled={busy || !dayItems.length || !data.people.length} onClick={() => {try {setProposal({ week, day, items: balanceDay(dayItems, data.people) });setError("");} catch (failure) {setError(failure.message);}}}>{t("Calculate proposal")}</button></div><p className="heading-copy">{t("Balance calories and macros across saved meals, including hidden ones. Recipes stay the same; proposed servings are saved only after confirmation.")}</p>{preview && <><p>{t("Target share covered by the saved meals: ")}{Math.round([...new Set(preview.map((item) => item.meal_type))].reduce((sum, meal) => sum + mealShares[meal], 0) * 100)}{t("%.")}</p><div className="balance-preview">{preview.map((item) => <div key={item.meal_type}><strong>{t(labels[item.meal_type])}{t(" \xB7 ")}{item.recipe.title}</strong>{data.people.map((person) => <span key={person.id}>{person.display_name}{t(": ")}{Number(personPortions(dayItems.find((entry) => entry.meal_type === item.meal_type), data.people)[person.id] || 0).toFixed(2)}{t(" \u2192 ")}{personPortions(item, data.people)[person.id]}{t(" servings")}</span>)}</div>)}</div><div className="meal-editor-actions"><button className="button button-outline" disabled={busy} onClick={() => setProposal(null)}>{t("Cancel")}</button><button className="button button-dark" disabled={busy} onClick={() => run(async () => {await onSaveDay(preview);setProposal(null);})}>{t("Apply and save day")}</button></div></>}</section>
    {data.preferences?.available === false && <p role="status" className="planner-error">{t("Shared preferences will be available after the database update. Your meal plan remains available.")}</p>}
    <div className="planner-toolbar"><div className="planner-week-controls"><label className="planner-date">{t("Week starting ")}<input type="date" value={week} disabled={busy} onChange={(event) => event.target.value && onWeek(mondayOf(dateAt(event.target.value)))} /></label><button className="button button-outline" disabled={busy} onClick={() => onWeek(mondayOf())}>{t("Today")}</button></div><div className="planner-toggles"><span className="planner-control-caption">{t("Include in plan")}</span>{["breakfast", "snack"].map((meal) => <label className="planner-toggle" key={meal}><input type="checkbox" disabled={busy || data.preferences?.available === false} checked={optional.includes(meal)} onChange={() => toggle(meal)} /><span className="toggle-track" aria-hidden="true" /><span>{t(labels[meal])}</span></label>)}</div></div>
    <p className="heading-copy">{t("Turning off a meal time hides its meals without deleting them. Initial shares are 35% each for lunch and dinner, 20% for breakfast, and 10% for snacks; balancing adjusts servings to your macro targets.")}</p>
    <div className="week-strip planner-week-strip"><button className="planner-week-arrow" aria-label={t("Previous week")} disabled={busy} onClick={() => onWeek(dateKey(dateAt(week, -7)))}><Chevron direction="left" /></button><div className="planner-days">{Array.from({ length: 7 }, (_, index) => {const date = dateAt(week, index);return <button key={index} className={`day-pill${day === index ? " is-active" : ""}`} aria-current={dateKey(date) === dateKey(new Date()) ? "date" : undefined} onClick={() => setDay(index)}><small>{date.toLocaleDateString(getLocale(), { weekday: "short" })}</small><strong>{date.getDate()}</strong>{dateKey(date) === dateKey(new Date()) && <span className="day-dot" />}</button>;})}</div><button className="planner-week-arrow" aria-label={t("Next week")} disabled={busy} onClick={() => onWeek(dateKey(dateAt(week, 7)))}><Chevron direction="right" /></button></div>
    <section className="panel planner-panel"><h2>{dateAt(week, day).toLocaleDateString(getLocale(), { weekday: "long", day: "numeric", month: "long" })}</h2>{meals.map((meal) => <MealEditor key={`${week}-${day}-${meal}-${data.plan.find((item) => item.day_of_week === day && item.meal_type === meal)?.notes ?? ""}`} meal={meal} day={day} week={week} data={data} busy={busy} save={(item) => {setProposal(null);return run(() => onSave(item));}} />)}</section>
    <section className="panel planner-panel"><h2>{t("Daily summary by person")}</h2>{data.people.map((person) => {const totals = data.plan.filter((item) => item.day_of_week === day).reduce((sum, item) => {const portions = personPortions(item, data.people)[person.id] || 0;return { kcal: sum.kcal + Number(item.recipe?.calories || 0) * portions, protein: sum.protein + Number(item.recipe?.protein_g || 0) * portions };}, { kcal: 0, protein: 0 });return <p key={person.id}><strong>{person.display_name}</strong>{t(": ")}{Math.round(totals.kcal)}{t(" / ")}{person.calorie_target}{t(" kcal \xB7 ")}{Math.round(totals.protein)}{t(" / ")}{person.protein_target_g}{t(" g protein")}</p>;})}</section>
  </>;
}

function MealEditor({ meal, day, week, data, busy, save }) {
  const item = data.plan.find((entry) => entry.day_of_week === day && entry.meal_type === meal);
  const [recipeId, setRecipeId] = useState(item?.recipe_id || "");
  const [portions, setPortions] = useState(personPortions(item || {}, data.people));
  const candidates = data.recipes.filter((recipe) => (recipe.meal_types || [recipe.meal_type]).includes(meal) && compatibleRecipe(recipe, data.people));
  const recipe = data.recipes.find((entry) => entry.id === recipeId);
  const compatible = candidates.some((entry) => entry.id === recipeId);
  return <form className="meal-editor" onSubmit={(event) => {event.preventDefault();if (!compatible) return;const servings = Object.values(portions).reduce((sum, value) => sum + Number(value), 0);save({ ...item, id: item?.id || `draft-${week}-${day}-${meal}`, week_start: week, day_of_week: day, meal_type: meal, recipe_id: recipeId, recipe, servings, notes: JSON.stringify({ portions }) });}}><div className="meal-editor-heading"><span className="meal-editor-icon" aria-hidden="true">{meal === "lunch" ? "☀" : meal === "dinner" ? "☾" : "◷"}</span><h3>{t(labels[meal])}</h3><span>{recipe ? t(`${recipe.calories} kcal / serving`) : t("Choose your meal")}</span></div>{recipeId && !compatible && <p role="status" className="planner-error">{t("This meal no longer matches the current profiles. Choose a compatible recipe before saving.")}</p>}<RecipePicker recipes={candidates} value={recipeId} onChange={setRecipeId} disabled={busy} /><div className="planner-controls">{data.people.map((person) => <label key={person.id}>{person.display_name}{t(" \xB7 servings")}<input required type="number" min="0.05" max="20" step="0.01" value={portions[person.id] ?? 1} onChange={(event) => setPortions({ ...portions, [person.id]: Number(event.target.value) })} /></label>)}</div><div className="meal-editor-actions"><button className="button button-outline" type="button" disabled={!recipe || busy} onClick={() => {const weight = { breakfast: 0.2, lunch: 0.35, dinner: 0.35, snack: 0.1 }[meal];if (!recipe.calories) return;setPortions(Object.fromEntries(data.people.map((person) => [person.id, Math.max(0.05, Math.round(person.calorie_target * weight / recipe.calories * 100) / 100)])));}}>{t("Recalculate servings from targets")}</button> <button className="button button-dark" disabled={busy || !compatible} type="submit">{t("Save meal")}</button></div></form>;
}

function Chevron({ direction }) {return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} /></svg>;}
