/** Parent → MView TeachingPortal embed commands (same shape as FU it.vetmed status.js). */

export type MviewEmbedCommand = 'toggleLabels' | 'startQuiz' | 'stopQuiz';

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
