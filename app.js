import { createFoodAuth } from "./auth.js";

const pageLabels = {
  dashboard: "Dashboard",
  recipes: "Ricette",
  plan: "Piano settimanale",
  shopping: "Lista della spesa",
  settings: "Impostazioni",
};

const auth = createFoodAuth(window.FOOD_SUPABASE_CONFIG);
const appShell = document.querySelector(".app-shell");
const authScreen = document.querySelector("#auth-screen");
const authModeLabel = document.querySelector("#auth-mode-label");
const authFeedback = document.querySelector("#auth-feedback");
const loginForm = document.querySelector("#login-form");
const sidebar = document.querySelector(".sidebar");
const navItems = [...document.querySelectorAll(".nav-item")];
const views = [...document.querySelectorAll(".view")];
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
const toast = document.querySelector(".toast");
const accountState = document.querySelector("#account-state");
let toastTimer;
let currentSession = null;

function showToast(message) {
  toast.querySelector("p").textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function initials(name = "FOOD") {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function setAuthFeedback(message = "", isError = false) {
  authFeedback.textContent = message;
  authFeedback.classList.toggle("is-error", isError);
}

function setAuthScreen(visible) {
  authScreen.classList.toggle("is-visible", visible);
  authScreen.setAttribute("aria-hidden", String(!visible));
  appShell.classList.toggle("is-locked", visible);
  if (visible) document.querySelector("#auth-email").focus();
}

function renderSession(session) {
  currentSession = session;
  const name = session?.user?.name ?? "Greco Casa";
  const userInitials = initials(name);
  document.querySelectorAll(".avatar-coral").forEach((avatar) => { avatar.textContent = userInitials; });
  document.querySelector(".profile-mini strong").textContent = name;
  document.querySelector(".profile-mini span").textContent = session?.source === "supabase" ? "Account connesso" : "Demo locale";
  accountState.innerHTML = `<span></span> ${session?.source === "supabase" ? "Connesso" : "Demo"}`;
  accountState.classList.toggle("is-live", session?.source === "supabase");
  setAuthScreen(!session);
}

function showView(viewName) {
  if (!currentSession) {
    setAuthScreen(true);
    return;
  }
  const nextView = pageLabels[viewName] ? viewName : "dashboard";
  views.forEach((view) => view.classList.toggle("is-visible", view.dataset.page === nextView));
  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === nextView));
  breadcrumbCurrent.textContent = pageLabels[nextView];
  sidebar.classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleSignIn(email, password) {
  setAuthFeedback("Verifica in corso…");
  try {
    const session = await auth.signIn(email, password);
    renderSession(session);
    setAuthFeedback("");
    showToast(auth.mode === "supabase" ? "Accesso riuscito" : "Accesso demo riuscito");
  } catch (error) {
    setAuthFeedback(error.message || "Accesso non riuscito.", true);
  }
}

async function handleLogout() {
  try {
    await auth.signOut();
    renderSession(null);
    setAuthFeedback("Sessione chiusa. Puoi rientrare quando vuoi.");
  } catch (error) {
    showToast(error.message || "Impossibile chiudere la sessione");
  }
}

navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
document.querySelectorAll("[data-view-target]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget)));
document.querySelector(".mobile-menu").addEventListener("click", () => sidebar.classList.toggle("is-open"));
document.querySelectorAll('[data-action="logout"]').forEach((button) => button.addEventListener("click", handleLogout));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  handleSignIn(String(formData.get("email") ?? "").trim(), String(formData.get("password") ?? ""));
});

document.querySelector("#demo-login").addEventListener("click", async () => {
  const session = await auth.continueDemo();
  renderSession(session);
  setAuthFeedback("");
  showToast("Modalità demo attiva su questo dispositivo");
});

document.querySelectorAll(".heart-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const saved = button.classList.toggle("is-saved");
    button.textContent = saved ? "♥" : "♡";
    showToast(saved ? "Ricetta salvata nella tua raccolta" : "Ricetta rimossa dai salvati");
  });
});

document.querySelectorAll(".filter-pill").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.remove("is-active"));
  button.classList.add("is-active");
  showToast(`Filtro “${button.textContent}” applicato`);
}));

document.querySelectorAll(".toggle").forEach((button) => button.addEventListener("click", () => {
  button.classList.toggle("is-on");
  showToast(button.classList.contains("is-on") ? "Preferenza attivata" : "Preferenza disattivata");
}));

document.querySelectorAll(".shopping-item input").forEach((input) => input.addEventListener("change", () => {
  input.closest(".shopping-item").classList.toggle("is-checked", input.checked);
  showToast(input.checked ? "Aggiunto alla dispensa" : "Rimesso nella lista");
}));

const modalBackdrop = document.querySelector(".modal-backdrop");
function toggleModal(open) {
  modalBackdrop.classList.toggle("is-visible", open);
  modalBackdrop.setAttribute("aria-hidden", String(!open));
  if (open) modalBackdrop.querySelector("input").focus();
}

document.querySelectorAll('[data-action="add-recipe"]').forEach((button) => button.addEventListener("click", () => toggleModal(true)));
document.querySelector(".modal-close").addEventListener("click", () => toggleModal(false));
modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) toggleModal(false); });
document.querySelector(".modal-confirm").addEventListener("click", () => { toggleModal(false); showToast("Bozza salvata — pronta per la prossima fase"); });

document.querySelector('[data-action="generate-plan"]').addEventListener("click", () => showToast("Un nuovo piano demo è pronto da esplorare"));
document.querySelector('[data-action="share-list"]').addEventListener("click", () => showToast("Link demo copiato negli appunti"));
document.querySelectorAll(".recipe-card").forEach((card) => card.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  showToast(`${card.dataset.recipe}: dettaglio in arrivo nella prossima fase`);
}));

document.querySelectorAll(".week-arrow").forEach((button) => button.addEventListener("click", () => showToast("Navigazione calendario demo")));

authModeLabel.innerHTML = `<span></span> ${auth.mode === "supabase" ? "Supabase configurato" : "Modalità demo locale"}`;
auth.getSession().then(renderSession).catch((error) => {
  renderSession(null);
  setAuthFeedback(error.message || "Impossibile verificare la sessione.", true);
});
