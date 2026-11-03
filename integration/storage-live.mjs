import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Opt-in live test: writes only a unique temporary image, then deletes it.
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;
if (!url || !key || ['A','B'].some((p) => !process.env[`FOOD_TEST_${p}_EMAIL`] || !process.env[`FOOD_TEST_${p}_PASSWORD`])) throw new Error('Local test configuration is incomplete.');
const clients = [createClient(url,key,options), createClient(url,key,options)];
const bucket = 'recipe-images';
let path;
let uploaded = false;
try {
  const users=[];
  for (const [index,prefix] of ['A','B'].entries()) {
    const result=await clients[index].auth.signInWithPassword({email:process.env[`FOOD_TEST_${prefix}_EMAIL`],password:process.env[`FOOD_TEST_${prefix}_PASSWORD`]});
    if(result.error) throw new Error(`Account ${prefix} sign-in failed.`);
    users.push(result.data.user.id);
  }
  assert.notEqual(users[0],users[1],'Two distinct accounts are required.');
  const memberships=await Promise.all(clients.map((client,index)=>client.from('space_members').select('space_id').eq('user_id',users[index])));
  if(memberships.some((result)=>result.error)) throw new Error('Unable to verify the shared space.');
  const space=memberships[0].data.find((row)=>memberships[1].data.some((other)=>row.space_id===other.space_id))?.space_id;
  assert.ok(space,'Shared space unavailable.');
  const schema=await clients[0].from('recipes').select('image_path').eq('space_id',space).limit(1);
  assert.ok(!schema.error,'The image_path column is unavailable.');
  const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII=','base64');
  path=`${space}/qa-${randomUUID()}.png`;
  const upload=await clients[0].storage.from(bucket).upload(path,image,{contentType:'image/png',upsert:false});
  assert.ok(!upload.error,'Private bucket upload failed.');
  uploaded=true;
  const download=await clients[1].storage.from(bucket).download(path);
  assert.ok(!download.error,'The second member cannot read the photo.');
  assert.deepEqual(Buffer.from(await download.data.arrayBuffer()),image);
  const signed=await clients[1].storage.from(bucket).createSignedUrls([path],60);
  assert.ok(!signed.error && signed.data?.[0]?.signedUrl,'Signed URL generation failed.');
  const response=await fetch(signed.data[0].signedUrl);
  assert.ok(response.ok,'The signed URL does not return the photo.');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),image);
  console.log('PASS upload, second-member download, and signed URL return the correct content.');
  const anonymous=createClient(url,key,options);
  const denied=await anonymous.storage.from(bucket).createSignedUrl(path,60);
  assert.ok(denied.error,'Anonymous callers unexpectedly have photo-signing access.');
  const publicUrl=anonymous.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  assert.ok(!(await fetch(publicUrl)).ok,'The photo is accessible through a public URL.');
  console.log('PASS private photo: public download and anonymous signing are denied.');
} catch(error) {
  console.error(error.message);
  process.exitCode=1;
} finally {
  if(uploaded) {
    const cleanup=await clients[0].storage.from(bucket).remove([path]);
    if(cleanup.error || !cleanup.data?.length) { console.error('Temporary photo removal was not confirmed.');process.exitCode=1; }
    else console.log('PASS temporary photo removed; no recipes or plans were modified.');
  }
  await Promise.allSettled(clients.map((client)=>client.auth.signOut({scope:'local'})));
}
