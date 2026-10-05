/** Shared locale storage for worklist / IRA / reporting (cross-port via cookie). */

export type AppLocale =
  | 'en'
  | 'ar'
  | 'fr'
  | 'es'
  | 'ca'
  | 'de'
  | 'it'
  | 'pt'
  | 'ko'
  | 'pl'
  | 'uk'
  | 'cs'
  | 'nl'
  | 'el'
  | 'lv'
  | 'hu'
  | 'lt'
  | 'ro'
  | 'no';

export const LOCALE_STORAGE_KEY = 'pw46.locale';
export const LEGACY_LOCALE_KEY = 'wl-locale';
export const LOCALE_COOKIE = 'pw46.locale';

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return (
    value === 'en' ||
    value === 'ar' ||
    value === 'fr' ||
    value === 'es' ||
    value === 'ca' ||
    value === 'de' ||
    value === 'it' ||
    value === 'pt' ||
    value === 'ko' ||
    value === 'pl' ||
    value === 'uk' ||
    value === 'cs' ||
    value === 'nl' ||
    value === 'el' ||
    value === 'lv' ||
    value === 'hu' ||
    value === 'lt' ||
    value === 'ro' ||
    value === 'no'
  );
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(';')) {
    const s = part.trim();
    if (s.startsWith(prefix)) {
      try {
        return decodeURIComponent(s.slice(prefix.length));
      } catch {
        return s.slice(prefix.length);
      }
    }
  }
  return null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  // No Domain → host-only; shared across ports on the same host in major browsers.
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=/; max-age=31536000; SameSite=Lax`;
}

function fromNavigator(): AppLocale {
  const nav = (
    typeof navigator !== 'undefined' ? navigator.language || '' : ''
  ).toLowerCase();
  if (nav.startsWith('ca')) return 'ca';
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('it')) return 'it';
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('pl')) return 'pl';
  if (nav.startsWith('uk')) return 'uk';
  if (nav.startsWith('cs')) return 'cs';
  if (nav.startsWith('nl')) return 'nl';
  if (nav.startsWith('el')) return 'el';
  if (nav.startsWith('lv')) return 'lv';
  if (nav.startsWith('hu')) return 'hu';
  if (nav.startsWith('lt')) return 'lt';
  if (nav.startsWith('ro')) return 'ro';
  if (nav.startsWith('no') || nav.startsWith('nb') || nav.startsWith('nn'))
    return 'no';
  return 'en';
}

/**
 * Cookie first (shared across ports on the same host), then localStorage,
 * legacy wl-locale, then navigator. Cookie must win so worklist / IRA /
 * reporting stay in sync when each runs on a different port.
 */
export function resolveStoredLocale(): AppLocale {
  const cookie = readCookie(LOCALE_COOKIE)?.trim().toLowerCase();
  if (isAppLocale(cookie)) {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, cookie);
      localStorage.removeItem(LEGACY_LOCALE_KEY);
    } catch {
      /* ignore */
    }
    return cookie;
  }
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)?.trim().toLowerCase();
    if (isAppLocale(stored)) {
      // Promote to cookie so other origins on this host pick it up next time.
      try {
        writeCookie(LOCALE_COOKIE, stored);
      } catch {
        /* ignore */
      }
      return stored;
    }
  } catch {
    /* ignore */
  }
  try {
    const legacy = localStorage.getItem(LEGACY_LOCALE_KEY)?.trim().toLowerCase();
    if (isAppLocale(legacy)) {
      persistLocale(legacy);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return fromNavigator();
}

export function persistLocale(code: AppLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
    localStorage.removeItem(LEGACY_LOCALE_KEY);
  } catch {
    /* ignore */
  }
  try {
    writeCookie(LOCALE_COOKIE, code);
  } catch {
    /* ignore */
  }
  applyDocumentLocale(code);
}

/** Set html lang + dir (rtl for Arabic). */
export function applyDocumentLocale(code: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}
