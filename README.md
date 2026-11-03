# FOOD.

Repository: [github.com/greek19/food](https://github.com/greek19/food)

GitHub Pages previsto: [greek19.github.io/food](https://greek19.github.io/food/)

Fondamenta UI per il portale privato dedicato a ricette, profili nutrizionali, piano settimanale e lista della spesa.

## Avvio locale

Il progetto usa React + Vite. Richiede Node.js 20+ e npm oppure pnpm.

```powershell
npm install
npm run dev
```

Apri poi l'URL mostrato da Vite, normalmente [http://localhost:5173](http://localhost:5173).

## Struttura

- `src/App.jsx` — componenti React per shell, dashboard, ricette, piano, lista e impostazioni.
- `src/main.jsx` — bootstrap React e caricamento runtime config.
- `src/config.js` — caricamento opzionale della configurazione Supabase locale.
- `styles.css` — tokens visivi, layout responsive, componenti e stati.
- `src/auth.js` — adapter demo locale oppure Supabase Auth tramite `@supabase/supabase-js`.
- `.env.example` — esempio copiabile per la configurazione locale, senza valori reali.
- `.env.local` — override locale ignorato da git; contiene solo valori pubblici inseriti dall'utente.
- `public/supabase-config.js` — risoluzione della configurazione runtime senza credenziali nel repository.
- `supabase/schema.sql` — schema iniziale con profili, spazi condivisi, membri, profili nutrizionali, ricette e RLS.
- `STATUS.md` — stato della fase e roadmap per la prossima iterazione.

## Note

Le immagini delle ricette usano URL Unsplash per mantenere il repository leggero durante la fase demo.

## Fase 2: autenticazione e dati

La UI ora ha tre stati verificabili:

- modalità demo locale, persistita solo in `localStorage` e consentita esclusivamente durante `vite dev`;
- schermata di login e logout, con protezione logica delle sezioni quando non c'è sessione;
- schermata di configurazione indisponibile in produzione se Supabase non è configurato;
- adapter Supabase attivo solo quando sono presenti URL e anon/publishable key.

Per collegare localmente un progetto Supabase reale:

1. Crea un progetto su Supabase e abilita Email/Password in Authentication.
2. Esegui [`supabase/schema.sql`](supabase/schema.sql) nell'SQL Editor.
3. Copia `.env.example` in `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Inserisci in `.env.local` i due valori pubblici di Supabase Project Settings → API:
   - `VITE_SUPABASE_URL`: URL del progetto;
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Publishable key (oppure `VITE_SUPABASE_ANON_KEY` nei progetti che usano ancora quel nome).

   Vite carica automaticamente `.env.local`; il file non è versionato e non viene copiato in `dist/`.
5. Non usare mai `service_role`, password o altri segreti nel frontend o nel repository.

Esempio di configurazione runtime (da fornire al processo di build/hosting, non da committare con valori reali):

```html
<script>
  window.__FOOD_RUNTIME_CONFIG__ = {
    SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "YOUR_PUBLIC_PUBLISHABLE_KEY"
  };
</script>
```

Per verificare login/logout dopo la configurazione:

1. Avvia `pnpm dev` e apri l'URL locale mostrato da Vite.
2. Controlla che il badge mostri “Supabase configurato”.
3. Usa un utente Email/Password già creato nel progetto Supabase e verifica l'accesso.
4. Premi l'icona di uscita nel profilo laterale: le viste diventano protette e compare la schermata login.
5. In sviluppo locale puoi usare “Continua senza account” per verificare il fallback demo; questa opzione non viene mostrata nella build di produzione.

Su GitHub Pages `.env.local` non viene incluso perché ignorato da git e non finisce in `dist/`. Il workflow legge le variabili pubbliche `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` dalle **Repository variables** di GitHub Actions. Se non sono impostate, la produzione resta chiusa e mostra una schermata di configurazione: non effettua auto-login demo.

Per configurare GitHub: apri **Settings → Secrets and variables → Actions → Variables**, crea `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, poi rilancia il workflow. La Publishable/anon key è destinata al client; non usare mai `service_role`, password o secret key.

## Pubblicazione GitHub Pages

Il workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) installa le dipendenze, esegue lint/build e pubblica `dist/` su GitHub Pages a ogni push su `main`.

Passaggio manuale iniziale: nel repository GitHub apri **Settings → Pages**, imposta **Source: GitHub Actions**, poi esegui il workflow dal tab **Actions** oppure fai un push su `main`. Senza Repository variables Supabase il deploy resta volutamente chiuso.
