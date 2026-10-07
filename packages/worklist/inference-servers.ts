/**
 * Worklist button ids for Hub inference servers (catalog lives in @slicer-hub/client).
 */
import {
  HUB_INFERENCE_SERVERS,
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
  flexray: 'openFlexRayBtn',
};

export const INFERENCE_SERVERS: WorklistInferenceServer[] =
  HUB_INFERENCE_SERVERS.map((server) => ({
    ...server,
    worklistButtonId: BUTTON_IDS[server.id] || `open${server.id}Btn`,
  }));

/** @deprecated Prefer filtering ``INFERENCE_SERVERS`` by ``localCapable``. */
export const LOCAL_AI_WORKLIST_SERVERS: WorklistInferenceServer[] =
  INFERENCE_SERVERS.filter((server) => server.localCapable === true);

/** Hide Evidence Creator buttons whose product is not in the enabled catalog. */
export function applyInferenceServerButtonVisibility(): void {
  const enabledIds = new Set(INFERENCE_SERVERS.map((s) => s.id));
  for (const [id, buttonId] of Object.entries(BUTTON_IDS)) {
    const btn = document.getElementById(buttonId);
    if (!btn) continue;
    btn.hidden = !enabledIds.has(id);
  }
  // Local-capable servers are always Available — show enabled chrome immediately.
  for (const server of INFERENCE_SERVERS) {
    if (!server.localCapable) continue;
    const btn = document.getElementById(server.worklistButtonId);
    if (!btn) continue;
    btn.classList.add('wl-viewer-btn-connected');
    btn.title = `${server.title} · Available`;
  }
}
