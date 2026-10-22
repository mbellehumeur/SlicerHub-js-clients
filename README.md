# SlicerHub-js-clients

<p align="center">
  <img src="docs/images/banner.jpg" alt="Slicer Hub Banner" width="100%">
</p>

JavaScript monorepo for **Slicer Hub** browser apps and the shared hub client library.

## Packages

| Path | npm name |
|------|----------|
| `packages/client` | `@slicer-hub/client` |
| `packages/i18n` | `@slicer-hub/i18n` |
| `packages/context-identity` | `@slicer-hub/context-identity` |
| `packages/worklist` | `@slicer-hub/worklist` |
| `packages/reporting` | `@slicer-hub/reporting` |
| `packages/classroom` | `@slicer-hub/classroom` |
| `packages/ohif-extension` | `@slicer-hub/ohif-extension` |

## Setup

```bash
npm install
npm run build
```

Serve an app from the repo root (builds, then serves):

```bash
npm run serve:worklist    # http://127.0.0.1:8140
npm run serve:reporting   # http://127.0.0.1:8150
npm run serve:classroom   # http://127.0.0.1:8160

# worklist with esbuild watch
npm run serve:worklist:watch
```

Wire protocol identifiers such as `urn:cast:*` and product ids (`CAST-WKLST`, …) are unchanged in this phase.

## License

See [LICENSE](LICENSE).
