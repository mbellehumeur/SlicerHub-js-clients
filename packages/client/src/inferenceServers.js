/** Known Hub medical-inference / resource-server products (UI catalog + wire names). */

import {
  DENTAL_SEG_PRODUCT_ALIASES,
  LUNG_SCREENING_PRODUCT_ALIASES,
  MHUB_PRODUCT_ALIASES,
  NEURO_SEG_PRODUCT_ALIASES,
  TORCHXRAYVISION_PRODUCT_ALIASES,
} from './statusProtocol.js';
import mhubInfo from './inferenceInfo/mhub.info.json';
import lungInfo from './inferenceInfo/lung_screening.info.json';
import totalsegInfo from './inferenceInfo/total_segmentator.info.json';
import neuroInfo from './inferenceInfo/neuro_seg.info.json';
import dentalInfo from './inferenceInfo/dental_segmentator.info.json';
import txrvInfo from './inferenceInfo/torchxrayvision.info.json';
import flexrayInfo from './inferenceInfo/flexray.info.json';
import coffeeCupIconUrl from './assets/buy-me-a-coffee-cup.svg?url';

export {
  DENTAL_SEG_PRODUCT_ALIASES,
  LUNG_SCREENING_PRODUCT_ALIASES,
  MHUB_PRODUCT_ALIASES,
  NEURO_SEG_PRODUCT_ALIASES,
  TORCHXRAYVISION_PRODUCT_ALIASES,
};

/**
 * @typedef {object} HubInferenceServerDef
 * @property {string} id
 * @property {string} product Canonical Hub ``subscriber.product.name`` / target product.
 * @property {string} title
 * @property {string} location Geographic location shown in list/tooltip UIs.
 * @property {string} summary Short capability blurb (info card body).
 * @property {string} [capabilities] Alias of ``summary`` (compat).
 * @property {string} [githubUrl] Upstream or Hub product GitHub URL.
 * @property {string} [websiteUrl] Project website.
 * @property {string} [buyMeACoffeeUrl] Buy Me a Coffee support URL.
 * @property {string} [iconUrl] Brand / product icon shown on the info card.
 * @property {string} [cite] Citation / reference text shown on the info card.
 * @property {string} [citeUrl] Optional DOI / publication URL for the citation.
 * @property {'dicom-send'|'nifti-send'} hubEvent Preferred publish event when running a job.
 */

/** @param {Record<string, unknown>} raw */
function normalizeInfo(raw) {
  const summary = String(raw.summary || raw.capabilities || '').trim();
  const hubEvent =
    raw.hubEvent === 'nifti-send' ? 'nifti-send' : 'dicom-send';
  /** @type {import('./inferenceServers.js').HubInferenceServerDef} */
  const def = {
    id: String(raw.id || '').trim(),
    product: String(raw.product || '').trim(),
    title: String(raw.title || '').trim(),
    location: String(raw.location || '').trim(),
    summary,
    capabilities: summary,
    hubEvent,
  };
  const githubUrl = String(raw.githubUrl || '').trim();
  if (githubUrl) def.githubUrl = githubUrl;
  const websiteUrl = String(raw.websiteUrl || '').trim();
  if (websiteUrl) def.websiteUrl = websiteUrl;
  const buyMeACoffeeUrl = String(raw.buyMeACoffeeUrl || '').trim();
  if (buyMeACoffeeUrl) def.buyMeACoffeeUrl = buyMeACoffeeUrl;
  const iconUrl = String(raw.iconUrl || '').trim();
  if (iconUrl) def.iconUrl = iconUrl;
  const cite = String(raw.cite || '').trim();
  if (cite) def.cite = cite;
  const citeUrl = String(raw.citeUrl || '').trim();
  if (citeUrl) def.citeUrl = citeUrl;
  return def;
}

/** @param {Record<string, unknown>} raw */
function isEnabledInfo(raw) {
  return raw?.enabled !== false;
}

/** @type {readonly HubInferenceServerDef[]} */
export const HUB_INFERENCE_SERVERS = Object.freeze(
  [mhubInfo, lungInfo, totalsegInfo, neuroInfo, dentalInfo, txrvInfo]
    .filter(isEnabledInfo)
    .map(normalizeInfo)
);

/**
 * Local AI catalog (worklist Local AI row). Not probed via hub status-request
 * and not listed under Remote AI / IRA inference servers.
 * @type {readonly HubInferenceServerDef[]}
 */
export const LOCAL_AI_SERVERS = Object.freeze(
  [flexrayInfo].filter(isEnabledInfo).map(normalizeInfo)
);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Info card HTML (title, summary, links). No Status / Location.
 * @param {HubInferenceServerDef} def
 * @returns {string}
 */
export function renderInferenceServerInfoCardHtml(def) {
  if (!def || typeof def !== 'object') return '';
  const title = escapeHtml(def.title);
  const summary = escapeHtml(def.summary || def.capabilities);
  const iconUrl = String(def.iconUrl || '').trim();
  const parts = [`<div class="hub-inference-info-card">`];
  if (iconUrl) {
    parts.push(
      `<div class="hub-inference-info-heading">` +
        `<img class="hub-inference-info-icon" src="${escapeHtml(iconUrl)}" alt="" width="28" height="28" decoding="async" />` +
        `<div class="hub-inference-info-title">${title}</div>` +
        `</div>`
    );
  } else {
    parts.push(`<div class="hub-inference-info-title">${title}</div>`);
  }
  if (summary) {
    parts.push(`<p class="hub-inference-info-summary">${summary}</p>`);
  }
  const cite = String(def.cite || '').trim();
  const citeUrl = String(def.citeUrl || '').trim();
  if (cite) {
    const citeBody = escapeHtml(cite);
    if (citeUrl) {
      parts.push(
        `<p class="hub-inference-info-citation"><span class="hub-inference-info-citation-label">Citation:</span> ` +
          `<a class="hub-inference-info-citation-link" href="${escapeHtml(citeUrl)}" target="_blank" rel="noopener noreferrer">${citeBody}</a>` +
          `</p>`
      );
    } else {
      parts.push(
        `<p class="hub-inference-info-citation"><span class="hub-inference-info-citation-label">Citation:</span> ${citeBody}</p>`
      );
    }
  }
  parts.push(`<div class="hub-inference-info-links">`);
  const github = String(def.githubUrl || '').trim();
  if (github) {
    parts.push(
      `<a class="hub-inference-info-link hub-inference-info-github" href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer">` +
        `<svg class="hub-inference-info-github-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">` +
        `<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>` +
        `</svg>` +
        `GitHub` +
        `</a>`
    );
  }
  const website = String(def.websiteUrl || '').trim();
  if (website) {
    parts.push(
      `<a class="hub-inference-info-link" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Website</a>`
    );
  }
  if (citeUrl) {
    parts.push(
      `<a class="hub-inference-info-link" href="${escapeHtml(citeUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(cite || 'Citation')}">Cite</a>`
    );
  }
  const coffee = String(def.buyMeACoffeeUrl || '').trim();
  if (coffee) {
    // Vendored BMC cup SVG; cup outline uses #FFDD00 so the top stands out on dark/light buttons
    parts.push(
      `<a class="hub-inference-info-link hub-inference-info-coffee" href="${escapeHtml(coffee)}" target="_blank" rel="noopener noreferrer" title="Buy Me a Coffee">` +
        `<img class="hub-inference-info-coffee-icon" src="${coffeeCupIconUrl}" alt="" width="12" height="16" decoding="async" />` +
        `Buy me a coffee` +
        `</a>`
    );
  }
  parts.push(`</div></div>`);
  return parts.join('');
}

/** Tooltip / detail text for inference-server UI (worklist badges, IRA list). */
export function inferenceServerInfoText(def, status) {
  if (!def || typeof def !== 'object') {
    return '';
  }
  const lines = [
    String(def.title || '').trim(),
    String(def.summary || def.capabilities || '').trim(),
    `Location: ${String(def.location || '').trim()}`,
  ].filter((line) => line && !line.endsWith(': '));
  if (status) {
    lines.push(`Status: ${status}`);
  }
  const cite = String(def.cite || '').trim();
  if (cite) {
    lines.push(`Citation: ${cite}`);
  }
  const github = String(def.githubUrl || '').trim();
  if (github) {
    lines.push(github);
  }
  return lines.join('\n');
}

export function findInferenceServerByProduct(productName) {
  const needle = String(productName || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
  if (!needle) {
    return null;
  }
  const compact = needle.replace(/_/g, '');
  return (
    HUB_INFERENCE_SERVERS.find((server) => {
      const product = String(server.product || '')
        .trim()
        .toUpperCase()
        .replace(/-/g, '_');
      return product === needle || product.replace(/_/g, '') === compact;
    }) || null
  );
}
