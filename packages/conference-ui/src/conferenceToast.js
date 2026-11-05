/**
 * Short-lived info toast for conference lead changes (vanilla DOM).
 * @param {string} message
 * @param {{ ms?: number, root?: ParentNode, classPrefix?: string }} [options]
 */
export function showHubInfoToast(message, options = {}) {
  const text = String(message || '').trim();
  if (!text || typeof document === 'undefined') {
    return;
  }
  const ms = Math.max(1000, Number(options.ms) || 4000);
  const prefix = String(options.classPrefix || 'hub-info-toast').trim();
  const root =
    options.root ||
    (typeof document !== 'undefined' ? document.body : null);
  if (!root) {
    return;
  }

  const existing = root.querySelector?.(`.${prefix}`);
  if (existing) {
    existing.remove();
  }

  const el = document.createElement('div');
  el.className = prefix;
  el.setAttribute('role', 'status');
  el.textContent = text;
  el.style.cssText = [
    'position:fixed',
    'left:50%',
    'bottom:28px',
    'transform:translateX(-50%)',
    'z-index:10050',
    'max-width:min(420px,calc(100vw - 32px))',
    'padding:10px 16px',
    'border-radius:8px',
    'background:#1a2332',
    'color:#e8eef8',
    'font:600 13px/1.35 -apple-system,system-ui,sans-serif',
    'box-shadow:0 8px 28px rgba(0,0,0,.35)',
    'pointer-events:none',
  ].join(';');
  root.appendChild(el);
  window.setTimeout(() => {
    el.remove();
  }, ms);
}
