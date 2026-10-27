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
| `packages/worklist` | `@slicer-hub/worklist` |
| `packages/reporting` | `@slicer-hub/reporting` |
| `packages/classroom` | `@slicer-hub/classroom` |
| `packages/ohif-extension` | `@slicer-hub/ohif-extension` |

## Worklist

[`packages/worklist`](packages/worklist) (`@slicer-hub/worklist`) is the browser worklist client for Slicer Hub.

The worklist application allows educators to create cohorts of [Imaging Data Commons](https://imaging.datacommons.cancer.gov/) (IDC) studies and save/load them as teaching files to use with conferencing.

It does not aim to aggregate orders from different organizations but it replicates some of the IHE transactions that a commercial worklist application would use and replies with the current context when queried with status-request events.  It does not demonstrate prioritization of an entry based on an AI result.

This application uses the IDC together with [WebSub integration](https://github.com/mbellehumeur/SlicerHub) and open-source viewers to provide a collaborative conferencing environment for education.

The classrom application allows to create web page activities based on IDC studies.  They are organized as **courses** that educators can extend by adding folders under the courses folder.

The IDC is part of the NCI Cancer Research Data Commons. It hosts large, publicly available collections of cancer imaging data in the cloud so researchers, clinicians, and educators can explore real clinical-grade studies without setting up their own archive.  IDC invests in education and open tooling so students and teachers can learn medical imaging with authentic data, reproducible workflows, and freely available viewers—not only research pipelines.

Viewing is powered by open-source platforms that share IDC’s commitment to accessible medical imaging:

- [OHIF](https://ohif.org/) — a web-based medical image viewer built on open standards (including DICOMweb). It is widely used in research and education, and is designed so modes and extensions can grow with teaching and clinical workflows.
- [Slim](https://github.com/ImagingDataCommons/slim) — an interoperable slide microscopy viewer from the Imaging Data Commons (National Cancer Institute), for teaching and research with whole-slide imaging.
- [3D Slicer](https://www.slicer.org/) — a desktop platform for visualization, analysis, and research. [Slicer Hub](https://github.com/mbellehumeur/SlicerHub) runs as a Slicer extension so Classroom, conferencing, and image display can share one open messaging stack with the same data and tools.

For open anatomy education, see the [Open Anatomy Project](https://www.openanatomy.org/) at Brigham and Women’s Hospital. It distributes high-quality anatomy atlases and open-source software worldwide—democratizing medical knowledge for students, clinicians, researchers, and the public, wherever they live and in many languages. Atlases are viewed in the web-based Open Anatomy Browser; the group also created [3D Slicer](https://www.slicer.org/), which was used to build the atlases.

The University of Twente [BoneHub Educational Atlas](https://bonehub.github.io/Educational-Atlas/) offers interactive full-skeleton 3D models of the Visible Human Male and Female for teaching, visualization, and 3D printing. Free STL meshes and IGES/STEP CAD files (CC BY 4.0) are available from the [visible-human-3d-models](https://huggingface.co/datasets/BoneHub/visible-human-3d-models) dataset on Hugging Face.

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

## License

See [LICENSE](LICENSE).

## Acknowledgements

**3D Slicer** — open-source platform for medical image computing from the [3D Slicer community](https://www.slicer.org/). These clients connect to [Slicer Hub](https://github.com/mbellehumeur/SlicerHub), which runs as a Slicer extension.

**Imaging Data Commons (IDC)** — public cancer imaging collections from the [National Cancer Institute](https://imaging.datacommons.cancer.gov/), used for worklist cohorts, classroom activities, and conferencing demos. The hub example links to or loads studies from their original sources; it does not redistribute them.

**OHIF** — open-source zero-footprint viewer from the [Open Health Imaging Foundation](https://ohif.org/).

**Slim** — interoperable slide microscopy viewer from the [Imaging Data Commons](https://github.com/ImagingDataCommons/slim) (National Cancer Institute).

**Open Anatomy Project** — open anatomy atlases and software from [Brigham and Women’s Hospital](https://www.openanatomy.org/).

**BoneHub Educational Atlas** — Visible Human skeleton models from the [University of Twente](https://bonehub.github.io/Educational-Atlas/) ([CC BY 4.0 meshes](https://huggingface.co/datasets/BoneHub/visible-human-3d-models)).

**SlicerLive** — live 3D Slicer scenes in the browser ([pieper/SlicerLive](https://github.com/pieper/SlicerLive), [gallery](https://pieper.github.io/live)).

**SlicerHeart** — cardiac analysis extension for 3D Slicer ([SlicerHeart](https://github.com/SlicerHeart/SlicerHeart)). If you use it in research, cite Lasso A, et al., *Frontiers in Cardiovascular Medicine* ([2022](https://doi.org/10.3389/fcvm.2022.886549)).

## Citation

If you use Imaging Data Commons data or tooling in research, please cite:

Fedorov A, et al. National Cancer Institute Imaging Data Commons: Toward Transparency, Reproducibility, and Scalability in Imaging Artificial Intelligence. *Radiographics*. 2023. [doi:10.1148/rg.230180](https://doi.org/10.1148/rg.230180).

