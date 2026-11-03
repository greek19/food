import { t, useLanguage } from './i18n.js';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return <label className="language-selector"><span className="language-selector-label">{t('Language')}</span><select aria-label={t('Language')} value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en" lang="en">English</option><option value="it" lang="it">Italiano</option></select></label>;
}
