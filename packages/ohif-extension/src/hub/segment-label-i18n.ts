/**
 * Display-name localization for OHIF segment panel labels — same pipeline as IRA:
 * static locale tables → localStorage cache → hub Claude (`POST /api/hub/translate`).
 * English originals are kept in a map so re-runs do not re-translate localized text.
 */

import i18n from '@ohif/i18n';
import {
  type AppLocale,
  ensureSegmentLabelsTranslated,
  ohifLngToAppLocale,
  resolveStoredLocale,
  translateTargetForLocale,
} from '@slicer-hub/i18n';
import { LOG_PREFIX } from './constants';

type SegmentLike = {
  segmentIndex?: number;
  label?: string;
  cachedStats?: {
    type?: string;
    category?: string;
  };
};

type SegmentationLike = {
  segmentationId?: string;
  id?: string;
  segments?: Record<string, SegmentLike> | SegmentLike[];
};

type SegmentationServiceLike = {
  EVENTS?: {
    SEGMENTATION_ADDED?: string;
    SEGMENTATION_MODIFIED?: string;
  };
  subscribe?: (
    eventName: string,
    callback: (evt?: unknown) => void
  ) => { unsubscribe: () => void };
  getSegmentations?: () => SegmentationLike[];
  setSegmentLabel?: (
    segmentationId: string,
    segmentIndex: number,
    label: string
  ) => void;
};

export type WireSegmentLabelI18nOpts = {
  getSegmentationService: () => SegmentationServiceLike | undefined | null;
  getHubEndpoint: () => string;
};

function hubOriginFromEndpoint(hubEndpoint: string): string {
  const trimmed = String(hubEndpoint || '').trim();
  if (!trimmed) return '';
  try {
    const origin = new URL(trimmed).origin;
    return origin.replace(/\/$/, '');
  } catch {
    return String(trimmed)
      .replace(/\/api\/hub\/?$/i, '')
      .replace(/\/$/, '');
  }
}

function resolveLocale(): AppLocale {
  if (typeof window !== 'undefined') {
    try {
      const fromUrl = ohifLngToAppLocale(
        new URLSearchParams(window.location.search).get('lng')
      );
      if (fromUrl) return fromUrl;
    } catch {
      /* ignore */
    }
  }
  const fromI18n = ohifLngToAppLocale(
    (i18n as { language?: string } | undefined)?.language
  );
  if (fromI18n) return fromI18n;
  return resolveStoredLocale();
}

function listSegments(
  segmentation: SegmentationLike
): Array<{ segmentIndex: number; label: string }> {
  const raw = segmentation.segments;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((s, i) => {
        const segmentIndex =
          typeof s.segmentIndex === 'number' ? s.segmentIndex : i;
        const label = String(s.label || '').trim();
        return label ? { segmentIndex, label } : null;
      })
      .filter((x): x is { segmentIndex: number; label: string } => Boolean(x));
  }
  const out: Array<{ segmentIndex: number; label: string }> = [];
  for (const [key, s] of Object.entries(raw)) {
    if (!s || key === '0') continue;
    const segmentIndex =
      typeof s.segmentIndex === 'number' ? s.segmentIndex : Number(key);
    if (!Number.isFinite(segmentIndex) || segmentIndex <= 0) continue;
    const label = String(s.label || '').trim();
    if (label) out.push({ segmentIndex, label });
  }
  return out;
}

/**
 * Subscribe to segmentation events and localize segment labels for the active locale.
 * Returns an unsubscribe function.
 */
export function wireSegmentLabelI18n(
  opts: WireSegmentLabelI18nOpts
): () => void {
  const englishByKey = new Map<string, string>();
  let applying = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const unsubscribers: Array<() => void> = [];

  const refresh = (): void => {
    void (async () => {
      const segmentationService = opts.getSegmentationService();
      if (!segmentationService?.getSegmentations || !segmentationService.setSegmentLabel) {
        return;
      }
      const locale = resolveLocale();
      if (!translateTargetForLocale(locale)) {
        return;
      }
      const hubOrigin = hubOriginFromEndpoint(opts.getHubEndpoint());
      if (!hubOrigin) {
        return;
      }

      const segmentations = segmentationService.getSegmentations() || [];
      const items: Array<{
        key: string;
        segmentationId: string;
        segmentIndex: number;
        label: string;
      }> = [];

      for (const seg of segmentations) {
        const segmentationId = String(
          seg.segmentationId || seg.id || ''
        ).trim();
        if (!segmentationId) continue;
        for (const { segmentIndex, label } of listSegments(seg)) {
          const key = `${segmentationId}|${segmentIndex}`;
          const english = englishByKey.get(key) || label;
          if (!englishByKey.has(key)) {
            englishByKey.set(key, english);
          }
          items.push({ key, segmentationId, segmentIndex, label: english });
        }
      }

      if (!items.length) return;

      let map: Map<string, string>;
      try {
        map = await ensureSegmentLabelsTranslated(
          items.map(i => ({ label: i.label })),
          { hubOrigin, locale }
        );
      } catch (err) {
        console.warn(`${LOG_PREFIX} segment label translate failed`, err);
        return;
      }

      applying = true;
      try {
        for (const item of items) {
          const next = map.get(item.label) || item.label;
          if (!next || next === item.label) continue;
          const current =
            listSegments(
              segmentations.find(
                s =>
                  String(s.segmentationId || s.id || '') === item.segmentationId
              ) || {}
            ).find(s => s.segmentIndex === item.segmentIndex)?.label || '';
          if (current === next) continue;
          segmentationService.setSegmentLabel?.(
            item.segmentationId,
            item.segmentIndex,
            next
          );
        }
      } finally {
        applying = false;
      }
    })();
  };

  const scheduleRefresh = (): void => {
    if (applying) return;
    if (debounceTimer != null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      refresh();
    }, 80);
  };

  const trySubscribe = (): boolean => {
    const segmentationService = opts.getSegmentationService();
    if (!segmentationService?.subscribe || !segmentationService.EVENTS) {
      return false;
    }
    const added = segmentationService.EVENTS.SEGMENTATION_ADDED;
    const modified = segmentationService.EVENTS.SEGMENTATION_MODIFIED;
    if (added) {
      const { unsubscribe } = segmentationService.subscribe(
        added,
        scheduleRefresh
      );
      unsubscribers.push(unsubscribe);
    }
    if (modified) {
      const { unsubscribe } = segmentationService.subscribe(
        modified,
        scheduleRefresh
      );
      unsubscribers.push(unsubscribe);
    }
    scheduleRefresh();
    return unsubscribers.length > 0;
  };

  if (!trySubscribe()) {
    // SegmentationService may register after HubService; retry briefly.
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (trySubscribe() || attempts >= 40) {
        clearInterval(timer);
      }
    }, 250);
    unsubscribers.push(() => clearInterval(timer));
  }

  return () => {
    if (debounceTimer != null) clearTimeout(debounceTimer);
    for (const u of unsubscribers) {
      try {
        u();
      } catch {
        /* ignore */
      }
    }
    unsubscribers.length = 0;
  };
}
