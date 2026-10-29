/** Parent → MView TeachingPortal embed commands (same shape as FU it.vetmed status.js). */

export type MviewEmbedCommand = 'toggleLabels' | 'startQuiz' | 'stopQuiz';

/**
 * MView only accepts postMessage from these parent hosts (see mview-app.js
 * quickPreviewTeachingEmbedMessageAllowed). Cloud Classroom must use URL params.
 */
export function mviewPostMessageAllowed(
  hostname: string = typeof location !== 'undefined' ? location.hostname : ''
): boolean {
  const host = String(hostname || '').toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'it.vetmed.fu-berlin.de' ||
    host.endsWith('.vetmed.fu-berlin.de')
  );
}

/**
 * Post `{ type: 'mview:command', action }` to the iframe, targeting the embed origin.
 * Returns false if the frame has no contentWindow or an unparseable src.
 */
export function postMviewCommand(
  iframe: HTMLIFrameElement | null | undefined,
  action: string
): boolean {
  if (!iframe?.contentWindow || !action) return false;
  try {
    const src = iframe.getAttribute('src') || '';
    if (!src) return false;
    const origin = new URL(src, window.location.href).origin;
    iframe.contentWindow.postMessage(
      { type: 'mview:command', action },
      origin
    );
    return true;
  } catch {
    return false;
  }
}

function annotationsVisibleFromParams(params: URLSearchParams): boolean {
  const show = params.get('showAnnotations') || params.get('showLabels') || '';
  if (/^(0|false|no|off|hide|hidden)$/i.test(show)) return false;
  if (/^(1|true|yes|on|show|visible)$/i.test(show)) return true;
  const hide = params.get('hideAnnotations') || params.get('hideLabels') || '';
  if (/^(1|true|yes|on|hide|hidden)$/i.test(hide)) return false;
  return true;
}

function setAnnotationsVisible(params: URLSearchParams, visible: boolean): void {
  params.delete('hideAnnotations');
  params.delete('hideLabels');
  params.delete('showLabels');
  params.delete('annotationsVisible');
  params.delete('labelsVisible');
  params.set('showAnnotations', visible ? '1' : '0');
}

/**
 * Reload the embed with query params MView reads on load (cloud fallback).
 */
export function applyMviewCommandViaUrl(
  iframe: HTMLIFrameElement | null | undefined,
  action: string
): boolean {
  if (!iframe || !action) return false;
  const src = iframe.getAttribute('src') || '';
  if (!src) return false;
  try {
    const url = new URL(src, window.location.href);
    const params = url.searchParams;
    const cmd = String(action).toLowerCase();

    if (cmd === 'togglelabels') {
      const next = !annotationsVisibleFromParams(params);
      setAnnotationsVisible(params, next);
      params.delete('startQuiz');
      params.delete('quiz');
      params.delete('quizStart');
    } else if (cmd === 'startquiz') {
      params.set('startQuiz', '1');
    } else if (cmd === 'stopquiz') {
      params.delete('startQuiz');
      params.delete('quiz');
      params.delete('quizStart');
    } else {
      return false;
    }

    const nextSrc = url.toString();
    if (nextSrc === src) return true;
    iframe.setAttribute('src', nextSrc);

    if (cmd === 'togglelabels') {
      const btn = iframe
        .closest('.rp-mview-card')
        ?.querySelector(
          '[data-mview-action="toggleLabels"]'
        ) as HTMLElement | null;
      if (btn) {
        btn.setAttribute(
          'aria-pressed',
          annotationsVisibleFromParams(url.searchParams) ? 'true' : 'false'
        );
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** postMessage on allowlisted parents; URL reload elsewhere (cloud Classroom). */
export function sendMviewCommand(
  iframe: HTMLIFrameElement | null | undefined,
  action: string
): boolean {
  if (mviewPostMessageAllowed()) {
    return postMviewCommand(iframe, action);
  }
  return applyMviewCommandViaUrl(iframe, action);
}
