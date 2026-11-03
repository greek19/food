# FOOD — stato progetto

Aggiornamento 3 novembre 2026: Supabase e due utenti sono operativi, verificati dall'utente. Migrazione 006 applicata. La roadmap corrente è in [ROADMAP.md](ROADMAP.md); le vecchie note di configurazione e i limiti riportati più sotto descrivono lo stato precedente.

Repository: [github.com/greek19/food](https://github.com/greek19/food)

GitHub Pages previsto: [greek19.github.io/food](https://greek19.github.io/food/)

## Fase 1 completata

- Dashboard responsive con riepilogo calorie, proteine, ricette salvate e pasti della giornata.
- Navigazione funzionante tra Dashboard, Ricette, Piano settimanale, Lista della spesa e Impostazioni.
- Dati demo realistici per ricette, macronutrienti, piano giornaliero e componenti condivisi.
- Interazioni demo: ricerca visiva, filtri, preferiti, checkbox lista, toggle impostazioni, modal nuova ricetta, toast e menu mobile.
- UI statica, ora migrata a React + Vite e pronta per essere pubblicata come sito statico su GitHub Pages.

## Fase 2 completata (base autenticazione e dati)

- Aggiunta schermata login/logout con stato sessione visibile nell'interfaccia.
- Aggiunta modalità demo locale persistita in `localStorage`, senza account inventati o chiamate backend.
- La modalità demo è ora consentita solo in sviluppo locale; la produzione non fa auto-login.
- Aggiunta adapter Supabase opzionale tramite `@supabase/supabase-js`, attivo solo quando URL e anon key sono configurati.
- Aggiunta protezione logica delle sezioni: senza sessione la navigazione torna alla schermata di accesso.
- Aggiunto modello SQL con `profiles`, `spaces`, `space_members`, `nutrition_profiles`, `recipes` e policy RLS.
- Aggiunto `.env.example` e override locale ignorato `.env.local` per URL e Publishable/anon key.
- Documentata la verifica manuale di login/logout con un progetto Supabase configurato dall'utente.
- Aggiunto workflow GitHub Actions per pubblicazione statica su GitHub Pages.
- Nessun segreto o credenziale reale inserito nel progetto.

## Migrazione React + Vite completata

- Scelto React + Vite come stack leggero e gratuito, compatibile con GitHub Pages.
- UI della fase 1 portata in componenti React mantenendo classi CSS, dati demo e interazioni principali.
- Auth Supabase/demo spostata in `src/auth.js`; runtime config gestita da `.env.local` o dal fallback pubblico in `public/`.
- Workflow aggiornato per `npm install`, lint, build e pubblicazione di `dist/`.
- Workflow configurato per leggere `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` dalle Repository variables GitHub Actions.
- Lint e build locale verificati con successo; deploy ancora sospeso su richiesta dell'utente.

## Fase 3 implementata (CRUD, piani e spesa)

- Aggiunto `src/data.js` con adapter demo persistente e adapter Supabase per ricette, profili nutrizionali, piano e lista aggregata.
- Ricette gestibili con creazione, modifica, eliminazione, ingredienti, procedimento, foto e valori nutrizionali per porzione.
- Profili nutrizionali separati per persona, con obiettivi e preferenze usati nel riepilogo e nelle porzioni.
- Generatore settimanale deterministico per pranzo/cena, modificabile per giorno, ricetta e numero di porzioni.
- Lista della spesa aggregata per ingrediente, unità e reparto, con stato sincronizzabile.
- Aggiunta [`supabase/migrations/002_food_core.sql`](supabase/migrations/002_food_core.sql) per tabelle, indici, colonna `recipes.servings` e policy RLS condivise.
- Lint e build verificati dopo l'implementazione.
- Normalizzazione difensiva dell'URL Supabase: eventuali suffissi `/rest/v1`, `/auth/v1` o `/storage/v1` vengono rimossi prima di creare il client.
- Aggiunta `supabase/migrations/003_authenticated_grants.sql` per i privilegi espliciti del ruolo `authenticated`; RLS resta attivo e vincolante.
- Aggiunta `supabase/migrations/004_recipe_meal_types.sql`: una ricetta può appartenere a più momenti del giorno senza perdere il valore legacy `meal_type`.
- Aggiunta modale di dettaglio ricetta con ingredienti, procedimento, valori, porzioni, tipi e foto; i contatori laterali Ricette/Spesa sono derivati dai dati correnti.
- Aggiunte fibre per porzione con migrazione `005_recipe_fiber.sql` e importazione JSON multipla con template, drag-and-drop, anteprima, validazione e deduplicazione non distruttiva.

## Prossima fase suggerita

1. Inserire localmente URL e Publishable/anon key in `.env.local` senza committarli.
2. Creare il progetto Supabase, eseguire [`supabase/schema.sql`](supabase/schema.sql) e verificare le policy RLS con due utenti di test.
3. Verificare in Supabase le query remote di ricette, profili, piano e lista con due utenti di test.
4. Aggiungere onboarding per creazione spazio e invito di un secondo membro.
5. Spostare le immagini delle ricette in uno storage gestito oppure in asset versionati nel repository.
6. Aggiungere test end-to-end per navigazione, sessioni e permessi tra membri.

## Punto di ripresa esatto

Partire da `.env.local`, `src/auth.js` e `supabase/migrations/002_food_core.sql`: inserire localmente URL/Publishable key, eseguire schema e migrazione su un progetto Supabase di test, verificare login/logout e CRUD con due utenti autorizzati da RLS.

## Limiti attuali

- Nessun progetto Supabase reale è collegato: mancano URL, anon key e consenso/configurazione del progetto.
- Senza variabili Supabase nella build produzione mostra la schermata di configurazione indisponibile e nega l'accesso.
- `.env.local` contiene ancora valori vuoti di esempio.
- L'adapter remoto è pronto ma non verificabile end-to-end finché non vengono forniti progetto Supabase e variabili pubbliche.
- Il fallback demo resta intenzionalmente separato e disponibile solo con `vite dev`.
- Le foto arrivano da Unsplash via URL remoto.
- Il workflow richiede l'attivazione iniziale di GitHub Pages con sorgente `GitHub Actions` nelle impostazioni del repository.
