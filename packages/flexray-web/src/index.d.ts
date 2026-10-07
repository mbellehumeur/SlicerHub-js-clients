export type FlexrayLabel = {
  index: number;
  name: string;
  color: string | null;
};

export type FlexrayProgress = {
  phase: string;
  loaded?: number;
  total?: number;
  detail?: string;
};

export type FlexrayManifestModel = {
  id: string;
  url: string;
  sha256?: string;
  size_bytes?: number;
  input_name?: string;
  output_name?: string;
  input_shape?: number[];
};

export type FlexrayModelChoice = FlexrayManifestModel & {
  isDefault: boolean;
  optionLabel: string;
};

export type FlexrayQualityChoice = {
  id: 'low' | 'high';
  optionLabel: string;
  size_bytes: number;
  isDefault: boolean;
};

export const DEFAULT_MANIFEST_URL: string;

export function formatFlexrayDownloadSize(bytes: number): string;
export function listFlexrayModelChoices(manifest: unknown): FlexrayModelChoice[];
export function listFlexrayQualityChoices(
  manifest: unknown
): FlexrayQualityChoice[];
export function flexrayModelsForQuality(
  manifest: unknown,
  quality?: string
): FlexrayModelChoice[];
export function flexrayModelChoiceById(
  manifest: unknown,
  modelId?: string
): FlexrayModelChoice | FlexrayManifestModel | null;
export function fetchFlexrayManifest(manifestUrl?: string): Promise<unknown>;

export function isFlexrayLocalReady(): boolean;
export function getFlexrayManifest(): unknown;
export function ensureFlexraySession(opts?: {
  ortWasmPaths?: string;
  manifestUrl?: string;
  quality?: 'low' | 'high' | string;
  modelId?: string;
  onProgress?: (p: FlexrayProgress) => void;
}): Promise<{
  session: unknown;
  manifest: unknown;
  executionProvider: string;
  model: unknown;
  quality: string;
}>;

export function runFlexrayOnGrayFloat(
  gray: Float32Array | number[],
  width: number,
  height: number
): Promise<{
  labelMapFull: Uint8Array;
  labels: FlexrayLabel[];
  width: number;
  height: number;
  executionProvider: string;
  usedLabels: Array<{
    index: number;
    name: string;
    color: string | null;
    voxelCount: number;
  }>;
}>;
