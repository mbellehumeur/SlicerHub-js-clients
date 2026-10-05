/**
 * Position a modal dialog near an anchor control (e.g. session-info by the user capsule).
 */

/**
 * @param {HTMLElement | null | undefined} overlay full-screen backdrop
 * @param {HTMLElement | null | undefined} dialog panel inside the overlay
 * @param {string} [anchoredClass] class toggled on the overlay while anchored
 */
export function clearHubDialogNearAnchor(
  overlay,
  dialog,
  anchoredClass = 'hub-dialog-anchored'
) {
  if (overlay instanceof HTMLElement) {
    overlay.classList.remove(anchoredClass);
  }
  if (dialog instanceof HTMLElement) {
    dialog.style.top = '';
    dialog.style.left = '';
    dialog.style.right = '';
    dialog.style.bottom = '';
    dialog.style.maxWidth = '';
    dialog.style.position = '';
    dialog.style.margin = '';
  }
}

/**
 * Place ``dialog`` under/near ``anchor`` inside a fixed overlay.
 * Falls back to centered overlay layout when anchor is missing.
 *
 * @param {{
 *   overlay: HTMLElement | null | undefined,
 *   dialog: HTMLElement | null | undefined,
 *   anchor?: HTMLElement | null,
 *   anchoredClass?: string,
 *   gap?: number,
 *   pad?: number,
 *   align?: 'start' | 'end',
 * }} options
 */
export function placeHubDialogNearAnchor(options) {
  const overlay = options?.overlay;
  const dialog = options?.dialog;
  const anchor = options?.anchor;
  const anchoredClass = String(options?.anchoredClass || 'hub-dialog-anchored').trim();
  const gap = Number.isFinite(options?.gap) ? Number(options.gap) : 6;
  const pad = Number.isFinite(options?.pad) ? Number(options.pad) : 8;
  const alignEnd = options?.align === 'end';

  if (!(overlay instanceof HTMLElement) || !(dialog instanceof HTMLElement)) {
    return;
  }
  if (!(anchor instanceof HTMLElement)) {
    clearHubDialogNearAnchor(overlay, dialog, anchoredClass);
    return;
  }

  const rect = anchor.getBoundingClientRect();
  overlay.classList.add(anchoredClass);
  dialog.style.position = 'absolute';
  dialog.style.margin = '0';

  const width = Math.max(
    280,
    Math.min(dialog.offsetWidth || 480, window.innerWidth - pad * 2)
  );
  // start: left edge under anchor; end: right edge under anchor (close btn near ?).
  let left = alignEnd ? rect.right - width : rect.left;
  let top = rect.bottom + gap;
  const maxLeft = window.innerWidth - width - pad;
  if (left > maxLeft) left = Math.max(pad, maxLeft);
  if (left < pad) left = pad;
  const dialogHeight = dialog.offsetHeight || 280;
  if (top + dialogHeight > window.innerHeight - pad) {
    top = Math.max(pad, rect.top - dialogHeight - gap);
  }
  dialog.style.left = `${Math.round(left)}px`;
  dialog.style.top = `${Math.round(top)}px`;
  dialog.style.maxWidth = `${Math.round(width)}px`;
}
