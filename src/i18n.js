import { useEffect, useSyncExternalStore } from 'react';
import { italian } from './translations.js';

const storageKey = 'food.language';
const listeners = new Set();
const normalize = (value) => value === 'it' ? 'it' : 'en';
function savedLanguage() { try { return normalize(globalThis.localStorage?.getItem(storageKey)); } catch { return 'en'; } }
let language = savedLanguage();
export function getLanguage() { return language; }
export function getLocale() { return language === 'it' ? 'it-IT' : 'en-GB'; }
export function setLanguage(value) {
  language = normalize(value);
  try { globalThis.localStorage?.setItem(storageKey, language); } catch { /* Keep the current session usable without storage. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = language;
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => { if (event.key === storageKey || event.key === null) { language = normalize(event.newValue); if (typeof document !== 'undefined') document.documentElement.lang = language; listeners.forEach((callback) => callback()); } };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage); };
}
export function useLanguage() {
  const current = useSyncExternalStore(subscribe, getLanguage, () => 'en');
  useEffect(() => { document.documentElement.lang = current; }, [current]);
  return { language: current, setLanguage };
}

const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.entries(italian).filter(([key]) => /\{\w+\}/.test(key)).map(([key, translated]) => {
  const names = [...key.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
  const parts = key.split(/\{\w+\}/).map(escapePattern);
  return { expression: new RegExp('^' + parts.join('(.+?)') + '$'), names, translated };
});
export function t(message) {
  if (language === 'en' || typeof message !== 'string' || !message.trim()) return message;
  const key = message.trim();
  let value = Object.hasOwn(italian, key) ? italian[key] : undefined;
  if (!value) for (const pattern of patterns) {
    const match = key.match(pattern.expression);
    if (match) { value = pattern.translated; pattern.names.forEach((name, index) => { value = value.replace(`{${name}}`, t(match[index + 1])); }); break; }
  }
  if (!value) return message;
  return message.slice(0, message.indexOf(key)) + value + message.slice(message.indexOf(key) + key.length);
}
export function formatNumber(value, options = {}) { return new Intl.NumberFormat(getLocale(), options).format(Number(value)); }
