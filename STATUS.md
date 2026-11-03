# FOOD — stato progetto

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

## Prossima fase suggerita

1. Inserire localmente URL e Publishable/anon key in `.env.local` senza committarli.
2. Creare il progetto Supabase, eseguire [`supabase/schema.sql`](supabase/schema.sql) e verificare le policy RLS con due utenti di test.
3. Collegare la dashboard a query reali per profilo nutrizionale, ricette, pasti e lista della spesa.
4. Aggiungere onboarding per creazione spazio e invito di un secondo membro.
5. Spostare le immagini delle ricette in uno storage gestito oppure in asset versionati nel repository.
6. Aggiungere test end-to-end per navigazione, sessioni e permessi tra membri.

## Punto di ripresa esatto

Partire da `.env.local`, `src/auth.js` e `supabase/schema.sql`: inserire localmente URL/Publishable key, eseguire lo schema su un progetto Supabase di test, verificare login/logout e sostituire progressivamente i dati statici dei componenti React con query autorizzate da RLS.

## Limiti attuali

- Nessun progetto Supabase reale è collegato: mancano URL, anon key e consenso/configurazione del progetto.
- Senza variabili Supabase nella build produzione mostra la schermata di configurazione indisponibile e nega l'accesso.
- `.env.local` contiene ancora valori vuoti di esempio.
- Il backend adapter usa ancora dati statici per dashboard, piano e lista della spesa.
- Il calendario e i dati nutrizionali sono statici e dimostrativi.
- Le foto arrivano da Unsplash via URL remoto.
- Il workflow richiede l'attivazione iniziale di GitHub Pages con sorgente `GitHub Actions` nelle impostazioni del repository.
