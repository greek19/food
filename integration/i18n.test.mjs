import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLanguage, getLocale, setLanguage, t, formatNumber } from '../src/i18n.js';

test('English is the default; Italian translates messages and preserves unknown content', () => {
  assert.equal(getLanguage(), 'en');
  assert.equal(t('Weekly plan'), 'Weekly plan');
  const values = new Map();
  globalThis.localStorage = { getItem: (key) => values.get(key), setItem: (key,value) => values.set(key,value) };
  setLanguage('it');
  assert.equal(getLocale(), 'it-IT');
  assert.equal(values.get('food.language'), 'it');
  assert.equal(t('Weekly plan'), 'Piano settimanale');
  assert.equal(t('Import 2 recipes'), 'Importa 2 ricette');
  assert.equal(t('Row 2: title is required.'), 'Riga 2: title è obbligatorio.');
  assert.equal(t('  Save recipe '), '  Salva ricetta ');
  assert.equal(t('My handwritten recipe name'), 'My handwritten recipe name');
  assert.equal(t('constructor'), 'constructor');
  assert.equal(formatNumber(1.25), '1,25');
  setLanguage('en');
  assert.equal(formatNumber(1.25), '1.25');
  assert.equal(t('Weekly plan'), 'Weekly plan');
  setLanguage('unsupported');
  assert.equal(getLanguage(), 'en');
});

test('language changes remain usable if browser storage is unavailable', () => {
  globalThis.localStorage = { setItem: () => { throw new Error('Storage blocked'); } };
  assert.doesNotThrow(() => setLanguage('it'));
  assert.equal(t('Language'), 'Lingua');
  setLanguage('en');
  delete globalThis.localStorage;
});
