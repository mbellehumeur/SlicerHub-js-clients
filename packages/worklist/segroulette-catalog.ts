/**
 * SegRoulette manifest load + region/collection tree.
 * Compact: ./segroulette.json (slot dialog).
 * Enriched: ./segroulette-idc.json (IDC worklist rows; sizeMB + modalities + idx).
 */

export type IdcIndexRecord = Record<string, unknown>;

export type SegrouletteEntry = {
  /** CT/MR/PET CRDC series UUID */
  c: string;
  /** SEG CRDC UUID */
  s?: string;
  /** modality */
  m: string;
  /** IDC collection id */
  col: string;
  cb?: string;
  sb?: string;
  st?: string;
  sd?: string;
  lic?: string;
  pid?: string;
  u?: string;
  su?: string;
  sz?: number;
  idoi?: string;
  sdoi?: string;
  /** Full case size (source + SEG) from idc-index enrichment. */
  sizeMB?: number;
  sizeSourceMB?: number;
  sizeSegMB?: number;
  /** e.g. ["CT", "SEG"] */
  modalities?: string[];
  ctIdx?: IdcIndexRecord;
  segIdx?: IdcIndexRecord;
  /** Baked worklist category id (slim catalog). */
  idcCategory?: string;
  /** Baked display prefix for worklist row names (slim catalog). */
  namePrefix?: string;
};

type CollMeta = {
  loc?: string;
  cases?: number;
  segSrc?: string;
};

export type SegrouletteCatalog = {
  entries: SegrouletteEntry[];
  /** region -> collection -> entries */
  byRegion: Map<string, Map<string, SegrouletteEntry[]>>;
  regions: string[];
};

const MANIFEST_URL = './segroulette.json';
/** Enriched sidecar from tools/enrich_segroulette_idc_index.py — builder input. */
const IDC_MANIFEST_URL = './segroulette-idc.json';
/** Slim, size-sorted worklist catalog from tools/build_segroulette_worklist.py. */
const WORKLIST_MANIFEST_URL = './segroulette-worklist.json';

let cached: SegrouletteCatalog | null = null;
let loadPromise: Promise<SegrouletteCatalog> | null = null;
let cachedIdc: SegrouletteCatalog | null = null;
let loadIdcPromise: Promise<SegrouletteCatalog> | null = null;
let cachedWorklist: SegrouletteEntry[] | null = null;
let loadWorklistPromise: Promise<SegrouletteEntry[]> | null = null;

/** Primary body-region token from collMeta.loc (e.g. "CHEST, ABDOMEN" → "CHEST"). */
export function primaryRegion(loc: string | undefined, fallbackCol: string): string {
  const raw = String(loc || '').trim();
  if (!raw) return 'OTHER';
  const first = raw.split(',')[0]?.trim().toUpperCase();
  return first || 'OTHER';
}

export function humanizeCollection(col: string): string {
  return String(col || '')
    .replace(/_/g, ' ')
    .trim();
}

export function seriesReelLabel(entry: SegrouletteEntry): string {
  const mod = String(entry.m || '?').toUpperCase();
  const sd = String(entry.sd || 'Segmentation').trim();
  const short = sd.length > 36 ? `${sd.slice(0, 34)}…` : sd;
  return `${mod} · ${short}`;
}

function buildCatalog(
  rows: SegrouletteEntry[],
  collMeta: Record<string, CollMeta>
): SegrouletteCatalog {
  const byRegion = new Map<string, Map<string, SegrouletteEntry[]>>();
  for (const row of rows) {
    if (!row?.c || !row?.col) continue;
    const meta = collMeta[row.col] || {};
    const region = primaryRegion(meta.loc, row.col);
    let byCol = byRegion.get(region);
    if (!byCol) {
      byCol = new Map();
      byRegion.set(region, byCol);
    }
    const list = byCol.get(row.col) || [];
    list.push(row);
    byCol.set(row.col, list);
  }
  const regions = [...byRegion.keys()].sort((a, b) => a.localeCompare(b));
  return { entries: rows, byRegion, regions };
}

export type CatalogEntryWithRegion = {
  entry: SegrouletteEntry;
  region: string;
};

/**
 * All series in each allowed body region (catalog / collection order). No per-region cap.
 */
export function entriesForBodyRegions(
  catalog: SegrouletteCatalog,
  allowedRegions: Set<string>
): CatalogEntryWithRegion[] {
  const picked: CatalogEntryWithRegion[] = [];
  for (const region of catalog.regions) {
    if (!allowedRegions.has(region)) continue;
    const byCol = catalog.byRegion.get(region);
    if (!byCol) continue;
    const collections = [...byCol.keys()].sort((a, b) => a.localeCompare(b));
    for (const col of collections) {
      const list = byCol.get(col);
      if (!list?.length) continue;
      for (const entry of list) {
        picked.push({ entry, region });
      }
    }
  }
  return picked;
}

/** @deprecated Use entriesForBodyRegions — kept name for older call sites. */
export function entriesPerCategoryCapped(
  catalog: SegrouletteCatalog,
  allowed: Set<string>,
  _cap?: number
): CatalogEntryWithRegion[] {
  return entriesForBodyRegions(catalog, allowed);
}

async function fetchCatalog(url: string): Promise<SegrouletteCatalog> {
  const res = await fetch(`${url}?t=${Date.now()}`);
  if (!res.ok) {
    throw new Error(`Failed to load SegRoulette catalog ${url} (HTTP ${res.status})`);
  }
  const data = await res.json();
  const rows = (Array.isArray(data.rows) ? data.rows : data) as SegrouletteEntry[];
  const collMeta = (data.stats?.collMeta || {}) as Record<string, CollMeta>;
  return buildCatalog(rows, collMeta);
}

/** Compact catalog for the SegRoulette slot dialog. */
export async function loadSegrouletteCatalog(): Promise<SegrouletteCatalog> {
  if (cached) return cached;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    cached = await fetchCatalog(MANIFEST_URL);
    return cached;
  })();
  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

/**
 * Enriched catalog for IDC worklist rows (sizeMB, modalities, ctIdx/segIdx).
 * Falls back to the compact catalog if the sidecar is missing.
 * Prefer loadWorklistCatalogRows() for the Hub worklist table.
 */
export async function loadIdcEnrichedCatalog(): Promise<SegrouletteCatalog> {
  if (cachedIdc) return cachedIdc;
  if (loadIdcPromise) return loadIdcPromise;
  loadIdcPromise = (async () => {
    try {
      cachedIdc = await fetchCatalog(IDC_MANIFEST_URL);
      return cachedIdc;
    } catch (err) {
      console.warn(
        '[@slicer-hub/worklist] segroulette-idc.json unavailable; falling back to compact catalog',
        err
      );
      loadIdcPromise = null;
      return loadSegrouletteCatalog();
    }
  })();
  try {
    return await loadIdcPromise;
  } catch (err) {
    loadIdcPromise = null;
    throw err;
  }
}

/**
 * Slim worklist rows (already size-sorted, idcCategory + namePrefix baked in).
 * Falls back to deriving from the enriched catalog if the slim file is missing.
 */
export async function loadWorklistCatalogRows(): Promise<SegrouletteEntry[]> {
  if (cachedWorklist) return cachedWorklist;
  if (loadWorklistPromise) return loadWorklistPromise;
  loadWorklistPromise = (async () => {
    try {
      const res = await fetch(`${WORKLIST_MANIFEST_URL}?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(
          `Failed to load ${WORKLIST_MANIFEST_URL} (HTTP ${res.status})`
        );
      }
      const data = await res.json();
      const rows = (Array.isArray(data.rows) ? data.rows : data) as SegrouletteEntry[];
      cachedWorklist = rows.filter((r) => r?.c && r?.col && r.idcCategory);
      return cachedWorklist;
    } catch (err) {
      console.warn(
        '[@slicer-hub/worklist] segroulette-worklist.json unavailable; deriving from enriched catalog',
        err
      );
      loadWorklistPromise = null;
      throw err;
    }
  })();
  try {
    return await loadWorklistPromise;
  } catch (err) {
    loadWorklistPromise = null;
    throw err;
  }
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Collection-uniform-ish: region → collection → entry. */
export function spinSegrouletteEntry(catalog: SegrouletteCatalog): {
  region: string;
  collection: string;
  entry: SegrouletteEntry;
} {
  const region = pickRandom(catalog.regions);
  const byCol = catalog.byRegion.get(region)!;
  const collections = [...byCol.keys()];
  const collection = pickRandom(collections);
  const entry = pickRandom(byCol.get(collection)!);
  return { region, collection, entry };
}

/** Labels to flash on a reel while spinning (deduped, shuffled sample). */
export function reelSpinLabels(
  catalog: SegrouletteCatalog,
  kind: 'region' | 'collection' | 'series',
  count = 24
): string[] {
  const set = new Set<string>();
  if (kind === 'region') {
    for (const r of catalog.regions) set.add(r);
  } else if (kind === 'collection') {
    for (const byCol of catalog.byRegion.values()) {
      for (const col of byCol.keys()) set.add(humanizeCollection(col));
    }
  } else {
    for (const e of catalog.entries) {
      set.add(seriesReelLabel(e));
      if (set.size >= 80) break;
    }
  }
  const all = [...set];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const out: string[] = [];
  while (out.length < count) {
    out.push(...all);
  }
  return out.slice(0, count);
}
