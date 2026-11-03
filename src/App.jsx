import { useEffect, useState } from "react";

const pageLabels = {
  dashboard: "Dashboard",
  recipes: "Ricette",
  plan: "Piano settimanale",
  shopping: "Lista della spesa",
  settings: "Impostazioni",
};

const recipes = [
  { title: "Carbonara di zucchine", category: "Pranzo · Vegetariano", image: "recipe-image-zucchini", time: "25 min", kcal: 490, protein: 21, carbs: 58 },
  { title: "Salmone al sesamo", category: "Cena · Pesce", image: "recipe-image-salmon", time: "30 min", kcal: 580, protein: 35, carbs: 32, saved: true },
  { title: "Bowl mediterranea", category: "Pranzo · Vegetariano", image: "recipe-image-bowl", time: "15 min", kcal: 420, protein: 16, carbs: 48 },
  { title: "Curry di ceci", category: "Cena · Vegetariano", image: "recipe-image-curry", time: "35 min", kcal: 510, protein: 19, carbs: 62 },
];

function AuthScreen({ auth, onAuthenticated }) {
  const [email, setEmail] = useState("greco@food.local");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("Verifica in corso…");
    setIsError(false);
    try {
      const session = await auth.signIn(email.trim(), password);
      onAuthenticated(session);
    } catch (error) {
      setFeedback(error.message || "Accesso non riuscito.");
      setIsError(true);
    }
  };

  const continueDemo = async () => {
    const session = await auth.continueDemo();
    onAuthenticated(session);
  };

  return (
    <section className="auth-screen is-visible" aria-labelledby="auth-title">
      <div className="auth-card">
        <div className="auth-brand"><div className="brand-mark" aria-hidden="true">F</div><span>FOOD<span>.</span></span></div>
        <p className="eyebrow accent-eyebrow">Spazio privato condiviso</p>
        <h1 id="auth-title">Bentornati a tavola.</h1>
        <p className="auth-copy">Accedi al vostro spazio per ritrovare ricette, piano e lista della spesa.</p>
        <div className={`auth-mode${auth.mode === "unconfigured" ? " auth-mode-warning" : ""}`}><span></span> {auth.mode === "supabase" ? "Supabase configurato" : auth.mode === "demo" ? "Modalità demo locale" : "Configurazione richiesta"}</div>
        {auth.mode === "unconfigured" ? <div className="auth-config-panel"><strong>Accesso privato non ancora configurato.</strong><p>Per pubblicare il portale devi aggiungere <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> nelle variabili del repository GitHub Actions.</p></div> : <><form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" placeholder="Inserisci la password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="button button-dark auth-submit" type="submit">Accedi <span>→</span></button>
        </form>{auth.mode === "demo" && <button className="auth-demo-button" type="button" onClick={continueDemo}>Continua senza account <span>↗</span></button>}</>}
        <p className={`auth-feedback${isError ? " is-error" : ""}`} role="status" aria-live="polite">{feedback}</p>
        <p className="auth-footnote">La modalità demo non invia dati e resta solo su questo dispositivo.</p>
      </div>
    </section>
  );
}

function Sidebar({ view, setView, session, onLogout, mobileMenu }) {
  const initials = (session?.user?.name ?? "GC").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside className={`sidebar${mobileMenu ? " is-open" : ""}`} aria-label="Navigazione principale">
      <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">F</div><div><p className="brand-name">FOOD<span>.</span></p><p className="brand-caption">mangiare bene, insieme</p></div></div>
      <div className="space-switcher"><div className="avatar avatar-sage">G</div><div><span className="eyebrow">Spazio condiviso</span><strong>Casa Greco</strong></div><button className="icon-button compact" type="button" aria-label="Cambia spazio">⌄</button></div>
      <nav className="nav-list" aria-label="Sezioni">
        <NavItem icon="⌂" label="Dashboard" view="dashboard" current={view} setView={setView} />
        <NavItem icon="✦" label="Ricette" view="recipes" current={view} setView={setView} count="12" />
        <NavItem icon="▦" label="Piano settimanale" view="plan" current={view} setView={setView} />
        <NavItem icon="✓" label="Lista della spesa" view="shopping" current={view} setView={setView} count="8" coral />
        <NavItem icon="⚙" label="Impostazioni" view="settings" current={view} setView={setView} />
      </nav>
      <div className="sidebar-bottom">
        <div className="tip-card"><span className="tip-spark">✦</span><p><strong>Piccolo passo.</strong><br />Hai già coperto il 68% dei tuoi obiettivi di oggi.</p><div className="progress-track"><span style={{ width: "68%" }} /></div></div>
        <div className="profile-mini"><div className="avatar avatar-coral">{initials}</div><div><strong>{session?.user?.name ?? "Greco Casa"}</strong><span>{session?.source === "supabase" ? "Account connesso" : "Demo locale"}</span></div><button className="icon-button" type="button" onClick={onLogout} aria-label="Esci">↪</button></div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, view, current, setView, count, coral }) {
  return <button className={`nav-item${current === view ? " is-active" : ""}`} type="button" onClick={() => setView(view)}><span className="nav-icon">{icon}</span><span>{label}</span>{count && <span className={`nav-count${coral ? " nav-count-coral" : ""}`}>{count}</span>}</button>;
}

function Topbar({ view, session, onMenu }) {
  return <header className="topbar"><button className="mobile-menu icon-button" type="button" aria-label="Apri menu" onClick={onMenu}>☰</button><div className="breadcrumb"><span>Casa Greco</span><span className="breadcrumb-separator">/</span><strong>{pageLabels[view]}</strong></div><div className="topbar-actions"><span className={`account-state${session?.source === "supabase" ? " is-live" : ""}`}><span /> {session?.source === "supabase" ? "Connesso" : "Demo"}</span><button className="icon-button notification-button" type="button" aria-label="Notifiche"><span className="notification-dot" />♧</button><div className="avatar avatar-coral">GC</div></div></header>;
}

function PageHeading({ eyebrow, title, copy, action, actionLabel, onAction, outline = false }) {
  return <div className="page-heading"><div><p className="eyebrow accent-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="heading-copy">{copy}</p></div>{actionLabel && <button className={`button ${outline ? "button-outline" : "button-dark"}`} type="button" onClick={onAction}>{action}{actionLabel}</button>}</div>;
}

function Stats() {
  return <div className="stats-grid"><article className="stat-card stat-card-green"><div className="stat-card-top"><span>Calorie di oggi</span><span className="stat-icon">◒</span></div><strong>1.420 <small>/ 2.100 kcal</small></strong><div className="progress-track progress-track-light"><span style={{ width: "68%" }} /></div><p><span className="positive">− 12%</span> rispetto alla media</p></article><article className="stat-card"><div className="stat-card-top"><span>Proteine</span><span className="stat-icon stat-icon-purple">∿</span></div><strong>74 <small>/ 110 g</small></strong><div className="progress-track"><span className="progress-purple" style={{ width: "67%" }} /></div><p><span className="positive">+ 8%</span> rispetto alla media</p></article><article className="stat-card"><div className="stat-card-top"><span>Ricette salvate</span><span className="stat-icon stat-icon-coral">✦</span></div><strong>12 <small>ricette</small></strong><div className="mini-bars" aria-hidden="true"><i style={{ height: "28%" }} /><i style={{ height: "46%" }} /><i style={{ height: "36%" }} /><i style={{ height: "74%" }} /><i style={{ height: "54%" }} /><i style={{ height: "90%" }} /><i style={{ height: "68%" }} /></div><p><span className="positive">+ 3</span> questa settimana</p></article></div>;
}

function Dashboard({ setView, onAddRecipe, onSave, savedRecipes, showToast }) {
  return <>
    <PageHeading eyebrow="Martedì, 12 marzo 2024" title={<>Buongiorno, Greco <span className="wave">⌁</span></>} copy="Ecco un piccolo assaggio di come sta andando la vostra settimana." action="＋ " actionLabel="Nuova ricetta" onAction={onAddRecipe} />
    <Stats />
    <div className="content-grid content-grid-main"><section className="panel plan-panel"><div className="panel-heading"><div><p className="eyebrow">In programma</p><h2>Il tuo martedì</h2></div><button className="text-button" type="button" onClick={() => setView("plan")}>Vedi piano <span>↗</span></button></div><div className="meal-list"><MealRow time="Colazione" hour="08:00" title="Yogurt greco, miele e noci" detail="320 kcal · 18g proteine" dot="dot-breakfast" status="done" /><MealRow time="Pranzo" hour="13:00" title="Insalata tiepida di farro" detail="560 kcal · 24g proteine" dot="dot-lunch" status="next" current /><MealRow time="Cena" hour="20:00" title="Pollo al limone e verdure" detail="540 kcal · 32g proteine" dot="dot-dinner" status="empty" /></div></section><NutritionPanel /></div>
    <section className="panel recipes-panel"><div className="panel-heading"><div><p className="eyebrow">Dalla tua cucina</p><h2>Ricette da provare</h2></div><button className="text-button" type="button" onClick={() => setView("recipes")}>Tutte le ricette <span>↗</span></button></div><div className="recipe-grid">{recipes.slice(0, 3).map((recipe) => <RecipeCard key={recipe.title} recipe={recipe} saved={savedRecipes.has(recipe.title)} onSave={onSave} showToast={showToast} />)}</div></section>
    <section className="quote-strip"><span className="quote-mark">“</span><p>La cucina è il luogo in cui le giornate prendono una forma più buona.</p><span className="quote-author">— FOOD, per voi</span></section>
  </>;
}

function MealRow({ time, hour, title, detail, dot, status, current }) {
  return <article className={`meal-row${current ? " meal-row-current" : ""}`}><div className="meal-time"><span className={`meal-dot ${dot}`} /><span>{time}</span><small>{hour}</small></div><div className="meal-info"><strong>{title}</strong><span>{detail}</span></div><div className={`meal-status status-${status}`}>{status === "done" ? "✓" : status === "next" ? "›" : "＋"}</div></article>;
}

function NutritionPanel() {
  return <section className="panel nutrition-panel"><div className="panel-heading"><div><p className="eyebrow">Il tuo equilibrio</p><h2>Riepilogo nutrizionale</h2></div><button className="icon-button" type="button" aria-label="Apri dettaglio">↗</button></div><div className="nutrition-chart-wrap"><div className="donut-chart"><div className="donut-center"><strong>68<span>%</span></strong><small>completato</small></div></div><div className="legend"><Legend color="legend-protein" label="Proteine" value="74g" /><Legend color="legend-carbs" label="Carboidrati" value="156g" /><Legend color="legend-fat" label="Grassi" value="48g" /></div></div><div className="nutrition-footnote"><span className="sparkle">✦</span><p>Ottimo ritmo! Ti restano <strong>680 kcal</strong> per oggi.</p></div></section>;
}

function Legend({ color, label, value }) { return <div><span className={`legend-dot ${color}`} /><span>{label}</span><strong>{value}</strong></div>; }

function RecipeCard({ recipe, saved, onSave, showToast }) {
  return <article className="recipe-card" onClick={() => showToast(`${recipe.title}: dettaglio in arrivo nella prossima fase`)}><div className={`recipe-image ${recipe.image}`}><span className="recipe-tag">{recipe.time}</span><button className={`heart-button${saved ? " is-saved" : ""}`} type="button" aria-label={saved ? "Rimuovi dai salvati" : "Salva ricetta"} onClick={(event) => { event.stopPropagation(); onSave(recipe.title); }}>{saved ? "♥" : "♡"}</button></div><div className="recipe-body"><div><p className="recipe-category">{recipe.category}</p><h3>{recipe.title}</h3></div><span className="recipe-kcal">{recipe.kcal} <small>kcal</small></span></div><div className="recipe-macros"><span>▰ {recipe.protein}g proteine</span><span>◒ {recipe.carbs}g carbo</span></div></article>;
}

function RecipesPage({ onAddRecipe, onSave, savedRecipes, showToast }) {
  const [filter, setFilter] = useState("Tutte");
  return <><PageHeading eyebrow="La vostra raccolta" title="Ricette" copy="Idee semplici, buone e già pensate per il vostro ritmo." action="＋ " actionLabel="Nuova ricetta" onAction={onAddRecipe} /><div className="recipes-toolbar"><div className="search-box"><span>⌕</span><input type="search" placeholder="Cerca una ricetta..." aria-label="Cerca una ricetta" /></div><div className="filter-pills">{["Tutte", "Veloci", "Vegetariane", "Salvate"].map((item) => <button key={item} className={`filter-pill${filter === item ? " is-active" : ""}`} type="button" onClick={() => { setFilter(item); showToast(`Filtro “${item}” applicato`); }}>{item}</button>)}</div></div><div className="recipe-grid recipe-grid-page">{recipes.map((recipe) => <RecipeCard key={recipe.title} recipe={recipe} saved={savedRecipes.has(recipe.title)} onSave={onSave} showToast={showToast} />)}</div></>;
}

function PlanPage({ showToast }) {
  return <><PageHeading eyebrow="Dal 11 al 17 marzo" title="Piano settimanale" copy="Un piano flessibile: cambiate un pasto con un gesto e restate in equilibrio." action="✦ " actionLabel="Genera piano" onAction={() => showToast("Un nuovo piano demo è pronto da esplorare")} /><div className="week-strip"><button className="week-arrow" type="button" onClick={() => showToast("Navigazione calendario demo")}>‹</button>{["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"].map((day, index) => <div key={day} className={`day-pill${index === 1 ? " is-active" : ""}`}><small>{day}</small><strong>{11 + index}</strong>{index === 1 && <span className="day-dot" />}</div>)}<button className="week-arrow" type="button" onClick={() => showToast("Navigazione calendario demo")}>›</button></div><div className="content-grid plan-grid"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Martedì 12</p><h2>Oggi a tavola</h2></div><span className="calorie-badge">1.420 kcal</span></div><div className="plan-meals"><PlanMeal time="08:00" type="Colazione" title="Yogurt greco, miele e noci" detail="320 kcal · 18g proteine" image="breakfast-image" /><PlanMeal time="13:00" type="Pranzo" title="Insalata tiepida di farro" detail="560 kcal · 24g proteine" image="recipe-image-bowl" /><PlanMeal time="20:00" type="Cena" title="Pollo al limone e verdure" detail="540 kcal · 32g proteine" image="recipe-image-chicken" /></div></section><section className="panel weekly-balance"><div className="panel-heading"><div><p className="eyebrow">Vista d'insieme</p><h2>Equilibrio settimanale</h2></div></div><div className="balance-bars">{[["Lun", 68, "1.820"], ["Mar", 55, "1.420"], ["Mer", 72, "—"], ["Gio", 62, "—"], ["Ven", 78, "—"], ["Sab", 84, "—"], ["Dom", 54, "—"]].map(([day, height, value], index) => <div key={day} className={index === 1 ? "is-today" : ""}><span>{day}</span><i style={{ height: `${height}%` }} /><small>{value}</small></div>)}</div><p className="chart-caption"><span className="legend-dot legend-carbs" /> Target giornaliero <strong>2.100 kcal</strong></p></section></div></>;
}

function PlanMeal({ time, type, title, detail, image }) { return <div className="plan-meal"><div className="plan-meal-time">{time}<small>{type}</small></div><div className={`plan-meal-image ${image}`} /><div className="plan-meal-copy"><strong>{title}</strong><span>{detail}</span></div><button className="icon-button" type="button">•••</button></div>; }

function ShoppingPage({ showToast }) {
  const [checked, setChecked] = useState(new Set(["Prezzemolo", "Tahina"]));
  const groups = [["Ortofrutta", [["3 zucchine", "circa 450g"], ["2 limoni", "freschi"], ["Prezzemolo", "1 mazzetto"]]], ["Dispensa", [["Farro perlato", "250g"], ["Ceci", "2 barattoli"], ["Tahina", "1 vasetto"]]], ["Frigo", [["Yogurt greco", "500g"], ["Petto di pollo", "400g"]]]];
  const toggle = (item) => { const next = new Set(checked); next.has(item) ? next.delete(item) : next.add(item); setChecked(next); showToast(next.has(item) ? "Aggiunto alla dispensa" : "Rimesso nella lista"); };
  return <><PageHeading eyebrow="Per il piano di questa settimana" title="Lista della spesa" copy="Tutto quello che serve, raggruppato per reparto." action="↗ " actionLabel="Condividi lista" onAction={() => showToast("Link demo copiato negli appunti")} outline /><div className="shopping-summary"><div><span className="summary-icon">✓</span><div><strong>8 articoli da comprare</strong><span>3 già nella dispensa</span></div></div><div className="shopping-progress"><div className="progress-track"><span style={{ width: "27%" }} /></div><small>27% completato</small></div></div><div className="shopping-grid"><section className="panel shopping-panel">{groups.map(([group, items]) => <div className="shopping-group" key={group}><div className="shopping-group-heading"><h2>{group}</h2><span>{items.length} articoli</span></div>{items.map(([item, detail]) => <label className={`shopping-item${checked.has(item) ? " is-checked" : ""}`} key={item}><input type="checkbox" checked={checked.has(item)} onChange={() => toggle(item)} /><span className="fake-checkbox" /><span>{item}</span><small>{detail}</small></label>)}</div>)}</section><aside className="panel pantry-card"><div className="pantry-illustration">✦</div><p className="eyebrow">Dispensa</p><h2>Avete già qualcosa?</h2><p>Segna gli ingredienti che hai in casa e li terremo fuori dalla prossima lista.</p><button className="text-button" type="button" onClick={() => showToast("Gestione dispensa in arrivo")}>Gestisci dispensa <span>↗</span></button></aside></div></>;
}

function SettingsPage({ onLogout, showToast }) {
  return <><PageHeading eyebrow="Il vostro spazio" title="Impostazioni" copy="Personalizzate il modo in cui FOOD lavora per voi." /><div className="settings-grid"><section className="panel settings-panel"><div className="settings-section"><div className="settings-section-heading"><div className="avatar avatar-coral">GC</div><div><h2>Profilo nutrizionale</h2><p>Usato per obiettivi e riepiloghi personalizzati.</p></div><button className="text-button" type="button" onClick={() => showToast("Modifica profilo in arrivo")}>Modifica</button></div><div className="settings-fields"><div><span>Nome</span><strong>Greco Casa</strong></div><div><span>Obiettivo</span><strong>Mantenimento</strong></div><div><span>Calorie giornaliere</span><strong>2.100 kcal</strong></div><div><span>Preferenze</span><strong>Onnivoro · Nessuna allergia</strong></div></div></div><div className="settings-section"><div className="settings-section-heading"><div className="settings-icon">♧</div><div><h2>Persone nello spazio</h2><p>Condividete ricette, piano e lista della spesa.</p></div><button className="text-button" type="button" onClick={() => showToast("Inviti disponibili nella prossima fase")}>Invita</button></div><Member avatar="G" name="Greco" detail="Proprietario · Attivo ora" color="avatar-sage" /><Member avatar="M" name="Martina" detail="Membro · Attiva ieri" color="avatar-lilac" /></div></section><section className="panel settings-side-panel"><p className="eyebrow">Preferenze</p><h2>Un FOOD che vi somiglia.</h2><Toggle label="Riepilogo settimanale" detail="Ricevi un recap ogni domenica" /><Toggle label="Ricette stagionali" detail="Metti in evidenza ingredienti di stagione" /><Toggle label="Notifiche lista" detail="Ricorda la spesa quando serve" /><button className="button button-outline settings-logout" type="button" onClick={onLogout}>↪ Esci dalla sessione</button></section></div></>;
}

function Member({ avatar, name, detail, color }) { return <div className="member-row"><div className={`avatar ${color}`}>{avatar}</div><div><strong>{name}</strong><span>{detail}</span></div><span className="member-check">✓</span></div>; }
function Toggle({ label, detail }) { const [active, setActive] = useState(true); return <div className="toggle-row"><div><strong>{label}</strong><span>{detail}</span></div><button className={`toggle${active ? " is-on" : ""}`} type="button" aria-label={active ? `Disattiva ${label}` : `Attiva ${label}`} onClick={() => setActive((value) => !value)}><span /></button></div>; }

function Modal({ onClose, showToast }) {
  const [name, setName] = useState("");
  return <div className="modal-backdrop is-visible" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close icon-button" type="button" aria-label="Chiudi" onClick={onClose}>×</button><p className="eyebrow accent-eyebrow">Nuovo contenuto</p><h2 id="modal-title">Aggiungi una ricetta</h2><p>La connessione al backend arriverà nella prossima fase. Per ora puoi esplorare la UI demo.</p><label>Nome ricetta<input type="text" placeholder="es. Pasta al pesto di pistacchi" value={name} onChange={(event) => setName(event.target.value)} /></label><button className="button button-dark modal-confirm" type="button" onClick={() => { onClose(); showToast(name ? `Bozza “${name}” salvata` : "Bozza salvata — pronta per la prossima fase"); }}>Salva bozza</button></div></div>;
}

export default function App({ auth }) {
  const [session, setSession] = useState(undefined);
  const [view, setViewState] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [savedRecipes, setSavedRecipes] = useState(new Set(recipes.filter((recipe) => recipe.saved).map((recipe) => recipe.title)));

  useEffect(() => { auth.getSession().then(setSession).catch(() => setSession(null)); }, [auth]);

  const showToast = (message) => { setToast(message); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => setToast(""), 2800); };
  const setView = (nextView) => { setViewState(nextView); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const onSave = (title) => { setSavedRecipes((current) => { const next = new Set(current); const saved = next.has(title); saved ? next.delete(title) : next.add(title); showToast(saved ? "Ricetta rimossa dai salvati" : "Ricetta salvata nella tua raccolta"); return next; }); };
  const logout = async () => { await auth.signOut(); setSession(null); setViewState("dashboard"); };
  let page;
  if (view === "recipes") page = <RecipesPage onAddRecipe={() => setModal(true)} onSave={onSave} savedRecipes={savedRecipes} showToast={showToast} />;
  else if (view === "plan") page = <PlanPage showToast={showToast} />;
  else if (view === "shopping") page = <ShoppingPage showToast={showToast} />;
  else if (view === "settings") page = <SettingsPage onLogout={logout} showToast={showToast} />;
  else page = <Dashboard setView={setView} onAddRecipe={() => setModal(true)} onSave={onSave} savedRecipes={savedRecipes} showToast={showToast} />;

  if (session === undefined) return <div className="auth-screen is-visible"><div className="auth-card"><div className="auth-brand"><div className="brand-mark">F</div><span>FOOD<span>.</span></span></div><p className="auth-copy">Caricamento del vostro spazio…</p></div></div>;
  if (!session) return <AuthScreen auth={auth} onAuthenticated={setSession} />;

  return <div className="app-shell"><Sidebar view={view} setView={setView} session={session} onLogout={logout} mobileMenu={mobileMenu} /><main className="main-content"><Topbar view={view} session={session} onMenu={() => setMobileMenu((open) => !open)} /><div className="page-wrap"><section className="view is-visible">{page}</section></div></main>{mobileMenu && <button className="mobile-overlay" type="button" aria-label="Chiudi menu" onClick={() => setMobileMenu(false)} />}{toast && <div className="toast is-visible" role="status" aria-live="polite"><span>✦</span><p>{toast}</p></div>}{modal && <Modal onClose={() => setModal(false)} showToast={showToast} />}</div>;
}
