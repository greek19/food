# Foto delle ricette

Applicare `supabase/migrations/011_recipe_photos.sql` prima del rilascio.
Lo script aggiunge `recipes.image_path`, crea il bucket privato `recipe-images`
con limite di 5 MB e formati JPEG/PNG/WebP, e assegna l'accesso ai membri dello spazio.
La cartella iniziale dell'oggetto è l'ID dello spazio; nomi casuali evitano sovrascritture.

Le ricette conservano il percorso Storage; gli URL firmati sono generati alla lettura
e durano 24 ore. Non vengono salvati nel database. Ricaricare la pagina rinnova i link.
Le foto esterne preesistenti restano supportate e non vengono trasferite automaticamente.
La demo locale usa un data URL in localStorage, soggetto alla quota del browser.

La selezione mostra un'anteprima locale; l'upload parte solo al salvataggio.
Se la scrittura della ricetta fallisce dopo l'upload, l'adapter tenta di rimuovere il nuovo oggetto.
Se manca la connessione anche durante questa rimozione, può restare un oggetto non referenziato.
Le foto sostituite o scollegate vengono conservate: non si eliminano automaticamente oggetti
che potrebbero essere usati altrove. È previsto un successivo controllo degli oggetti non referenziati.

Test: validazione e rollback dell'upload con client simulato, caricamento/anteprima/persistenza
demo su desktop e mobile, policy Storage su schema metadata locale simulato.
Verifica reale eseguita con successo dopo la migrazione: upload temporaneo, lettura e firma
dal secondo membro, accesso pubblico/firma anonima negati e rimozione confermata della foto di test.
Per ripeterla: `npm run test:storage:remote`. Usa le credenziali locali già configurate;
scrive solo un oggetto temporaneo con nome casuale, poi lo rimuove. Non modifica ricette o piani.

Riferimenti: [bucket privati](https://supabase.com/docs/guides/storage/buckets/fundamentals),
[controllo accessi](https://supabase.com/docs/guides/storage/security/access-control).
