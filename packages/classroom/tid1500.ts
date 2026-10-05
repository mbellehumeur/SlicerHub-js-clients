/**
 * Minimal TID1500 / Comprehensive SR measurement extraction via dcmjs (CDN).
 */
type Dcmjs = {
  data: {
    DicomMessage: { readFile: (buf: ArrayBuffer) => { dict: unknown } };
    DicomMetaDictionary: {
      naturalizeDataset: (dict: unknown) => Record<string, unknown>;
    };
  };
};

let dcmjsPromise: Promise<Dcmjs> | null = null;
const DCMJS_MIRRORS = [
  'https://cdn.jsdelivr.net/npm/dcmjs@0.41.0/build/dcmjs.min.js',
  'https://unpkg.com/dcmjs@0.41.0/build/dcmjs.min.js',
];

function loadDcmjs(): Promise<Dcmjs> {
  const w = globalThis as unknown as {
    dcmjs?: Dcmjs;
    document?: {
      createElement(t: string): {
        src: string;
        onload: (() => void) | null;
        onerror: (() => void) | null;
        remove(): void;
      };
      head: { appendChild(e: unknown): void };
    };
  };
  if (w.dcmjs) return Promise.resolve(w.dcmjs);
  if (!w.document) {
    return Promise.reject(new Error('dcmjs requires a browser document'));
  }
  if (!dcmjsPromise) {
    dcmjsPromise = new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = () => {
        if (i >= DCMJS_MIRRORS.length) {
          reject(new Error('dcmjs: all CDN mirrors failed'));
          return;
        }
        const s = w.document!.createElement('script');
        s.src = DCMJS_MIRRORS[i++]!;
        s.onload = () => (w.dcmjs ? resolve(w.dcmjs) : tryNext());
        s.onerror = () => {
          s.remove();
          tryNext();
        };
        w.document!.head.appendChild(s);
      };
      tryNext();
    });
  }
  return dcmjsPromise;
}

function asSeq(value: unknown): unknown[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function codeMeaning(seq: unknown): string {
  const c = asSeq(seq)[0] as Record<string, unknown> | undefined;
  if (!c) return '';
  return String(c.CodeMeaning || c.codeMeaning || c.CodeValue || '');
}

function isSrDataset(ds: Record<string, unknown>): boolean {
  const mod = String(ds.Modality || '').toUpperCase();
  if (mod === 'SR') return true;
  const sop = String(ds.SOPClassUID || '');
  return sop.includes('1.2.840.10008.5.1.4.1.1.88');
}

export type Tid1500Measurement = {
  quantity: string;
  value: number | string;
  units: string;
  segmentNumber: number | null;
  segmentLabel: string;
  segmentationSOPInstanceUID: string;
  trackingIdentifier: string;
};

function walkContent(
  items: unknown[],
  into: Tid1500Measurement[],
  groupState: {
    trackingIdentifier: string;
    segmentNumber: number | null;
    segmentationSOPInstanceUID: string;
    finding: string;
  },
): void {
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    const vt = String(item.ValueType || item.valueType || '').toUpperCase();
    const concept = codeMeaning(
      item.ConceptNameCodeSequence || item.ConceptNameCode,
    );

    if (vt === 'TEXT' && /tracking/i.test(concept)) {
      groupState.trackingIdentifier = String(
        item.TextValue || item.textValue || groupState.trackingIdentifier,
      );
    }
    if (vt === 'CODE' && /finding/i.test(concept)) {
      groupState.finding = codeMeaning(
        item.ConceptCodeSequence || item.ConceptCode,
      );
    }
    if (vt === 'UIDREF' && /segmentation/i.test(concept)) {
      groupState.segmentationSOPInstanceUID = String(
        item.UID || item.uid || groupState.segmentationSOPInstanceUID,
      );
    }
    if (
      (vt === 'SCOORD' || vt === 'SCOORD3D' || vt === 'IMAGE') &&
      item.ReferencedSOPSequence
    ) {
      const ref = asSeq(item.ReferencedSOPSequence)[0] as
        | Record<string, unknown>
        | undefined;
      if (ref?.ReferencedSOPInstanceUID) {
        groupState.segmentationSOPInstanceUID = String(
          ref.ReferencedSOPInstanceUID,
        );
      }
    }
    if (/referenced.?segment/i.test(concept) || item.ReferencedSegmentNumber != null) {
      const n = Number(
        item.ReferencedSegmentNumber ??
          item.NumericValue ??
          (item as { TextValue?: unknown }).TextValue,
      );
      if (Number.isFinite(n)) groupState.segmentNumber = n;
    }

    if (vt === 'NUM') {
      const measured = asSeq(
        item.MeasuredValueSequence || item.MeasuredValue,
      )[0] as Record<string, unknown> | undefined;
      const value = measured?.NumericValue ?? item.NumericValue;
      const units = codeMeaning(
        measured?.MeasurementUnitsCodeSequence ||
          measured?.MeasurementUnitsCode ||
          item.MeasurementUnitsCodeSequence,
      );
      into.push({
        quantity: concept || 'Measurement',
        value: value == null ? '—' : (value as number | string),
        units: units || '',
        segmentNumber: groupState.segmentNumber,
        segmentLabel:
          groupState.finding ||
          groupState.trackingIdentifier ||
          (groupState.segmentNumber != null
            ? `Segment ${groupState.segmentNumber}`
            : ''),
        segmentationSOPInstanceUID: groupState.segmentationSOPInstanceUID,
        trackingIdentifier: groupState.trackingIdentifier,
      });
    }

    const child = asSeq(item.ContentSequence || item.Content);
    if (child.length) {
      const next = { ...groupState };
      if (/measurement.?group/i.test(concept)) {
        next.trackingIdentifier = groupState.trackingIdentifier;
      }
      walkContent(child, into, next);
    }
  }
}

export async function parseTid1500FromBuffer(
  bytes: Uint8Array,
): Promise<{ ok: true; measurements: Tid1500Measurement[]; sopInstanceUID: string } | { ok: false; error: string }> {
  try {
    const dcmjs = await loadDcmjs();
    const buf =
      bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
        ? bytes.buffer
        : bytes.slice().buffer;
    const ds = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dcmjs.data.DicomMessage.readFile(buf).dict,
    );
    if (!isSrDataset(ds)) {
      return {
        ok: false,
        error: `Not an SR (Modality=${String(ds.Modality || '?')})`,
      };
    }
    const measurements: Tid1500Measurement[] = [];
    walkContent(asSeq(ds.ContentSequence), measurements, {
      trackingIdentifier: '',
      segmentNumber: null,
      segmentationSOPInstanceUID: '',
      finding: '',
    });
    return {
      ok: true,
      measurements,
      sopInstanceUID: String(ds.SOPInstanceUID || ''),
    };
  } catch (err) {
    return {
      ok: false,
      error: `SR parse failed: ${(err as Error)?.message ?? err}`,
    };
  }
}
