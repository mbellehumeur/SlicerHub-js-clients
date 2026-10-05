/**
 * Segment display-name localization: checked-in locale tables first,
 * then hub Claude fallback for misses (cached in localStorage).
 * English stays on the wire.
 */

import type { AppLocale } from './storage';
import { resolveStoredLocale } from './storage';
import frLabels from './segment-labels/fr.json';

const CACHE_STORAGE_KEY = 'pw46.segmentLabelCache';

/** Checked-in overrides (English lowercase key → localized). Grow via Claude cache promotion. */
export const SEGMENT_LABELS_STATIC: Readonly<
  Partial<Record<AppLocale, Readonly<Record<string, string>>>>
> = Object.freeze({
  fr: Object.freeze(frLabels as Record<string, string>),
});

/** AppLocale → hub translate target code (null = no translation). */
export function translateTargetForLocale(locale: AppLocale): string | null {
  if (locale === 'en') return null;
  const map: Record<Exclude<AppLocale, 'en'>, string> = {
    ar: 'ar',
    fr: 'fr',
    es: 'es',
    ca: 'ca',
    de: 'de',
    it: 'it',
    pt: 'pt',
    ko: 'ko',
    pl: 'pl',
    uk: 'uk',
    cs: 'cs',
    nl: 'nl',
    el: 'el',
    lv: 'lv',
    hu: 'hu',
    lt: 'lt',
    ro: 'ro',
    no: 'no',
  };
  return map[locale] ?? null;
}

export type SegmentLabelTerminology = {
  type?: { value?: string; meaning?: string } | null;
  typeModifier?: { value?: string; meaning?: string } | null;
} | null | undefined;

function normalizeEnglish(label: string): string {
  return String(label || '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Stable cache key: prefer SCT type(+modifier), else English label. */
export function segmentLabelCacheKey(
  label: string,
  terminology?: SegmentLabelTerminology
): string {
  const typeVal = String(terminology?.type?.value || '').trim();
  const modVal = String(terminology?.typeModifier?.value || '').trim();
  if (typeVal) return modVal ? `${typeVal}|${modVal}` : typeVal;
  return normalizeEnglish(label).toLowerCase();
}

function englishDisplay(
  label: string,
  terminology?: SegmentLabelTerminology
): string {
  const fromLabel = normalizeEnglish(label);
  if (fromLabel) return fromLabel;
  return String(terminology?.type?.meaning || '').trim();
}

type CacheStore = Record<string, string>;

function loadPersistentCache(): CacheStore {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: CacheStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function savePersistentCache(store: CacheStore): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

const memoryCache: CacheStore = { ...loadPersistentCache() };
const inflight = new Map<string, Promise<string>>();

function cacheGet(
  locale: AppLocale,
  key: string,
  english?: string
): string | undefined {
  const full = `${locale}|${key}`;
  const staticMap = SEGMENT_LABELS_STATIC[locale];
  if (staticMap?.[key]) return staticMap[key];
  if (staticMap?.[full]) return staticMap[full];
  const enKey = normalizeEnglish(english || '').toLowerCase();
  if (enKey && staticMap?.[enKey]) return staticMap[enKey];
  return memoryCache[full] || (enKey ? memoryCache[`${locale}|${enKey}`] : undefined);
}

function cacheSet(locale: AppLocale, key: string, value: string, english?: string): void {
  const full = `${locale}|${key}`;
  memoryCache[full] = value;
  const enKey = normalizeEnglish(english || '').toLowerCase();
  if (enKey && enKey !== key) memoryCache[`${locale}|${enKey}`] = value;
  savePersistentCache(memoryCache);
}

/**
 * Synchronous best-effort: static + local cache only (no network).
 * Use for first paint; call {@link ensureSegmentLabelsTranslated} to fill gaps.
 */
export function segmentDisplayNameSync(
  label: string,
  terminology?: SegmentLabelTerminology,
  locale?: AppLocale
): string {
  const code = locale || resolveStoredLocale();
  const en = englishDisplay(label, terminology);
  if (!en) return '';
  if (code === 'en') return en;
  const key = segmentLabelCacheKey(en, terminology);
  return cacheGet(code, key, en) || en;
}

export type TranslateHubOptions = {
  /** Hub HTTP origin, e.g. http://127.0.0.1:2018 */
  hubOrigin: string;
};

async function translateViaHub(
  texts: string[],
  target: string,
  hubOrigin: string
): Promise<(string | null)[]> {
  const origin = String(hubOrigin || '').replace(/\/$/, '');
  if (!origin || !texts.length) return texts.map(() => null);
  const url = `${origin}/api/hub/translate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target, source: 'en' }),
  });
  if (!res.ok) return texts.map(() => null);
  const data = (await res.json()) as { translations?: unknown };
  const list = Array.isArray(data.translations) ? data.translations : [];
  return texts.map((_, i) => {
    const t = list[i];
    return typeof t === 'string' && t.trim() ? t.trim() : null;
  });
}

/**
 * Ensure labels are translated for locale; returns map English→display
 * (static table → localStorage → hub Claude). Missing hub / errors → English.
 */
export async function ensureSegmentLabelsTranslated(
  items: Array<{ label: string; terminology?: SegmentLabelTerminology }>,
  opts: TranslateHubOptions & { locale?: AppLocale }
): Promise<Map<string, string>> {
  const locale = opts.locale || resolveStoredLocale();
  const out = new Map<string, string>();
  const target = translateTargetForLocale(locale);
  const need: { en: string; key: string }[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const en = englishDisplay(item.label, item.terminology);
    if (!en) continue;
    if (!target) {
      out.set(en, en);
      continue;
    }
    const key = segmentLabelCacheKey(en, item.terminology);
    const hit = cacheGet(locale, key, en);
    if (hit) {
      out.set(en, hit);
      continue;
    }
    if (!seen.has(key)) {
      seen.add(key);
      need.push({ en, key });
    }
  }

  if (!target || !need.length) {
    for (const item of items) {
      const en = englishDisplay(item.label, item.terminology);
      if (en && !out.has(en)) out.set(en, en);
    }
    return out;
  }

  const batchKey = `${locale}|${need.map((n) => n.key).join(',')}`;
  let promise = inflight.get(batchKey);
  if (!promise) {
    promise = (async () => {
      const translated = await translateViaHub(
        need.map((n) => n.en),
        target,
        opts.hubOrigin
      );
      need.forEach((n, i) => {
        const t = translated[i];
        if (t && t !== n.en) cacheSet(locale, n.key, t, n.en);
      });
      return '';
    })();
    inflight.set(batchKey, promise);
    try {
      await promise;
    } finally {
      inflight.delete(batchKey);
    }
  } else {
    await promise;
  }

  for (const item of items) {
    const en = englishDisplay(item.label, item.terminology);
    if (!en) continue;
    const key = segmentLabelCacheKey(en, item.terminology);
    out.set(en, cacheGet(locale, key, en) || en);
  }
  return out;
}

/** Translate one label (uses batch helper). */
export async function segmentDisplayName(
  label: string,
  terminology: SegmentLabelTerminology,
  opts: TranslateHubOptions & { locale?: AppLocale }
): Promise<string> {
  const en = englishDisplay(label, terminology);
  if (!en) return '';
  const map = await ensureSegmentLabelsTranslated([{ label: en, terminology }], opts);
  return map.get(en) || en;
}
