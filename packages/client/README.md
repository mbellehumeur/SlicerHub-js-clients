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

const { code } = await client.authenticate();
if (await client.getToken(code)) {
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

# Sync Remote AI info JSON from SlicerHub products/*.info.json, then build
npm run build
```

Output: `dist/hub-client.js` (ESM), `dist/hub-client.cjs` (CJS), `dist/index.d.ts`.

Inference server catalog copy lives next to each resource-server script as
`HubInterface/resource_servers/products/*.info.json`. `npm run build` (or
`npm run sync:inference-info`) copies those into `src/inferenceInfo/` for the published package.

## Protocol parity

Keep `eventNames.js` and wire helpers in sync with:

- `SlicerHub/cast_py_client`
- vtk-js / VolView / OHIF copies (when the wire contract changes)

See [AGENTS.md](../SlicerHub/AGENTS.md) in the slicer monorepo.
