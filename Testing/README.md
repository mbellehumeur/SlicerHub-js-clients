# SlicerHub-js-clients Testing

Shared offline and live smoke scripts for `@slicer-hub/client`:

- `client/` — event-name helpers, imaging-study identity, live pub/sub smoke
- `common/` — local hub endpoints (`SLICER-HUB` on `:2018`)

Mirrors `HubInterface/Testing` in the SlicerHub repo (JS counterpart of `python_client`).

## Prerequisites

```bash
cd SlicerHub-js-clients
npm install
npm run build:client
```

## Start local hub

```bash
cd SlicerHub/HubInterface/hub
python hub.py --port 2018
```

## Offline tests (no hub)

```bash
npm test
```

Or individually:

```bash
node --test Testing/client/test_event_names.js
node --test Testing/client/test_imaging_study_identity.js
```

## Live smokes (hub required)

Build the client first (`npm run build:client`), then:

```bash
npm run test:live
```

Or:

```bash
node Testing/run_live_smokes.js
node Testing/client/smoke_client_pubsub.js
```

Defaults: topic `USER-1`, endpoints from `SLICER-HUB` (`http://127.0.0.1:2018`).
