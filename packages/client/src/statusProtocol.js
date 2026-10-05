/** Wire product names used by TotalSegmentator resource servers. */
export const TOTAL_SEGMENTATOR_PRODUCT_ALIASES = [
  'TOTALSEG',
  'TOTAL_SEGMENTATOR',
  'TOTAL-SEGMENTATOR',
];

export const LUNG_SCREENING_PRODUCT_ALIASES = [
  'LUNGSCREENING',
  'LUNG_SCREENING',
];

export const NEURO_SEG_PRODUCT_ALIASES = [
  'NEURO_SEG',
  'NEUROSEG',
  'NEURO-SEG',
];

export const DENTAL_SEG_PRODUCT_ALIASES = [
  'DENTAL_SEG',
  'DENTALSEG',
  'DENTAL-SEG',
  'DENTALSEGMENTATOR',
];

export const TORCHXRAYVISION_PRODUCT_ALIASES = [
  'TORCHXRAYVISION',
  'TXRV',
  'TORCH_XRAY_VISION',
  'TORCH-XRAY-VISION',
];

export const MHUB_PRODUCT_ALIASES = ['MHUB', 'MHUB_AI', 'MHUBAI'];

export function normalizeProductToken(name) {
  return String(name || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
}

function productMatchesAliases(name, aliases) {
  const normalized = normalizeProductToken(name);
  if (!normalized) {
    return false;
  }
  const compact = normalized.replace(/_/g, '');
  return aliases.some((alias) => {
    const token = normalizeProductToken(alias);
    return token === normalized || token.replace(/_/g, '') === compact;
  });
}

export function isTotalSegmentatorProduct(name) {
  return productMatchesAliases(name, TOTAL_SEGMENTATOR_PRODUCT_ALIASES);
}

export function isLungScreeningProduct(name) {
  return productMatchesAliases(name, LUNG_SCREENING_PRODUCT_ALIASES);
}

export function isNeuroSegProduct(name) {
  return productMatchesAliases(name, NEURO_SEG_PRODUCT_ALIASES);
}

export function isDentalSegProduct(name) {
  return productMatchesAliases(name, DENTAL_SEG_PRODUCT_ALIASES);
}

export function isTorchXrayVisionProduct(name) {
  return productMatchesAliases(name, TORCHXRAYVISION_PRODUCT_ALIASES);
}

export function isMhubProduct(name) {
  return productMatchesAliases(name, MHUB_PRODUCT_ALIASES);
}

export function isInferenceProduct(name) {
  return (
    isMhubProduct(name) ||
    isTotalSegmentatorProduct(name) ||
    isLungScreeningProduct(name) ||
    isNeuroSegProduct(name) ||
    isDentalSegProduct(name) ||
    isTorchXrayVisionProduct(name)
  );
}

export function statusItemValue(items, key) {
  if (!Array.isArray(items)) {
    return undefined;
  }
  const needle = String(key).trim().toLowerCase();
  const match = items.find((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }
    const itemKey = String(entry.key ?? '')
      .trim()
      .toLowerCase();
    return itemKey === needle;
  });
  if (!match) {
    return undefined;
  }
  const value = match.value;
  return typeof value === 'string' ? value.trim() : undefined;
}

export function isStatusPayloadOnline(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (data.source !== 'status') {
    return false;
  }
  const availability = statusItemValue(data.items, 'availability');
  if (availability) {
    return availability.toLowerCase() === 'online';
  }
  return Array.isArray(data.items) && data.items.length > 0;
}

export function productNameFromStatusResponseItem(item) {
  const fromEnvelope = String(item?.productName ?? '').trim();
  if (fromEnvelope) {
    return fromEnvelope;
  }
  const data = item?.data;
  if (data && typeof data === 'object') {
    const fromPayload = String(data.product ?? '').trim();
    if (fromPayload) {
      return fromPayload;
    }
  }
  return '';
}

function productAvailableFromStatusResponses(responses, matchProduct) {
  if (!Array.isArray(responses)) {
    return false;
  }
  return responses.some((item) => {
    const product = productNameFromStatusResponseItem(item);
    return matchProduct(product) && isStatusPayloadOnline(item.data);
  });
}

export function totalSegmentatorAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(
    responses,
    isTotalSegmentatorProduct
  );
}

export function lungScreeningAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(responses, isLungScreeningProduct);
}

export function neuroSegAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(responses, isNeuroSegProduct);
}

export function dentalSegAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(responses, isDentalSegProduct);
}

export function torchXrayVisionAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(
    responses,
    isTorchXrayVisionProduct
  );
}

export function mhubAvailableFromStatusResponses(responses) {
  return productAvailableFromStatusResponses(responses, isMhubProduct);
}

export function isStatusRequestDataType(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return value.trim().toUpperCase() === 'STATUS';
}
