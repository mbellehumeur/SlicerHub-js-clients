import {
  ensureFlexraySession,
  runFlexrayOnGrayFloat,
  type FlexrayProgress,
} from '@slicer-hub/flexray-web';

type ServicesManagerLike = {
  services: {
    viewportGridService?: {
      getActiveViewportId: () => string;
      getState: () => {
        viewports: Map<
          string,
          { displaySetInstanceUIDs?: string[] }
        >;
      };
    };
    displaySetService?: {
      getDisplaySetByUID: (uid: string) => {
        imageIds?: string[];
        Modality?: string;
        SeriesNumber?: number;
        SeriesDescription?: string;
      } | null;
    };
    segmentationService?: {
      getSegmentations: () => unknown[];
      createLabelmapForDisplaySet: (
        displaySet: unknown,
        options: {
          label?: string;
          segmentationId?: string;
          segments?: Record<
            number,
            { label: string; active?: boolean; color?: number[] }
          >;
        }
      ) => Promise<string>;
      addSegmentationRepresentation: (
        viewportId: string,
        opts: { segmentationId: string; type?: string }
      ) => Promise<void>;
      getSegmentation: (id: string) => {
        representationData?: {
          Labelmap?: { imageIds?: string[] };
        };
      } | null;
      addSegment?: (
        segmentationId: string,
        config: { segmentIndex: number; label: string; color?: number[] }
      ) => void;
    };
    cornerstoneViewportService?: {
      getCornerstoneViewport: (viewportId: string) => {
        getCurrentImageId?: () => string;
      } | null;
    };
    panelService?: {
      activatePanel: (panelId: string, forceActive?: boolean) => void;
    };
  };
};

const FLEXRAY_SEGMENTATION_PANEL_IDS = [
  '@ohif/extension-cornerstone.panelModule.panelSegmentationWithToolsLabelMap',
  '@ohif/extension-cornerstone.panelModule.panelSegmentation',
];

function openSegmentationRightPanel(servicesManager: ServicesManagerLike): void {
  const { panelService } = servicesManager.services;
  if (!panelService?.activatePanel) {
    return;
  }
  for (const panelId of FLEXRAY_SEGMENTATION_PANEL_IDS) {
    panelService.activatePanel(panelId, true);
  }
}

function parseHexColor(hex: string | null | undefined): number[] | undefined {
  if (!hex || typeof hex !== 'string') return undefined;
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

/**
 * Read active Cornerstone stack image as grayscale float32.
 */
async function readActiveGrayFloat(servicesManager: ServicesManagerLike): Promise<{
  gray: Float32Array;
  width: number;
  height: number;
  displaySet: NonNullable<
    ReturnType<
      NonNullable<ServicesManagerLike['services']['displaySetService']>['getDisplaySetByUID']
    >
  >;
  viewportId: string;
  imageId: string;
}> {
  const { viewportGridService, displaySetService, cornerstoneViewportService } =
    servicesManager.services;
  if (!viewportGridService || !displaySetService) {
    throw new Error('OHIF viewport/displaySet services unavailable');
  }
  const viewportId = viewportGridService.getActiveViewportId();
  if (!viewportId) {
    throw new Error('No active viewport');
  }
  const { viewports } = viewportGridService.getState();
  const vp = viewports.get(viewportId);
  const dsUid = vp?.displaySetInstanceUIDs?.[0];
  if (!dsUid) {
    throw new Error('No display set on active viewport');
  }
  const displaySet = displaySetService.getDisplaySetByUID(dsUid);
  if (!displaySet?.imageIds?.length) {
    throw new Error('Display set has no imageIds');
  }

  const csViewport = cornerstoneViewportService?.getCornerstoneViewport?.(
    viewportId
  );
  const imageId =
    csViewport?.getCurrentImageId?.() || displaySet.imageIds[0];

  const { cache } = await import('@cornerstonejs/core');
  let image = cache.getImage(imageId);
  if (!image) {
    const { imageLoader } = await import('@cornerstonejs/core');
    image = await imageLoader.loadAndCacheImage(imageId);
  }
  const width = Number(image.columns || image.width);
  const height = Number(image.rows || image.height);
  const raw = image.getPixelData();
  const slope = Number(image.slope ?? 1) || 1;
  const intercept = Number(image.intercept ?? 0) || 0;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = Number(raw[i]) * slope + intercept;
  }
  return { gray, width, height, displaySet, viewportId, imageId };
}

export type ApplyFlexrayOptions = {
  ortWasmPaths?: string;
  quality?: 'low' | 'high' | string;
  modelId?: string;
  onProgress?: (p: FlexrayProgress) => void;
};

/**
 * ORT static assets are copied next to the OHIF app (`ort/` under PUBLIC_URL).
 * Local `dev:slicer-hub` uses PUBLIC_URL=/ → `/ort/`; cloud uses `/ohif/ort/`.
 */
export function resolveOhifOrtBaseUrl(): string {
  const publicUrl =
    typeof window !== 'undefined'
      ? String((window as Window & { PUBLIC_URL?: string }).PUBLIC_URL || '/')
      : '/';
  const normalized = publicUrl.replace(/\/?$/, '/');
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  return `${origin}${normalized}ort/`;
}

/**
 * Download (if needed), run FleXray locally, write an OHIF labelmap segmentation.
 */
export async function runFlexrayLocalOnActiveViewport(
  servicesManager: ServicesManagerLike,
  options: ApplyFlexrayOptions = {}
): Promise<{
  segmentationId: string;
  usedLabels: Array<{ index: number; name: string; voxelCount: number }>;
  executionProvider: string;
}> {
  const segmentationService = servicesManager.services.segmentationService;
  if (!segmentationService?.createLabelmapForDisplaySet) {
    throw new Error('OHIF segmentationService unavailable');
  }

  await ensureFlexraySession({
    ortWasmPaths: options.ortWasmPaths || resolveOhifOrtBaseUrl(),
    quality: options.quality || options.modelId,
    onProgress: options.onProgress,
  });

  options.onProgress?.({ phase: 'read-image', detail: 'Reading viewport pixels…' });
  const { gray, width, height, displaySet, viewportId } =
    await readActiveGrayFloat(servicesManager);

  const modality = String(displaySet.Modality || '').toUpperCase();
  if (modality && modality !== 'CR' && modality !== 'DX') {
    throw new Error(
      `FleXray local run expects CR/DX (active modality: ${modality})`
    );
  }

  options.onProgress?.({ phase: 'infer', detail: 'Running FleXray…' });
  const result = await runFlexrayOnGrayFloat(gray, width, height);

  const segments: Record<
    number,
    { label: string; active?: boolean; color?: number[] }
  > = {};
  for (const u of result.usedLabels) {
    const color = parseHexColor(u.color);
    segments[u.index] = {
      label: u.name,
      active: u === result.usedLabels[0],
      ...(color ? { color } : {}),
    };
  }
  if (!Object.keys(segments).length) {
    segments[1] = { label: 'FleXray (empty)', active: true };
  }

  options.onProgress?.({ phase: 'apply', detail: 'Creating OHIF segmentation…' });
  const segmentationId = await segmentationService.createLabelmapForDisplaySet(
    displaySet,
    {
      label: 'FleXray',
      segments,
    }
  );

  await segmentationService.addSegmentationRepresentation(viewportId, {
    segmentationId,
    type: 'Labelmap',
  });

  const seg = segmentationService.getSegmentation(segmentationId);
  const labelmapImageIds = seg?.representationData?.Labelmap?.imageIds;
  if (!labelmapImageIds?.length) {
    throw new Error('FleXray labelmap imageIds missing after create');
  }

  const { cache: csCache } = await import('@cornerstonejs/core');
  const labelImage = csCache.getImage(labelmapImageIds[0]);
  if (!labelImage) {
    throw new Error('FleXray labelmap image not in cache');
  }
  const pixelData = labelImage.getPixelData();
  const expected = width * height;
  if (pixelData.length < expected || result.labelMapFull.length < expected) {
    throw new Error(
      `FleXray size mismatch: labelmap ${pixelData.length} vs result ${result.labelMapFull.length} (image ${expected})`
    );
  }
  for (let i = 0; i < expected; i++) {
    pixelData[i] = result.labelMapFull[i];
  }
  // Trigger labelmap redraw after in-place pixel write (public API; dist/esm paths are not exported)
  try {
    const { segmentation } = await import('@cornerstonejs/tools');
    segmentation.triggerSegmentationEvents.triggerSegmentationDataModified(
      segmentationId
    );
  } catch {
    // redraw on next interaction is acceptable
  }

  openSegmentationRightPanel(servicesManager);

  return {
    segmentationId,
    usedLabels: result.usedLabels.map(u => ({
      index: u.index,
      name: u.name,
      voxelCount: u.voxelCount,
    })),
    executionProvider: result.executionProvider,
  };
}
