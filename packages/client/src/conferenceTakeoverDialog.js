import { mergeCastConferenceStrings } from './conferenceStrings.js';

/**
 * Confirm before taking over conference scene-update lead.
 * @param {{
 *   root?: ParentNode,
 *   classPrefix?: string,
 *   strings?: Partial<import('./conferenceStrings.js').CastConferenceStrings>,
 * }} [options]
 * @returns {Promise<boolean>} true if the user confirmed Take over
 */
export function confirmHubConferenceTakeover(options = {}) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }
    const s = mergeCastConferenceStrings(options.strings);
    const prefix = String(
      options.classPrefix || 'hub-conference-takeover'
    ).trim();
    const root = options.root || document.body;

    const overlay = document.createElement('div');
    overlay.className = `${prefix}-overlay`;
    overlay.setAttribute('role', 'presentation');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:10040',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:rgba(0,0,0,.45)',
      'padding:16px',
    ].join(';');

    const dialog = document.createElement('div');
    dialog.className = `${prefix}-dialog`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', `${prefix}-title`);
    dialog.tabIndex = -1;
    dialog.style.cssText = [
      'width:min(420px,100%)',
      'background:#121820',
      'color:#e8eef8',
      'border:1px solid #33507e',
      'border-radius:10px',
      'box-shadow:0 16px 40px rgba(0,0,0,.4)',
      'padding:18px 18px 14px',
      'font:14px/1.45 -apple-system,system-ui,sans-serif',
    ].join(';');

    dialog.innerHTML = `
      <h2 id="${prefix}-title" style="margin:0 0 10px;font:700 16px/1.3 -apple-system,system-ui,sans-serif;"></h2>
      <p data-hub-takeover-body style="margin:0 0 16px;opacity:.92;"></p>
      <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
        <button type="button" data-hub-takeover-cancel style="padding:7px 12px;border-radius:6px;border:1px solid #4a628a;background:#1a2332;color:#e8eef8;cursor:pointer;font:600 13px -apple-system,system-ui,sans-serif;"></button>
        <button type="button" data-hub-takeover-confirm style="padding:7px 12px;border-radius:6px;border:1px solid #2b6cb0;background:#2b6cb0;color:#fff;cursor:pointer;font:600 13px -apple-system,system-ui,sans-serif;"></button>
      </div>
    `;

    const titleEl = dialog.querySelector(`#${prefix}-title`);
    const bodyEl = dialog.querySelector('[data-hub-takeover-body]');
    const cancelBtn = dialog.querySelector('[data-hub-takeover-cancel]');
    const confirmBtn = dialog.querySelector('[data-hub-takeover-confirm]');
    if (titleEl) titleEl.textContent = s.takeoverTitle;
    if (bodyEl) bodyEl.textContent = s.takeoverBody;
    if (cancelBtn) cancelBtn.textContent = s.cancel;
    if (confirmBtn) confirmBtn.textContent = s.takeOver;

    overlay.appendChild(dialog);
    root.appendChild(overlay);

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      overlay.remove();
      resolve(Boolean(ok));
    };

    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) finish(false);
    });
    cancelBtn?.addEventListener('click', () => finish(false));
    confirmBtn?.addEventListener('click', () => finish(true));
    dialog.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        finish(false);
      }
    });
    dialog.focus({ preventScroll: true });
  });
}
