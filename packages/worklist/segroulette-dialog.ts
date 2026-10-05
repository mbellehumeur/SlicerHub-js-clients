/**
 * SegRoulette slot dialog — auto-spin on open; mouse wheel/click to change each reel.
 */
import {
  humanizeCollection,
  loadSegrouletteCatalog,
  reelSpinLabels,
  seriesReelLabel,
  spinSegrouletteEntry,
  type SegrouletteCatalog,
  type SegrouletteEntry,
} from './segroulette-catalog';

export type SegrouletteDialogHandlers = {
  onOpen: (entry: SegrouletteEntry) => void | Promise<void>;
  onAddToWorklist: (entry: SegrouletteEntry) => void | Promise<void>;
};

const ITEM_H = 40;

let catalog: SegrouletteCatalog | null = null;
let spinning = false;
/** Current selection after spin / mouse adjust. */
let region = '';
let collection = '';
let entry: SegrouletteEntry | null = null;
let wired = false;

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function fillReelStrip(
  strip: HTMLElement,
  labels: string[],
  finalLabel: string
): void {
  strip.replaceChildren();
  for (const text of [...labels, finalLabel]) {
    const item = document.createElement('div');
    item.className = 'wl-slot-item';
    item.textContent = text;
    strip.append(item);
  }
}

function showSingleOnReel(strip: HTMLElement, label: string): void {
  strip.replaceChildren();
  const item = document.createElement('div');
  item.className = 'wl-slot-item';
  item.textContent = label;
  strip.append(item);
  strip.style.transition = 'none';
  strip.style.transform = 'translateY(0)';
}

function animateReel(
  strip: HTMLElement,
  durationMs: number,
  delayMs: number
): Promise<void> {
  return new Promise((resolve) => {
    const count = strip.children.length;
    const targetY = -((count - 1) * ITEM_H);
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0)';
    void strip.offsetWidth;
    window.setTimeout(() => {
      strip.style.transition = `transform ${durationMs}ms cubic-bezier(0.12, 0.75, 0.12, 1)`;
      strip.style.transform = `translateY(${targetY}px)`;
      window.setTimeout(resolve, durationMs + 40);
    }, delayMs);
  });
}

async function ensureCatalog(statusEl: HTMLElement): Promise<SegrouletteCatalog> {
  if (catalog) return catalog;
  statusEl.textContent = 'Loading catalog…';
  catalog = await loadSegrouletteCatalog();
  return catalog;
}

function collectionsInRegion(cat: SegrouletteCatalog, reg: string): string[] {
  const byCol = cat.byRegion.get(reg);
  return byCol ? [...byCol.keys()].sort((a, b) => a.localeCompare(b)) : [];
}

function entriesInCollection(
  cat: SegrouletteCatalog,
  reg: string,
  col: string
): SegrouletteEntry[] {
  return cat.byRegion.get(reg)?.get(col) || [];
}

function updateStatus(): void {
  const statusEl = el<HTMLElement>('segrouletteStatus');
  if (!entry) {
    statusEl.textContent = '—';
    return;
  }
  statusEl.textContent = `${region} · ${humanizeCollection(collection)} · ${seriesReelLabel(entry)}`;
}

function setActionButtonsEnabled(on: boolean): void {
  el<HTMLButtonElement>('segrouletteOpenBtn').disabled = !on;
  el<HTMLButtonElement>('segrouletteAddBtn').disabled = !on;
  const spinBtn = document.getElementById(
    'segrouletteSpinBtn'
  ) as HTMLButtonElement | null;
  if (spinBtn) spinBtn.disabled = !on;
}

function syncReelsFromSelection(): void {
  if (!entry) return;
  showSingleOnReel(el('segrouletteReelRegion'), region);
  showSingleOnReel(
    el('segrouletteReelCollection'),
    humanizeCollection(collection)
  );
  showSingleOnReel(el('segrouletteReelSeries'), seriesReelLabel(entry));
  updateStatus();
}

function applySelection(
  nextRegion: string,
  nextCollection: string,
  nextEntry: SegrouletteEntry
): void {
  region = nextRegion;
  collection = nextCollection;
  entry = nextEntry;
  syncReelsFromSelection();
}

function nudgeRegion(cat: SegrouletteCatalog, delta: number): void {
  const list = cat.regions;
  if (!list.length) return;
  let i = list.indexOf(region);
  if (i < 0) i = 0;
  i = (i + delta + list.length) % list.length;
  const reg = list[i];
  const cols = collectionsInRegion(cat, reg);
  const col = cols[0];
  const entries = entriesInCollection(cat, reg, col);
  if (!entries.length) return;
  applySelection(reg, col, entries[0]);
}

function nudgeCollection(cat: SegrouletteCatalog, delta: number): void {
  const cols = collectionsInRegion(cat, region);
  if (!cols.length) return;
  let i = cols.indexOf(collection);
  if (i < 0) i = 0;
  i = (i + delta + cols.length) % cols.length;
  const col = cols[i];
  const entries = entriesInCollection(cat, region, col);
  if (!entries.length) return;
  applySelection(region, col, entries[0]);
}

function nudgeSeries(cat: SegrouletteCatalog, delta: number): void {
  const entries = entriesInCollection(cat, region, collection);
  if (!entries.length || !entry) return;
  let i = entries.findIndex((e) => e.c === entry!.c);
  if (i < 0) i = 0;
  i = (i + delta + entries.length) % entries.length;
  applySelection(region, collection, entries[i]);
}

function bindReelInteraction(
  windowId: string,
  nudge: (delta: number) => void
): void {
  const win = el<HTMLElement>(windowId);
  win.tabIndex = 0;
  win.classList.add('wl-slot-interactive');
  win.title = 'Scroll or click to change';
  win.addEventListener(
    'wheel',
    (ev) => {
      if (spinning || !catalog) return;
      ev.preventDefault();
      nudge(ev.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );
  win.addEventListener('click', (ev) => {
    if (spinning || !catalog) return;
    const rect = win.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    nudge(ev.clientY >= mid ? 1 : -1);
  });
}

async function runIntroSpin(cat: SegrouletteCatalog): Promise<void> {
  const statusEl = el<HTMLElement>('segrouletteStatus');
  spinning = true;
  setActionButtonsEnabled(false);
  statusEl.textContent = 'Spinning…';

  const result = spinSegrouletteEntry(cat);
  region = result.region;
  collection = result.collection;
  entry = result.entry;

  const regionStrip = el<HTMLElement>('segrouletteReelRegion');
  const colStrip = el<HTMLElement>('segrouletteReelCollection');
  const seriesStrip = el<HTMLElement>('segrouletteReelSeries');

  fillReelStrip(regionStrip, reelSpinLabels(cat, 'region'), result.region);
  fillReelStrip(
    colStrip,
    reelSpinLabels(cat, 'collection'),
    humanizeCollection(result.collection)
  );
  fillReelStrip(
    seriesStrip,
    reelSpinLabels(cat, 'series'),
    seriesReelLabel(result.entry)
  );

  await Promise.all([
    animateReel(regionStrip, 1400, 0),
    animateReel(colStrip, 1700, 180),
    animateReel(seriesStrip, 2000, 360),
  ]);

  syncReelsFromSelection();
  spinning = false;
  setActionButtonsEnabled(true);
}

export function openSegrouletteDialog(handlers: SegrouletteDialogHandlers): void {
  const backdrop = el<HTMLElement>('segrouletteModal');
  const statusEl = el<HTMLElement>('segrouletteStatus');
  const openBtn = el<HTMLButtonElement>('segrouletteOpenBtn');
  const addBtn = el<HTMLButtonElement>('segrouletteAddBtn');
  const spinBtn = el<HTMLButtonElement>('segrouletteSpinBtn');

  entry = null;
  setActionButtonsEnabled(false);
  backdrop.hidden = false;
  statusEl.textContent = 'Loading catalog…';

  if (!wired) {
    wired = true;
    bindReelInteraction('segrouletteWindowRegion', (d) => {
      if (catalog) nudgeRegion(catalog, d);
    });
    bindReelInteraction('segrouletteWindowCollection', (d) => {
      if (catalog) nudgeCollection(catalog, d);
    });
    bindReelInteraction('segrouletteWindowSeries', (d) => {
      if (catalog) nudgeSeries(catalog, d);
    });

    spinBtn.addEventListener('click', () => {
      if (spinning || !catalog) return;
      void runIntroSpin(catalog).catch((err) => {
        spinning = false;
        setActionButtonsEnabled(true);
        statusEl.textContent =
          err instanceof Error ? err.message : 'Spin failed';
      });
    });
    openBtn.addEventListener('click', () => {
      if (!entry || spinning) return;
      const chosen = entry;
      backdrop.hidden = true;
      void Promise.resolve(handlers.onOpen(chosen));
    });
    addBtn.addEventListener('click', () => {
      if (!entry || spinning) return;
      void Promise.resolve(handlers.onAddToWorklist(entry)).then(() => {
        statusEl.textContent = `Added to worklist · ${seriesReelLabel(entry!)}`;
      });
    });
    backdrop.querySelectorAll('[data-close-segroulette]').forEach((node) => {
      node.addEventListener('click', () => {
        if (spinning) return;
        backdrop.hidden = true;
      });
    });
  }

  void ensureCatalog(statusEl)
    .then((cat) => runIntroSpin(cat))
    .catch((err) => {
      spinning = false;
      statusEl.textContent =
        err instanceof Error ? err.message : 'Failed to load catalog';
    });
}
