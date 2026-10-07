# @slicer-hub/flexray-web

Browser runner for [FleXray](https://flexray.csail.mit.edu/) (flagship ONNX, Low quality:
one forward pass). Loads ORT from the host `/ort/` copy via script tag
(`ort.webgpu.min.js`, then `ort.wasm.min.js`) — do not bundle ORT into the app
chunk. Requires **onnxruntime-web ≥ 1.20** for fp16 / WebGPU. Forces
`numThreads = 1` unless the page is `crossOriginIsolated`.

Model weights are downloaded from Hugging Face via the public
[demo_manifest](https://flexray.csail.mit.edu/demo/demo_manifest.json) and cached in
the browser. Weights are **CC-BY-NC-4.0** (research / non-commercial).

## API

```js
import {
  ensureFlexraySession,
  runFlexrayOnGrayFloat,
  isFlexrayLocalReady,
} from '@slicer-hub/flexray-web';

await ensureFlexraySession({
  ortWasmPaths: '/ort/',
  onProgress: (p) => console.log(p.phase, p.loaded, p.total),
});

const result = runFlexrayOnGrayFloat(grayFloat32, width, height);
// result.labelMapFull: Uint8Array length width*height (segment indices)
// result.labels: [{ index, name, color }, ...]
```
