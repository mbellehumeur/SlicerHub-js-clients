import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';

export const en = {
  chrome: {
    conferencing: 'Conferencing',
    open: 'Open',
    close: 'Close',
    searchPortal: 'Search portal',
    searchPortalTitle: 'Open the IDC search portal',
    worklist: 'Worklist',
    exploreIdc: 'Explore the NCI Imaging Data Commons:',
    viewers: 'Image Displays:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Courses:',
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
  },
  conference: CONFERENCE_BY_LOCALE.en,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'About this application',
    aboutLinkLabel: 'About',
    aboutLinkSuffix: '— licenses, acknowledgements, and trademarks.',
    quickStartTitle: 'Quick Start:',
    quickStartBody:
      'Click one of the {{open}} buttons on the right to view a study in 3D and MPR.',
    introHtml: `
        <p>
          The original purpose of this application is to be a "worklist client" actor in an open-source
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          and
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>
          system that resides in a 3D Slicer extension called
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Slicer Hub provides the messaging infrastructure and aims to promote, train, develop, and
          demonstrate interoperability in medical imaging applications.
        </p>
        <p>The application is therefore one component (<strong>WORKLIST_CLIENT actor</strong>) of a system that includes:</p>
        <ul class="wl-help-steps">
          <li>a WebSub hub (<strong>HUB actor</strong>) for communication between applications and users</li>
          <li>open-source medical imaging viewers (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>open-source medical imaging inference models (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>a DICOM SR reporting example (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>the <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> and the <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM DB as read-only image archives (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>an authentication / identity provider with integration to the hub OIDC endpoints or built-in hub anonymous/mock authentication</li>
        </ul>
        <p>
          The system also includes features for education that are independent of the IHE
          Integrated Reporting workflow:
        </p>
        <ul class="wl-help-steps">
          <li>creating, saving, and uploading teaching files and cohorts for class preparation</li>
          <li>conferencing for collaborative viewing and teaching</li>
          <li>a vanishing brush tool for temporary annotations during conferencing</li>
          <li>export to STL for 3D printing</li>
        </ul>
        <p>
          Research and 3D Slicer functionalities, also independent of IHE, are provided:
        </p>
        <ul class="wl-help-steps">
          <li>file transfer between applications</li>
          <li>medical reality scenes</li>
          <li>Slicer Qt Image Display client</li>
          <li>Slicer DICOM DB access</li>
        </ul>
        <p>
          File transfer allows inference servers to send their results directly back to the viewers
          without storing them in PACS first. It also supports research file formats like NIfTI, NRRD, and Zarr.
        </p>
    `,
    howto0Title: 'How to connect SlicerWorklist to 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist with viewers (SlicerDesktop selected), Evidence Creators, and study list" width="870" height="498" />
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
