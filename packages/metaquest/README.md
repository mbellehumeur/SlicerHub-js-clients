# @slicer-hub/metaquest

Hub Image Display for Meta Quest Browser: join a Hub topic, load Slicer surface meshes
from `glb-send`, apply `meshscene-update`, and optionally enter WebXR.

Product name: `SLICERLIVE-METAQUEST`. Opened from the worklist **MetaQuest** button with
`?topic=&id-token=`.

## Credits

Mesh streaming to Quest (GLB + local three.js render + WebXR) was inspired by
**[SlicerRemoteView](https://github.com/dolegadolegowski/SlicerRemoteView)** by
**Damian Dołęga-Dołęgowski** ([@dolegadolegowski](https://github.com/dolegadolegowski)),
MIT License. This package speaks Slicer Hub instead of the RemoteView relay and does not
vendor or depend on that repository at runtime.

Rendering uses [three.js](https://threejs.org/) and Hub connectivity uses `@slicer-hub/client`
under their respective licenses.

## Build

```bash
npm run build -w @slicer-hub/client
npm run build -w @slicer-hub/metaquest
```

Serve `index.html` + `metaquest.js` (or via Hub `/metaquest/` after sync/`make_zip`).
