/**
 * Local hub endpoints and smoke defaults (parity with HubInterface Testing
 * Python common/local_hub.py).
 */

export const SMOKE_TOPIC = 'USER-1';
export const SMOKE_PRODUCT = 'SMOKE';
export const SMOKE_USER = 'smoke-tester';

/** SLICER-HUB preset dict (local :2018). */
export function localHubPreset() {
  return {
    hub_endpoint: 'http://127.0.0.1:2018/api/hub',
    authorization_endpoint: 'http://127.0.0.1:2018/oauth/authorize',
    token_endpoint: 'http://127.0.0.1:2018/oauth/token',
    client_id: '130c3d9c-4157-4dd1-aa1d-slicer',
    client_secret: 'client_secret_3d_Slicer',
    lease: 999,
  };
}

/** Hub config object for HubClient.newInstance({ hub }). */
export function buildLocalHubConfig() {
  return { ...localHubPreset() };
}
