# FOOD — aggiornamento 3 novembre 2026

Confermato dall'utente: accesso con due utenti, spazio condiviso, generazione piano e logout funzionanti.

## Implementato localmente, da pubblicare

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

Migrazione `supabase/migrations/006_optional_meals.sql` eseguita con successo dall'utente il 3 novembre 2026. La migrazione aggiunge il campo esclusioni e consente breakfast/snack.

## Ancora aperto

- Verifica browser desktop/mobile ed end-to-end sul database reale dopo migrazione 006, incluse modifiche concorrenti dei due utenti.
- Transazione unica per modifica piano e ricalcolo spesa: ora sono richieste successive e un errore di rete può lasciare la spesa da riallineare.
- Filtri dieta strutturati e catalogo allergeni verificato: la ricerca testuale degli ingredienti non certifica assenza di allergeni né contaminazioni.
- Ottimizzazione nutrizionale dell'intera giornata: ora si stimano porzioni per pasto e si confrontano le densità dei macro; non si garantisce un bilanciamento esatto.
- Preferenze dei momenti del giorno condivise nel database: attualmente i toggle sono salvati sul dispositivo.
- Inviti via email e gestione membri, priorità bassa. Nessuna espansione multispazio richiesta.
- Storage immagini e upload.
- Test end-to-end automatici di auth/RLS, import e interazioni mobile.

Le vecchie indicazioni di STATUS.md su Supabase non configurato sono superate dalla verifica reale dell'utente.
