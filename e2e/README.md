# Verifica browser FOOD

Eseguire `npx playwright install chromium`, poi `npm run test:e2e`.
La configurazione avvia Vite sulla porta 4174 e verifica Chromium desktop e viewport mobile iPhone 13.

La fixture monta la stessa app con l'adapter demo. Non legge configurazioni Supabase,
non usa credenziali reali e non viene inclusa nella build di produzione.
Ogni test ha un contesto browser isolato.

Copertura: calendario/settimane, generazione, autocomplete con tastiera, quantità individuali,
persistenza dopo reload, proposta e salvataggio del bilanciamento, overflow modale,
Escape e ripristino focus, preferenze, logout, JSON malformato/duplicati e spunte spesa.
Gli screenshot del piano e le tracce dei fallimenti finiscono in `test-results/` (ignorato da Git).

Limiti: emulazione mobile Chromium, non Safari su dispositivo reale. Nessuna prova
di email/password Supabase, sincronizzazione tra due sessioni remote o policy RLS del progetto reale.
Queste verifiche richiedono un ambiente Supabase di test e account dedicati.
