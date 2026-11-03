# Controlli database

`npm run test:rls` carica schema e migrazioni reali in PGlite (PostgreSQL locale isolato).
Simula `auth.uid()` e verifica i ruoli `authenticated` e `anon`, due membri e un esterno.
Verifica accessi condivisi, isolamento, divieto di promozione del ruolo, RPC e riferimenti tra spazi.
Non contatta il progetto Supabase. Non verifica il servizio Auth, PostgREST né la concorrenza di connessioni remote.

Per il controllo remoto, copiare `integration/.env.example` in `.env.supabase-test.local`
nella radice del progetto e compilare le credenziali **localmente**, senza inviarle in chat.
Eseguire `npm run test:remote`. Il file locale è ignorato da Git. Usare account di test,
una chiave publishable/anon e due utenti distinti nello stesso spazio. Non modificare dati durante il controllo.

Lo script remoto effettua login, legge membership e confronta la visibilità delle righe di
ricette/profili/piani/spesa; verifica anche l'accesso anonimo. Non inserisce né modifica dati applicativi.
Al termine chiude solo le sessioni di test create dallo script, senza disconnettere le sessioni del portale.
L'isolamento da uno spazio privato remoto è verificato solo se si configura uno spazio esistente
accessibile a B ma non ad A. In sua assenza il controllo è dichiarato non eseguito.
