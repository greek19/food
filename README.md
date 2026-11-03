# FOOD.

Repository: [github.com/greek19/food](https://github.com/greek19/food)

GitHub Pages previsto: [greek19.github.io/food](https://greek19.github.io/food/)

Fondamenta UI per il portale privato dedicato a ricette, profili nutrizionali, piano settimanale e lista della spesa.

## Avvio locale

Il progetto è una pagina statica buildless, quindi non richiede installazione di dipendenze.

```powershell
python -m http.server 4173
```

Apri poi [http://localhost:4173](http://localhost:4173). In alternativa è possibile aprire direttamente `index.html`, ma il server locale riproduce meglio il comportamento previsto su GitHub Pages.

## Struttura

- `index.html` — shell dell’app e markup delle cinque sezioni.
- `styles.css` — tokens visivi, layout responsive, componenti e stati.
- `app.js` — routing client-side, interazioni demo, autenticazione e protezione logica delle sezioni.
- `auth.js` — adapter demo locale oppure Supabase Auth via import ESM opzionale.
- `supabase-config.local.example.js` — esempio copiabile per la configurazione locale, senza valori reali.
- `supabase-config.local.js` — override locale ignorato da git; contiene solo valori pubblici inseriti dall'utente.
- `supabase-config.js` — risoluzione della configurazione runtime senza credenziali nel repository.
- `supabase/schema.sql` — schema iniziale con profili, spazi condivisi, membri, profili nutrizionali, ricette e RLS.
- `STATUS.md` — stato della fase e roadmap per la prossima iterazione.

## Note

Le immagini delle ricette usano URL Unsplash per mantenere il repository leggero durante la fase demo.

## Fase 2: autenticazione e dati

La UI ora ha tre stati verificabili:

- modalità demo locale predefinita, persistita solo in `localStorage`;
- schermata di login e logout, con protezione logica delle sezioni quando non c'è sessione;
- adapter Supabase opzionale, attivato solo quando sono presenti URL e anon/publishable key.

Per collegare localmente un progetto Supabase reale:

1. Crea un progetto su Supabase e abilita Email/Password in Authentication.
2. Esegui [`supabase/schema.sql`](supabase/schema.sql) nell'SQL Editor.
3. Copia `supabase-config.local.example.js` in `supabase-config.local.js`:

   ```powershell
   Copy-Item supabase-config.local.example.js supabase-config.local.js
   ```

4. Inserisci in `supabase-config.local.js` i due valori pubblici di Supabase Project Settings → API:
   - `SUPABASE_URL`: URL del progetto;
   - `SUPABASE_PUBLISHABLE_KEY`: Publishable key (oppure `SUPABASE_ANON_KEY` nei progetti che usano ancora quel nome).

   Il file locale viene caricato automaticamente prima di `supabase-config.js` e non è versionato.
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

1. Avvia `python -m http.server 4173` e apri `http://localhost:4173`.
2. Controlla che il badge mostri “Supabase configurato”.
3. Usa un utente Email/Password già creato nel progetto Supabase e verifica l'accesso.
4. Premi l'icona di uscita nel profilo laterale: le viste diventano protette e compare la schermata login.
5. Accedi di nuovo oppure usa “Continua senza account” per verificare il fallback demo.

Su GitHub Pages `supabase-config.local.js` non viene incluso perché ignorato da git. Per una build reale, inietta `window.__FOOD_RUNTIME_CONFIG__` prima dei due script oppure prepara un passaggio di build che generi il file senza committarlo. Senza configurazione Supabase l'app resta in demo e non effettua chiamate di rete per l'autenticazione.

## Pubblicazione GitHub Pages

Il workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) pubblica automaticamente la root statica su GitHub Pages a ogni push su `main`.

Passaggio manuale iniziale: nel repository GitHub apri **Settings → Pages**, imposta **Source: GitHub Actions**, poi esegui il workflow dal tab **Actions** oppure fai un push su `main`. La configurazione Supabase locale resta esclusa dal repository; il deploy partirà quindi in modalità demo finché non verrà aggiunta una configurazione runtime pubblica tramite un futuro build step.
