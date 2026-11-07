# @slicer-hub/client

Standalone JavaScript Hub (FHIRcast) wire client. Aligned with the Python
`hub_client` (`SlicerHub/HubInterface/python_client`): auth, subscribe,
WebSocket, publish, request/response, and binary payloads.

Browser conference dialogs / presence live in **`@slicer-hub/conference-ui`**,
not in this package.

## Install

```bash
npm install @slicer-hub/client
# local monorepo:
npm install file:../packages/client
```

## Quick start

```javascript
import HubClient, {
  generateSubscriberName,
  requestEventFor,
} from '@slicer-hub/client';

const client = new HubClient(
  {
    hub_endpoint: 'http://127.0.0.1:2018/api/hub',
    authorization_endpoint: 'http://127.0.0.1:2018/oauth/login',
    token_endpoint: 'http://127.0.0.1:2018/oauth/token',
    client_id: 'client_id',
    client_secret: 'client_secret',
  },
  {
    subscriberName: generateSubscriberName('Worklist'),
    productName: 'WORKLIST',
    topic: 'USER-1',
    events: ['imagingstudy-open', 'imagingstudy-close'],
  },
  { autoReconnect: true }
);

client.onMessage((message) => console.log(message));

// authenticate + token + subscribe (OIDC may redirect in the browser)
await client.connect();

await client.request({
  'subscriber.name': client.getSessionConfig().subscriberName,
  event: {
    'hub.topic': 'USER-1',
    'hub.event': requestEventFor('status'),
    context: { dataType: 'status' },
  },
  'target.actor': 'WORKLIST_CLIENT',
});

await client.close({ hubUnsubscribe: true });
```

Legacy `HubClient.newInstance({ hub, session, autoReconnect })` still works as a
shim during migration.

## Auth modes (mock vs OIDC)

`authenticate()` / `connect()` call `GET /api/hub/auth/config` on the hub:

| Hub `HUB_AUTH_MODE` | Client behavior |
|---------------------|-----------------|
| `mock` (default) | `GET /oauth/login` → JSON tokens (`tokensReady`) |
| `oidc` | Full-page redirect to `GET /oauth/login?return_to=…`; after IdP → hub callback, tokens arrive in the URL hash. Call `authenticate()` / `connect()` again on load. |

Hub OIDC setup: [SlicerHub `hub/docs/oidc.md`](https://github.com/mbellehumeur/SlicerHub/blob/main/HubInterface/hub/docs/oidc.md).

## API surface

- `new HubClient(hub, session, options?)` — OAuth, subscribe, WebSocket, publish, request/response
- `connect()` / `close({ hubUnsubscribe })`
- `sendHubRequestResponse(id, dataType, data, topic?)` (alias: `sendCastRequestResponse`)
- Event-name helpers: `requestEventFor`, `responseEventFor`, `isRequestEvent`, …
- Binary batch publish + `fetchPayload` / `fetchAllPayloads`
- Imaging-study / status / inference helpers (domain, not UI)
- Conference **REST/state** helpers (`createHubConference`, …) — DOM UI is `@slicer-hub/conference-ui`

## Development

```bash
npm install

# Sync Remote AI info JSON from SlicerHub products/<name>/*.info.json, then build
npm run build
```

Output: `dist/hub-client.js` (ESM), `dist/hub-client.cjs` (CJS), `dist/index.d.ts`.

Inference server catalog copy lives next to each service-provider script as
`HubInterface/service_providers/products/<name>/<name>.info.json`. `npm run build` (or
`npm run sync:inference-info`) copies those into `src/inferenceInfo/` for the published package.

## Protocol parity

Keep `eventNames.js` (and binary prefixes in `sendNormalize.js`) in sync with:

- `SlicerHub/HubInterface/python_client/src/hub_client/client.py`
- Hub handlers / product subscribe lists that hardcode event names

See `AGENTS.md` in the SlicerHub repo.
