/** Known Hub client product matchers (presence badges, peer tracking). */

/**
 * @param {string} productName
 * @returns {string}
 */
export function normalizeHubProductName(productName) {
  return String(productName || '')
    .trim()
    .toUpperCase();
}

/**
 * @type {Record<string, (product: string) => boolean>}
 */
export const HUB_PRODUCT_MATCHERS = Object.freeze({
  ira: (p) => p === 'SLICERLIVE-IRA' || p.startsWith('SLICERLIVE-IRA'),
  ohif: (p) => p === 'OHIF' || p.startsWith('OHIF'),
  volview: (p) => p === 'VOLVIEW' || p.startsWith('VOLVIEW'),
  slicer: (p) =>
    p === '3DSLICER-ID' ||
    p === 'SLICER-HUB' ||
    p.startsWith('3DSLICER') ||
    p.startsWith('SLICER-HUB'),
  /** hub-mirror Four-Up LiveScene stream client (not desktop Image Display). */
  hubMirror: (p) =>
    p === 'SLICERLIVE-HUB-MIRROR' || p.startsWith('SLICERLIVE-HUB-MIRROR'),
  mhub: (p) =>
    p === 'MHUB' ||
    p.startsWith('MHUB') ||
    p === 'MHUB_AI' ||
    p.startsWith('MHUB_AI') ||
    p === 'MHUBAI' ||
    p.startsWith('MHUBAI'),
  lung: (p) => p === 'LUNGSCREENING' || p.startsWith('LUNGSCREENING'),
  totalseg: (p) =>
    p === 'TOTALSEG' ||
    p.startsWith('TOTALSEG') ||
    p === 'TOTAL_SEGMENTATOR' ||
    p.startsWith('TOTAL_SEGMENTATOR') ||
    p === 'TOTAL-SEGMENTATOR' ||
    p.startsWith('TOTAL-SEGMENTATOR'),
  neuro: (p) =>
    p === 'NEURO_SEG' ||
    p.startsWith('NEURO_SEG') ||
    p === 'NEUROSEG' ||
    p.startsWith('NEUROSEG'),
  dental: (p) =>
    p === 'DENTAL_SEG' ||
    p.startsWith('DENTAL_SEG') ||
    p === 'DENTALSEG' ||
    p.startsWith('DENTALSEG') ||
    p === 'DENTALSEGMENTATOR' ||
    p.startsWith('DENTALSEGMENTATOR'),
  txrv: (p) =>
    p === 'TORCHXRAYVISION' ||
    p.startsWith('TORCHXRAYVISION') ||
    p === 'TXRV' ||
    p.startsWith('TXRV') ||
    p === 'TORCH_XRAY_VISION' ||
    p.startsWith('TORCH_XRAY_VISION') ||
    p === 'TORCH-XRAY-VISION' ||
    p.startsWith('TORCH-XRAY-VISION'),
  reporting: (p) =>
    p === 'RPT' ||
    p.startsWith('RPT-') ||
    p === 'CAST-RPT' ||
    p.startsWith('CAST-RPT'),
  classroom: (p) =>
    p === 'CLASSROOM' ||
    p.startsWith('CLASSROOM-') ||
    p === 'CAST-CLASSROOM' ||
    p.startsWith('CAST-CLASSROOM'),
});

/**
 * @param {string} productName
 * @param {keyof typeof HUB_PRODUCT_MATCHERS | string} kind
 */
export function matchesHubProduct(productName, kind) {
  const matcher = HUB_PRODUCT_MATCHERS[kind];
  if (!matcher) {
    return false;
  }
  return matcher(normalizeHubProductName(productName));
}
