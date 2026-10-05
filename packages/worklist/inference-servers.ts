/**
 * Worklist button ids for Hub inference servers (catalog lives in @slicer-hub/client).
 */
import {
  HUB_INFERENCE_SERVERS,
  LOCAL_AI_SERVERS,
  type HubInferenceServerDef,
} from '@slicer-hub/client';

export type WorklistInferenceServer = HubInferenceServerDef & {
  worklistButtonId: string;
};

const BUTTON_IDS: Record<string, string> = {
  mhub: 'openMhubBtn',
  lung: 'openLungScreeningBtn',
  totalseg: 'openTotalSegmentatorBtn',
  neuro: 'openSubcorticalSegmentationBtn',
  dental: 'openDentalSegmentatorBtn',
  txrv: 'openTorchXrayVisionBtn',
};

const LOCAL_AI_BUTTON_IDS: Record<string, string> = {
  flexray: 'openFlexRayBtn',
};

export const INFERENCE_SERVERS: WorklistInferenceServer[] =
  HUB_INFERENCE_SERVERS.map((server) => ({
    ...server,
    worklistButtonId: BUTTON_IDS[server.id] || `open${server.id}Btn`,
  }));

export const LOCAL_AI_WORKLIST_SERVERS: WorklistInferenceServer[] =
  LOCAL_AI_SERVERS.map((server) => ({
    ...server,
    worklistButtonId: LOCAL_AI_BUTTON_IDS[server.id] || `open${server.id}Btn`,
  }));

/** Hide Remote AI buttons whose product is not in the enabled catalog. */
export function applyInferenceServerButtonVisibility(): void {
  const enabledIds = new Set(INFERENCE_SERVERS.map((s) => s.id));
  for (const [id, buttonId] of Object.entries(BUTTON_IDS)) {
    const btn = document.getElementById(buttonId);
    if (!btn) continue;
    btn.hidden = !enabledIds.has(id);
  }
  const localEnabledIds = new Set(LOCAL_AI_WORKLIST_SERVERS.map((s) => s.id));
  for (const [id, buttonId] of Object.entries(LOCAL_AI_BUTTON_IDS)) {
    const btn = document.getElementById(buttonId);
    if (!btn) continue;
    btn.hidden = !localEnabledIds.has(id);
  }
}
