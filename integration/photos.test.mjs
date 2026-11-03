import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhoto, MAX_PHOTO_BYTES } from '../src/photos.js';
import { createFoodData } from '../src/data.js';

test('photo validation rejects unsupported, empty and oversized files', () => {
  assert.equal(validatePhoto({ type:'image/jpeg',size:500 }), 'jpg');
  assert.throws(() => validatePhoto({ type:'image/svg+xml',size:500 }));
  assert.throws(() => validatePhoto({ type:'image/png',size:0 }));
  assert.throws(() => validatePhoto({ type:'image/png',size:MAX_PHOTO_BYTES+1 }));
});

test('photo upload uses a private space path and rolls back the object on recipe failure', async () => {
  const uploads=[]; const removals=[]; const saved=[];
  let fail=false;
  const storage={ upload:async(path,file,options)=>{uploads.push({path,options});return{};},remove:async(paths)=>{removals.push(paths);return{};} };
  const client = {
    storage: { from: () => storage },
    from(table) {
      if (table === 'space_members') return { select: () => ({ eq: () => ({ limit: async () => ({ data: [{ space_id: 'space' }] }) }) }) };
      return { upsert(payload) {
        saved.push(payload);
        return { select: () => ({ single: async () => fail ? { error: new Error('Save failed') } : { data: { ...payload, id: 'r' } } }) };
      } };
    },
  };
  const adapter=createFoodData({auth:{mode:'supabase',getClient:()=>client,getSession:async()=>({user:{id:'u'}})}});
  const file={type:'image/png',size:120};
  await adapter.saveRecipe({title:'Photo',image_url:'old'},file);
  assert.match(uploads[0].path,/^space\/.+\.png$/);
  assert.equal(uploads[0].options.upsert,false);
  assert.equal(saved[0].image_url,null);
  assert.equal(saved[0].image_path,uploads[0].path);
  assert.equal(removals.length,0);
  fail=true;
  await assert.rejects(adapter.saveRecipe({title:'Photo'},file),/Save failed/);
  assert.deepEqual(removals[0],[uploads[1].path]);
});
