/**
 * Resolve when the document is past speculative prerender and visible.
 *
 * Used before hub auto-connect so address-bar prerender/prefetch does not
 * authenticate or subscribe until the user actually activates the page.
 *
 * @returns {Promise<void>}
 */
export function whenDocumentActivated() {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  return waitUntilNotPrerendering().then(waitUntilVisible);
}

function waitUntilNotPrerendering() {
  if (!document.prerendering) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onChange = () => {
      if (!document.prerendering) {
        document.removeEventListener('prerenderingchange', onChange);
        resolve();
      }
    };
    document.addEventListener('prerenderingchange', onChange);
  });
}

function waitUntilVisible() {
  if (document.visibilityState === 'visible') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onChange = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onChange);
        resolve();
      }
    };
    document.addEventListener('visibilitychange', onChange);
  });
}
