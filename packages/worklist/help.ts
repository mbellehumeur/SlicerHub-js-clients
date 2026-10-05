/** Worklist Help modal (? button) — how-to bullets + link to preserved About. */

import { t } from './i18n';

const HOWTO_COUNT = 8;

/** Bump when replacing files under help-images/ so browsers fetch the new PNG. */
const HELP_IMG_CACHE = '20260929c';

function withHelpImgCacheBust(html: string): string {
  return html.replace(
    /(src="\.\/help-images\/[^"?]+)(")/g,
    `$1?v=${HELP_IMG_CACHE}$2`
  );
}

export function helpModalHtml(): string {
  const items: string[] = [];
  for (let i = 0; i < HOWTO_COUNT; i++) {
    const title = t(`help:howto${i}Title`);
    const bodyKey = `help:howto${i}Body`;
    const bodyRaw = t(bodyKey);
    const body =
      bodyRaw && bodyRaw !== bodyKey
        ? `<div class="wl-help-item-body">${withHelpImgCacheBust(bodyRaw.trim())}</div>`
        : '';
    items.push(
      `<li><details class="wl-help-details"><summary class="wl-help-item-title">${title}</summary>${body}</details></li>`
    );
  }
  return `
    <details class="wl-help-details wl-help-intro-details">
      <summary class="wl-help-item-title">${t('help:aboutSummary')}</summary>
      <div class="wl-help-item-body wl-help-intro">
        ${t('help:introHtml')}
      </div>
    </details>
    <ol class="wl-help-howto">
      ${items.join('\n')}
    </ol>
    <p class="wl-help-about-link">
      <a href="./about.html">${t('help:aboutLinkLabel')}</a> ${t('help:aboutLinkSuffix')}
    </p>
  `;
}

/** Open the Help modal with how-to bullets and a link to about.html. */
export function showHelp(helpModal: HTMLElement): void {
  const content = helpModal.querySelector(
    '#helpModalContent'
  ) as HTMLElement | null;
  const titleEl = helpModal.querySelector('#helpTitle') as HTMLElement | null;
  const quickStartEl = helpModal.querySelector(
    '#helpQuickStart'
  ) as HTMLElement | null;
  if (titleEl) titleEl.textContent = t('help:modalTitle');
  if (quickStartEl) {
    const openBtn = `<button type="button" class="wl-open-btn wl-help-open-sample" tabindex="-1" aria-hidden="true">${t('chrome:open')}</button>`;
    const body = t('help:quickStartBody').replaceAll('{{open}}', openBtn);
    quickStartEl.innerHTML = `<strong>${t('help:quickStartTitle')}</strong> ${body}`;
  }
  if (content) content.innerHTML = helpModalHtml();
  helpModal.hidden = false;
}

/** Refresh Help contents if the modal is currently open. */
export function refreshHelpIfOpen(helpModal: HTMLElement | null): void {
  if (!helpModal || helpModal.hidden) return;
  showHelp(helpModal);
}
