import i18n from 'i18next';
import type { CastConferenceStrings } from '@slicer-hub/client';
import {
  APP_LOCALES,
  type AppLocale,
  conferenceStringsFor,
  persistLocale,
  resolveStoredLocale,
} from '@slicer-hub/i18n';
import { en } from './locales/en';
import { ar } from './locales/ar';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { ca } from './locales/ca';
import { de } from './locales/de';
import { it } from './locales/it';
import { pt } from './locales/pt';
import { ko } from './locales/ko';
import { pl } from './locales/pl';
import { uk } from './locales/uk';
import { cs } from './locales/cs';
import { nl } from './locales/nl';
import { el } from './locales/el';
import { lv } from './locales/lv';
import { hu } from './locales/hu';
import { lt } from './locales/lt';
import { ro } from './locales/ro';
import { no } from './locales/no';

export type { AppLocale };
export { APP_LOCALES };

const NON_EN: ReadonlySet<string> = new Set(
  APP_LOCALES.map((l) => l.code).filter((c) => c !== 'en')
);

export function resolveInitialLocale(): AppLocale {
  return resolveStoredLocale();
}

let ready = false;

export async function initI18n(): Promise<typeof i18n> {
  if (ready) return i18n;
  const lng = resolveStoredLocale();
  await i18n.init({
    lng,
    fallbackLng: 'en',
    defaultNS: 'chrome',
    ns: ['chrome', 'help', 'conference'],
    resources: {
      en: { chrome: en.chrome, help: en.help, conference: en.conference },
      ar: { chrome: ar.chrome, help: ar.help, conference: ar.conference },
      fr: { chrome: fr.chrome, help: fr.help, conference: fr.conference },
      es: { chrome: es.chrome, help: es.help, conference: es.conference },
      ca: { chrome: ca.chrome, help: ca.help, conference: ca.conference },
      de: { chrome: de.chrome, help: de.help, conference: de.conference },
      it: { chrome: it.chrome, help: it.help, conference: it.conference },
      pt: { chrome: pt.chrome, help: pt.help, conference: pt.conference },
      ko: { chrome: ko.chrome, help: ko.help, conference: ko.conference },
      pl: { chrome: pl.chrome, help: pl.help, conference: pl.conference },
      uk: { chrome: uk.chrome, help: uk.help, conference: uk.conference },
      cs: { chrome: cs.chrome, help: cs.help, conference: cs.conference },
      nl: { chrome: nl.chrome, help: nl.help, conference: nl.conference },
      el: { chrome: el.chrome, help: el.help, conference: el.conference },
      lv: { chrome: lv.chrome, help: lv.help, conference: lv.conference },
      hu: { chrome: hu.chrome, help: hu.help, conference: hu.conference },
      lt: { chrome: lt.chrome, help: lt.help, conference: lt.conference },
      ro: { chrome: ro.chrome, help: ro.help, conference: ro.conference },
      no: { chrome: no.chrome, help: no.help, conference: no.conference },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  ready = true;
  persistLocale(lng);
  return i18n;
}

export function getLocale(): AppLocale {
  const lng = (i18n.language || 'en').split('-')[0];
  if (NON_EN.has(lng)) return lng as AppLocale;
  return 'en';
}

export async function setLocale(code: AppLocale): Promise<void> {
  await i18n.changeLanguage(code);
  persistLocale(code);
}

export function t(key: string, options?: Record<string, unknown>): string {
  return String(i18n.t(key, options));
}

/** Flat Hub conference strings for dialog / header APIs. */
export function conferenceStrings(): CastConferenceStrings {
  return conferenceStringsFor(getLocale()) as CastConferenceStrings;
}

export function onLanguageChanged(handler: () => void): () => void {
  const fn = () => handler();
  i18n.on('languageChanged', fn);
  return () => {
    i18n.off('languageChanged', fn);
  };
}

/** Apply static chrome labels marked with data-i18n / data-i18n-title. */
export function applyChromeLabels(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    el.title = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (!key) return;
    el.setAttribute('aria-label', t(key));
  });
}

export { i18n };
