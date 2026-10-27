import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const nl: LocaleBundle = {
  chrome: {
    conferencing: 'Conferentie',
    open: 'Openen',
    close: 'Sluiten',
    searchPortal: 'Zoekportaal',
    searchPortalTitle: 'IDC-zoekportaal openen',
    worklist: 'Worklist:',
    exploreIdc: 'NCI Imaging Data Commons verkennen:',
    viewers: 'Viewers:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Cursus:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Huidige context:',
    none: 'geen',
    colStudy: 'Studie',
    colModalities: 'Modaliteiten',
    colFormat: 'Formaat',
    colSize: 'Grootte',
    language: 'Taal',
    openStudy: 'Studie openen',
    closeStudy: 'Open studie sluiten',
    closeContext: 'Huidige context sluiten',
    cannotOpen: 'Kan niet openen',
    saveWorklist: 'Opslaan',
    loadWorklist: 'Laden',
    saveWorklistTitle: 'Mijn worklist opslaan als JSON',
    loadWorklistTitle: 'Mijn worklist laden uit JSON',
  },
  conference: CONFERENCE_BY_LOCALE.nl,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Over deze toepassing',
    aboutLinkLabel: 'Over',
    aboutLinkSuffix: '— licenties, dankbetuigingen en handelsmerken.',
    quickStartTitle: 'Snel starten:',
    quickStartBody:
      'Klik rechts op een van de knoppen {{open}} om een CR te openen en het toverstafpictogram {{magicWand}} te gebruiken om FleXray uit te voeren.',
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
    howto0Title: 'Hoe Worklist te verbinden met 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Installeer de Slicer Hub Interface-extensie</li>
        <li>Open in <strong>3D Slicer</strong> de module <strong>Hub Interface</strong> en de sectie <strong>Image Display Client</strong>.</li>
        <li>Kies hub <strong>SLICER-HUB-CLOUD</strong> (dezelfde cloudhub als deze worklist). Gebruik <strong>SLICER-HUB</strong> alleen als u een lokale hub op poort 2018 draait.</li>
        <li>Zonder OIDC stelt u <strong>User</strong> in op dezelfde gebruiker als uw cloudworklist (linksboven) en klikt u op <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Na verbinding licht de viewerknop <strong>SlicerDesktop</strong> op, de selector verandert naar «3D Slicer» en de lijst toont de inhoud van de Slicer DICOM-database. Open een studie — deze wordt in desktop-Slicer geladen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist met viewers (SlicerDesktop geselecteerd), externe AI en studielijst" width="870" height="498" />
        </li>
        <li>Voor browserconferentie / liveweergave gebruikt u <strong>SlicerLive</strong> en <strong>Conferentie</strong> wanneer anderen uw knoop- en camera-/presentatiewijzigingen volgen.</li>
      </ol>
    `,
    howto1Title: 'Hoe deel te nemen aan een conferentie.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Open de worklist en klik rechtsboven op <strong>Conferentie</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-kop met gemarkeerde conferentie" width="477" height="117" />
        </li>
        <li>Als er een conferentie actief is op uw hub-instantie, verschijnt die in een keuzelijst.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Deelnemen aan conferentie: keuzelijst actieve conferenties en knop Deelnemen" width="322" height="175" />
        </li>
        <li>Als de conferentie nog niet is gestart, wacht op de uitnodiging om deel te nemen:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Uitnodiging: Deelnemen en volgen, Deelnemen zonder volgen, of Niet deelnemen" width="190" height="141" />
        </li>
        <li>Als u volgen koos, volgt u de studie en presentatie van de host. Verlaat op elk moment met <strong>Conferentie verlaten</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Kop met Conferentie verlaten, uw plaats en een volgende deelnemer" width="397" height="80" />
        </li>
        <li>Als u stopt met volgen, kunt u daarna het volgen hervatten of de conferentie overnemen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Kop met Volgen hervatten en Overnemen na stoppen met volgen" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Hoe een conferentie te maken.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Open de worklist en klik rechtsboven op <strong>Conferentie</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-koptekst met Conferentie gemarkeerd" width="477" height="117" />
        </li>
        <li>Als host klikt u op <strong>Conferentie</strong> (worklist-kop of SlicerLive-balk). Kies een titel en maak aan — u wordt de <strong>leidende</strong> plaats.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Conferentie maken: titelveld en knop Conferentie maken" width="167" height="192" />
        </li>
        <li>Terwijl u leidt, worden wijzigingen in SlicerLive (layout, window/level, segmentzichtbaarheid, camera, MPR scroll/pan/zoom, tijdelijke inkt en vergelijkbare scène-updates) naar volgers gestuurd.</li>
        <li>U kunt de <strong>Conferentie beëindigen</strong> voor iedereen. Terwijl u leidt, gebruikt u de toets <strong>B</strong> om tijdelijke inkt aan/uit te zetten.</li>
        <li>U kunt conferencing op één desktop testen met de knop <strong>Open another user</strong>. Bekijk de demovideo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Hoe te zoeken in IDC en toe te voegen aan een persoonlijke lijst.',
    howto4Title: 'Hoe een lokale studie in een viewer te laden.',
    howto5Title: 'Hoe externe AI te gebruiken',
    howto6Title: 'Hoe een segment als STL te exporteren voor 3D-printen.',
    howto7Title: 'Hoe Reporting / DICOM SR te gebruiken.',
  },
};
