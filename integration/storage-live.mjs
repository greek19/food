import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Opt-in live test: writes only a unique temporary image, then deletes it.
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;
if (!url || !key || ['A','B'].some((p) => !process.env[`FOOD_TEST_${p}_EMAIL`] || !process.env[`FOOD_TEST_${p}_PASSWORD`])) throw new Error('Configurazione locale dei test incompleta.');
const clients = [createClient(url,key,options), createClient(url,key,options)];
const bucket = 'recipe-images';
let path;
let uploaded = false;
try {
  const users=[];
  for (const [index,prefix] of ['A','B'].entries()) {
    const result=await clients[index].auth.signInWithPassword({email:process.env[`FOOD_TEST_${prefix}_EMAIL`],password:process.env[`FOOD_TEST_${prefix}_PASSWORD`]});
    if(result.error) throw new Error(`Accesso account ${prefix} non riuscito.`);
    users.push(result.data.user.id);
  }
  assert.notEqual(users[0],users[1],'Servono due account distinti.');
  const memberships=await Promise.all(clients.map((client,index)=>client.from('space_members').select('space_id').eq('user_id',users[index])));
  if(memberships.some((result)=>result.error)) throw new Error('Impossibile verificare lo spazio condiviso.');
  const space=memberships[0].data.find((row)=>memberships[1].data.some((other)=>row.space_id===other.space_id))?.space_id;
  assert.ok(space,'Spazio condiviso non disponibile.');
  const schema=await clients[0].from('recipes').select('image_path').eq('space_id',space).limit(1);
  assert.ok(!schema.error,'Colonna image_path non disponibile.');
  const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII=','base64');
  path=`${space}/qa-${randomUUID()}.png`;
  const upload=await clients[0].storage.from(bucket).upload(path,image,{contentType:'image/png',upsert:false});
  assert.ok(!upload.error,'Upload nel bucket privato non riuscito.');
  uploaded=true;
  const download=await clients[1].storage.from(bucket).download(path);
  assert.ok(!download.error,'Il secondo membro non può leggere la foto.');
  assert.deepEqual(Buffer.from(await download.data.arrayBuffer()),image);
  const signed=await clients[1].storage.from(bucket).createSignedUrls([path],60);
  assert.ok(!signed.error && signed.data?.[0]?.signedUrl,'Generazione URL firmato non riuscita.');
  const response=await fetch(signed.data[0].signedUrl);
  assert.ok(response.ok,'L’URL firmato non restituisce la foto.');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),image);
  console.log('PASS upload, download del secondo membro e URL firmato con contenuto corretto.');
  const anonymous=createClient(url,key,options);
  const denied=await anonymous.storage.from(bucket).createSignedUrl(path,60);
  assert.ok(denied.error,'Accesso anonimo inatteso alla firma delle foto.');
  const publicUrl=anonymous.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  assert.ok(!(await fetch(publicUrl)).ok,'La foto è scaricabile tramite URL pubblico.');
  console.log('PASS foto privata: download pubblico e firma anonima non consentiti.');
} catch(error) {
  console.error(error.message);
  process.exitCode=1;
} finally {
  if(uploaded) {
    const cleanup=await clients[0].storage.from(bucket).remove([path]);
    if(cleanup.error || !cleanup.data?.length) { console.error('Rimozione della foto temporanea non confermata.');process.exitCode=1; }
    else console.log('PASS foto temporanea rimossa; nessuna ricetta o piano modificato.');
  }
  await Promise.allSettled(clients.map((client)=>client.auth.signOut({scope:'local'})));
}
