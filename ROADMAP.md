# FOOD — aggiornamento 3 novembre 2026

Confermato dall'utente: accesso con due utenti, spazio condiviso, generazione piano e logout funzionanti.

## Pubblicato

- Calendario con date reali, scelta data, settimane precedenti/successive e oggi evidenziato.
- Pulsante generazione disattivato per settimane con pasti esistenti; protezione anche nell'adapter.
- Editor esplicito per ricetta e porzioni per persona, con salvataggio persistente.
- Porzioni basate sui target calorici e selezione delle ricette considerando i macronutrienti.
- Colazione e snack opzionali, inizialmente disattivati. Nasconderli non elimina pasti già salvati.
- Esclusioni testuali degli ingredienti per persona, applicate a generazione ed editor.
- Spesa ricalcolata dopo modifiche remote preservando le spunte degli ingredienti rimasti.
- Corretto il calcolo dei nutrienti per porzione; ingredienti scalati sulle porzioni base.
- Gestione tastiera e ripristino focus dei modali.
- Quattro test automatici su target, esclusioni, calendario e isolamento delle settimane demo.
- Restyling dei controlli del piano e ricerca ricette con selezione da tastiera.

Migrazione `supabase/migrations/006_optional_meals.sql` eseguita con successo dall'utente il 3 novembre 2026. La migrazione aggiunge il campo esclusioni e consente breakfast/snack.

## Ancora aperto

- Verifica browser desktop/mobile ed end-to-end sul database reale dopo migrazione 006, incluse modifiche concorrenti dei due utenti.
- Migrazione `007_atomic_plan.sql` applicata dall'utente: salvataggio atomico di pasti e spesa, protezione generazione concorrente e conservazione spunte/ID degli ingredienti rimasti. Include un test dell'adapter RPC e verifiche SQL locali su rollback e aggregazione.
- Migrazione `009_structured_diets.sql` applicata dall'utente. Filtri onnivora, vegetariana, vegana, pescetariana e classificazione esplicita delle ricette, applicati a generazione/editor/import JSON e verificati anche dal database. Nessuna classificazione automatica delle vecchie ricette. Restano separati il catalogo allergeni e la verifica delle contaminazioni.
- Bilanciamento giornaliero implementato: ottimizzazione congiunta delle porzioni individuali rispetto a calorie e macro; anteprima prima di applicare ai pasti esistenti e salvataggio atomico della giornata. Non cambia le ricette; usa la quota di target dei momenti presenti (pranzo+cena 70%), senza compensare pasti non inclusi. Non garantisce target esatti con ricette arbitrarie. Undici test automatici.
- Preferenze dei momenti del giorno condivise: frontend pubblicato con rilevamento della disponibilità della migrazione `008_shared_preferences.sql` (applicazione sul progetto reale non ancora confermata). Refresh al ritorno alla scheda e ogni 15 secondi mentre il piano è visibile. Entrambi i membri possono aggiornare i toggle senza sovrascrivere l'altro campo. Se manca la migrazione, solo i toggle condivisi sono disabilitati.
- Inviti via email e gestione membri, priorità bassa. Nessuna espansione multispazio richiesta.
- Storage immagini e upload.
- Test end-to-end automatici di auth/RLS, import e interazioni mobile.

Le vecchie indicazioni di STATUS.md su Supabase non configurato sono superate dalla verifica reale dell'utente.
