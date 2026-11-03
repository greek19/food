import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

test('actual migrations enforce shared access and space isolation', async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`create schema auth; create role anon; create role authenticated;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
      grant usage on schema public, auth to authenticated, anon;`);
    // Minimal Storage metadata for policy checks; the real Storage HTTP service
    // (MIME/size restrictions and signed links) is not emulated by PGlite.
    await db.exec(`create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated,anon;
      grant select,insert,delete on storage.objects to authenticated;`);
    const files = ['supabase/schema.sql', ...(await readdir('supabase/migrations')).filter((name) => name.endsWith('.sql')).sort().map((name) => `supabase/migrations/${name}`)];
    for (const path of files) {
      // PGlite has gen_random_uuid built in but does not package pgcrypto.
      const sql = (await readFile(path, 'utf8')).replace(/create extension if not exists "pgcrypto";/g, '');
      await db.exec(sql);
    }
    await db.exec(`insert into auth.users values('${id(1)}'),('${id(2)}'),('${id(3)}');
      insert into spaces(id,owner_id) values('${id(10)}','${id(1)}'),('${id(20)}','${id(3)}');
      insert into space_members(space_id,user_id,role) values('${id(10)}','${id(1)}','owner'),('${id(10)}','${id(2)}','member'),('${id(20)}','${id(3)}','owner');
      insert into recipes(id,space_id,author_id,title,calories,servings,ingredients,diet_tags) values
      ('${id(11)}','${id(10)}','${id(1)}','Shared',500,2,'[{"name":"Riso","quantity":200,"unit":"g"}]',array['vegan']),
      ('${id(21)}','${id(20)}','${id(3)}','Private',400,1,'[]',array['vegan']);
      insert into meal_plans(id,space_id,week_start,created_by) values('${id(22)}','${id(20)}','2030-01-07','${id(3)}');
      set role authenticated;`);
    const user = (n) => db.query("select set_config('request.jwt.claim.sub',$1,false)", [id(n)]);
    const save = (space, recipe = 11) => db.query('select save_food_plan($1,$2,$3,false)', [id(space), '2030-01-07', JSON.stringify([{ recipe_id:id(recipe), day_of_week:0, meal_type:'lunch', servings:2 }])]);
    await t.test('both members read the same recipes and the second member can save meals', async () => {
      await user(1); const first = (await db.query('select id from recipes order by id')).rows;
      await user(2); assert.deepEqual((await db.query('select id from recipes order by id')).rows, first);
      assert.deepEqual(first, [{ id:id(11) }]);
      await save(10);
      assert.equal((await db.query('select quantity from shopping_items')).rows[0].quantity, '200.00');
    });
    await t.test('nonmembers cannot read or change private rows or call private-space RPCs', async () => {
      await user(2);
      assert.equal((await db.query('select * from spaces where id=$1', [id(20)])).rows.length,0);
      assert.equal((await db.query('update recipes set title=$1 where id=$2 returning id',['Forbidden',id(21)])).rows.length,0);
      assert.equal((await db.query('delete from recipes where id=$1 returning id',[id(21)])).rows.length,0);
      await assert.rejects(save(20,21));
      await assert.rejects(db.query('select set_food_meal_preference($1,$2,true)',[id(20),'snack']));
      await user(3);
      assert.equal((await db.query('select * from meal_plans where space_id=$1',[id(10)])).rows.length,0);
      assert.equal((await db.query('select * from shopping_items')).rows.length,0);
    });
    await t.test('members cannot promote themselves to owner', async () => {
      await user(2);
      assert.equal((await db.query("update space_members set role='owner' where user_id=$1 returning role",[id(2)])).rows.length,0);
    });
    await t.test('shopping rows cannot point at another space’s meal plan', async () => {
      await user(2);
      await assert.rejects(db.query('insert into shopping_items(space_id,meal_plan_id,ingredient_key,name) values($1,$2,$3,$4)',[id(10),id(22),'bad','Bad reference']));
    });
    await t.test('a user belonging to both spaces still cannot mix recipe and plan scopes', async () => {
      await db.exec(`reset role; insert into space_members(space_id,user_id) values('${id(20)}','${id(2)}'); set role authenticated;`);
      await user(2);
      await assert.rejects(save(10,21));
      await assert.rejects(db.query('insert into shopping_items(space_id,meal_plan_id,ingredient_key,name) values($1,$2,$3,$4)',[id(10),id(22),'bad','Bad reference']));
      assert.equal((await db.query('select recipe_id from meal_plan_items')).rows[0].recipe_id,id(11));
    });
    await t.test('anonymous callers cannot use protected tables or mutation RPCs', async () => {
      await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub','',false)");
      await assert.rejects(db.query('select * from space_preferences'));
      await assert.rejects(save(10));
    });
    await t.test('private photo metadata is shared with members but hidden from outsiders', async () => {
      await db.exec('reset role;set role authenticated');
      await user(1);
      await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['recipe-images',`${id(10)}/photo.jpg`]);
      await assert.rejects(db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['recipe-images',`${id(20)}/blocked.jpg`]));
      await user(2);
      assert.equal((await db.query('select * from storage.objects')).rows.length,1);
      await user(3);
      assert.equal((await db.query('select * from storage.objects')).rows.length,0);
      assert.equal((await db.query('delete from storage.objects returning id')).rows.length,0);
      await db.exec('reset role');
      assert.equal((await db.query("select public from storage.buckets where id='recipe-images'")).rows[0].public,false);
    });
  } finally { await db.close(); }
});
