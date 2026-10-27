import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';

export const en = {
  chrome: {
    conferencing: 'Conferencing',
    open: 'Open',
    close: 'Close',
    searchPortal: 'Search portal',
    searchPortalTitle: 'Open the IDC search portal',
    worklist: 'Worklist:',
    exploreIdc: 'Explore the NCI Imaging Data Commons:',
    viewers: 'Image Displays:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    omiFhir: 'OMI Registry',
    omiFhirTitle:
      'Open Medical Inference (OMI) registry for all inference models',
    classroom: 'Classrooms:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Current context:',
    none: 'none',
    colStudy: 'Study',
    colModalities: 'Modalities',
    colFormat: 'Format',
    colSize: 'Size',
    language: 'Language',
    openStudy: 'Open study',
    closeStudy: 'Close the open study',
    closeContext: 'Close current context',
    cannotOpen: 'Cannot open',
    saveWorklist: 'Save',
    loadWorklist: 'Load',
    saveWorklistTitle: 'Save My Worklist as JSON',
    loadWorklistTitle: 'Load My Worklist from JSON',
  },
  conference: CONFERENCE_BY_LOCALE.en,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'About this application',
    aboutLinkLabel: 'About',
    aboutLinkSuffix: '— licenses, acknowledgements, and trademarks.',
    quickStartTitle: 'Quick Start:',
    quickStartBody:
      'Click one of the {{open}} buttons on the right to open a CR and use the magic wand icon {{magicWand}} to run FleXray.',
    introHtml: `
        <p>
          This application uses the
          <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">WebSub integration</a>
          and open-source viewers to provide a collaborative conferencing
          environment for education. Lessons are organized as
          <strong>courses</strong> that educators can extend by adding folders
          under the courses folder.
        </p>
        <p>
          The IDC is part of the NCI Cancer Research Data Commons. It hosts large,
          publicly available collections of cancer imaging data in the cloud so
          researchers, clinicians, and educators can explore real clinical-grade
          studies without setting up their own archive.
        </p>
        <p>
          IDC invests in education and open tooling so students and teachers can
          learn medical imaging with authentic data, reproducible workflows, and
          freely available viewers—not only research pipelines.
        </p>
        <p>
          Viewing is powered by open-source platforms that share IDC’s commitment
          to accessible medical imaging:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="https://ohif.org/" target="_blank" rel="noopener">OHIF</a>
            — a web-based medical image viewer built on open standards (including
            DICOMweb). It is widely used in research and education, and is designed
            so modes and extensions can grow with teaching and clinical workflows.
          </li>
          <li>
            <a href="https://github.com/ImagingDataCommons/slim" target="_blank" rel="noopener">Slim</a>
            — an interoperable slide microscopy viewer from the Imaging Data
            Commons (National Cancer Institute), for teaching and research with
            whole-slide imaging.
          </li>
          <li>
            <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>
            — a desktop platform for visualization, analysis, and research.
            <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>
            runs as a Slicer extension so Classroom, conferencing, and image
            display can share one open messaging stack with the same data and tools.
          </li>
        </ul>
        <p>
          For free, open anatomy education, see the
          <a href="https://www.openanatomy.org/" target="_blank" rel="noopener">Open Anatomy Project</a>
          at Brigham and Women’s Hospital. It distributes high-quality anatomy
          atlases and open-source software worldwide—democratizing medical
          knowledge for students, clinicians, researchers, and the public,
          wherever they live and in many languages. Atlases are viewed in the
          web-based Open Anatomy Browser; the group also created
          <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>,
          which was used to build the atlases.
        </p>
        <p>
          The University of Twente
          <a href="https://bonehub.github.io/Educational-Atlas/" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          offers interactive full-skeleton 3D models of the Visible Human Male
          and Female for teaching, visualization, and 3D printing. Free STL
          meshes and IGES/STEP CAD files (CC BY 4.0) are available from the
          <a href="https://huggingface.co/datasets/BoneHub/visible-human-3d-models" target="_blank" rel="noopener">visible-human-3d-models</a>
          dataset on Hugging Face.
        </p>
    `,
    howto0Title: 'How to connect Worklist to 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Install the Slicer Hub Interface Extension</li>
        <li>In <strong>3D Slicer</strong>, open the <strong>Hub Interface</strong> module, then the <strong>Image Display Client</strong> section.</li>
        <li>Choose hub <strong>SLICER-HUB-CLOUD</strong> (same cloud hub as this worklist). Use <strong>SLICER-HUB</strong> only when you are running a local hub on port 2018.</li>
        <li>If not using OIDC, set <strong>User</strong> to the same user as your cloud worklist (top left), then click <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic set, Connect, status Connected" width="585" height="127" />
        </li>
        <li>When connected, the worklist <strong>SlicerDesktop</strong> viewer button lights up, the worklist selector will change to "3D Slicer" and the worklist will display the content of the Slicer DICOM database. Open a study from the list — it loads in desktop Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist with viewers (SlicerDesktop selected), Evidence Creators, and study list" width="870" height="498" />
        </li>
        <li>For browser conferencing / live view, use <strong>SlicerLive</strong> and <strong>Conferencing</strong> when others follow your node changes and camera/presentation changes.</li>
      </ol>
    `,
    howto1Title: 'How to join a conference.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Open the worklist and click <strong>Conferencing</strong> on the top right.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive header with Conferencing highlighted" width="477" height="117" />
        </li>
        <li>If a conference is in progress on your hub instance, it will be shown in a dropdown.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Join a conference: active conferences dropdown and Join conference button" width="322" height="175" />
        </li>
        <li>If the conference has not started, wait for the invitation to join:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Conference invitation: Join and follow, Join but do not follow, or Do not join" width="190" height="141" />
        </li>
        <li>If you chose follow, you track the host’s study and presentation. Leave anytime with <strong>Leave conference</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Header with Leave conference, your place, and a following participant" width="397" height="80" />
        </li>
        <li>If you stop following, you can then resume following or take over the conference.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Header with Resume following and Take over after stopping follow" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'How to create a conference.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Open the worklist and click <strong>Conferencing</strong> on the top right.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive header with Conferencing highlighted" width="477" height="117" />
        </li>
        <li>As the host, click <strong>Conferencing</strong> (worklist header or the SlicerLive bar). Pick a conference title and create it — you become the <strong>leading</strong> place.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Create conference: title field and Create conference button" width="167" height="192" />
        </li>
        <li>While leading, changes you make in SlicerLive (layout, window/level, segment visibility, camera, MPR slice scroll/pan/zoom, vanishing marker ink, and similar scene updates) fan out to followers on the conference.</li>
        <li>You can <strong>End conference</strong> for everyone. While leading, use the <strong>B</strong> hotkey to toggle vanishing marker ink on/off.</li>
        <li>You can test conferencing on a single desktop by using the <strong>Open another user</strong> button. See the following video for a demo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'How to search the IDC and add to a personal list.',
    howto4Title: 'How to load a local study to a viewer.',
    howto5Title: 'How to use remote AI',
    howto6Title: 'How to export a segment to an STL file for 3D printing.',
    howto7Title: 'How to use Reporting / DICOM SR.',
  },
} as const;
