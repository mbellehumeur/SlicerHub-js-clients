# @slicer-hub/client

Standalone JavaScript Hub (FHIRcast) hub client extracted from the vtk-js HubClient
**library modules** (not the vtk.js example app). There is **no** `@kitware/vtk.js`
runtime dependency — only browser/Node APIs (`fetch`, `WebSocket`).

Use this package from apps such as [hub-worklist-example](../hub-worklist-example).

## Install

```bash
npm install @slicer-hub/client
# local monorepo / sibling repo:
npm install file:../hub-js-client
```

## Quick start

```javascript
import HubClient, {
  generateSubscriberName,
  requestEventFor,
} from '@slicer-hub/client';

const client = HubClient.newInstance({
  hub: {
    hub_endpoint: 'http://127.0.0.1:2018/api/hub',
    authorization_endpoint: 'http://127.0.0.1:2018/oauth/authorize',
    token_endpoint: 'http://127.0.0.1:2018/oauth/token',
    client_id: 'client_id',
    client_secret: 'client_secret',
  },
  session: {
    subscriberName: generateSubscriberName('Worklist'),
    topic: 'USER-1',
    events: ['*'],
  },
  autoReconnect: true,
});

client.onMessage((message) => console.log(message));

const { code, tokensReady, redirecting } = await client.authenticate();
// OIDC: first call may navigate to Google; after return, hash tokens are applied.
if (!redirecting && (tokensReady || (await client.getToken(code)))) {
  await client.subscribe();
  await client.request({
    'subscriber.name': client.getSessionConfig().subscriberName,
    event: {
      'hub.topic': 'USER-1',
      'hub.event': requestEventFor('STATUS'),
      context: { dataType: 'STATUS' },
    },
    'target.actor': 'WORKLIST_CLIENT',
  });
}
```

## Auth modes (mock vs OIDC)

`authenticate()` calls `GET /api/hub/auth/config` on the hub:

| Hub `HUB_AUTH_MODE` | Client behavior |
|---------------------|-----------------|
| `mock` (default) | `POST /oauth/authorize` → `getToken(code)` (unchanged) |
| `oidc` | Full-page redirect to `GET /oauth/login?return_to=…`; after Google → hub callback, tokens arrive in the URL hash (`access_token`, `topic`, `user_name`, …). Call `authenticate()` again on load (or let `getToken` consume the hash). |

Hub OIDC setup (Auth0 / Entra / Google, env vars, browser flow): see [SlicerHub `hub/docs/oidc.md`](https://github.com/mbellehumeur/SlicerHub/blob/main/HubInterface/hub/docs/oidc.md). The Python `hub_client` still uses mock authorize only.

## API surface

- `HubClient.newInstance(config)` — hub OAuth, subscribe, WebSocket, publish, request/response
- Event-name helpers: `requestEventFor`, `responseEventFor`, `isRequestEvent`, …
- Binary batch publish + `fetchPayload` / `fetchAllPayloads`
- Imaging-study open helpers, conference helpers, status protocol, message logging utilities

Named exports mirror the vtk-js HubClient module; `HubClient` is used for the class hierarchy
for the class hierarchy (`getClassName()` returns `HubClient`).

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
