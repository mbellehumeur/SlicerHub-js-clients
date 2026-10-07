# @slicer-hub/ohif-extension

OHIF Slicer Hub (FHIRcast) extension for the Image Display actor. Protocol traffic
goes through [`@slicer-hub/client`](../client).

## Install (local monorepo)

```bash
# from an OHIF app package.json
"@slicer-hub/ohif-extension": "file:../SlicerHub-js-clients/packages/ohif-extension"
"@slicer-hub/client": "file:../SlicerHub-js-clients/packages/client"
```

Register in the host `pluginConfig.json`:

```json
{
  "extensions": [
    {
      "packageName": "@slicer-hub/ohif-extension",
      "version": "0.1.0"
    }
  ]
}
```

## Extension id

`src/index.tsx` exports OHIF id `@ohif/extension-hub`.

## Required host config

Provide `window.config.hub` (hub list, `autoSelectHub`, `actors: ['ID']`, …)
and data sources the extension expects (`dicomlocal`, optional `hub-dicomweb`,
`idc` / idc-direct). See OHIF `config/hub.js` for a full example.

Customization slot: `ohif.hubHeaderStatus` (header Hub UI). The host ViewerHeader
must render this slot when `appConfig.hub` is set.

## Host-provided modules

Do **not** declare `@ohif/*` / `@cornerstonejs/*` as peerDependencies when this
package is linked into the Viewers monorepo — pnpm would fetch registry OHIF
builds and replace workspace packages. The OHIF host bundler resolves those
imports from the Viewers workspace.

Runtime deps: `@slicer-hub/client`, `dcmjs`, `jszip`.

## Protocol notes

- **Receive:** binary-family events via `resolveHubFileMessage` /
  `fetchAllPayloads`, then DICOM/NIfTI ingest.
- **Publish:** series/study `dicom-send` through client `publish` / binary batch.
- **Requests:** STATUS, thumbnails, SCENEVIEW; imaging-study open/close helpers
  from `@slicer-hub/client`.

Wire identifier string values such as `urn:cast:ohif-mode` remain unchanged in this phase.

## Source layout

- `src/index.tsx` — extension entry
- `src/services/HubService/` — OHIF PubSubService + hub client
- `src/hub/` — handlers, ingest, publish helpers
- `src/components/` — header status + dialogs

## Development

```bash
cd packages/client && npm run build
cd ../ohif-extension && npm install
```

No standalone webpack/rspack build yet — the OHIF host bundles this package from
`src/index.tsx`.
