import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ca: LocaleBundle = {
  chrome: {
    conferencing: 'Conferència',
    open: 'Obrir',
    close: 'Tancar',
    searchPortal: 'Portal de cerca',
    searchPortalTitle: 'Obrir el portal de cerca IDC',
    worklist: 'Llista de treball:',
    exploreIdc: 'Explorar el NCI Imaging Data Commons:',
    viewers: 'Visualitzadors:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curs:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Context actual:',
    none: 'cap',
    colStudy: 'Estudi',
    colModalities: 'Modalitats',
    colFormat: 'Format',
    colSize: 'Mida',
    language: 'Idioma',
    openStudy: 'Obrir l’estudi',
    closeStudy: 'Tancar l’estudi obert',
    closeContext: 'Tancar el context actual',
    cannotOpen: 'No es pot obrir',
    saveWorklist: 'Desa',
    loadWorklist: 'Carrega',
    saveWorklistTitle: 'Desa la meva llista de treball com a JSON',
    loadWorklistTitle: 'Carrega la meva llista de treball des de JSON',
  },
  conference: CONFERENCE_BY_LOCALE.ca,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Quant a aquesta aplicació',
    aboutLinkLabel: 'Quant a',
    aboutLinkSuffix: '— llicències, agraïments i marques.',
    quickStartTitle: 'Inici ràpid:',
    quickStartBody:
      'Feu clic en un dels botons {{open}} a la dreta per obrir un CR i usar la icona de vareta màgica {{magicWand}} per executar FleXray.',
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
    howto0Title: 'Com connectar Worklist a 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Instal·leu l’extensió Slicer Hub Interface</li>
        <li>A <strong>3D Slicer</strong>, obriu el mòdul <strong>Hub Interface</strong> i la secció <strong>Image Display Client</strong>.</li>
        <li>Trieu el hub <strong>SLICER-HUB-CLOUD</strong> (el mateix hub al núvol que aquesta llista). Useu <strong>SLICER-HUB</strong> només si executeu un hub local al port 2018.</li>
        <li>Sense OIDC, poseu <strong>User</strong> igual que l’usuari de la llista al núvol (a dalt a l’esquerra) i feu clic a <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD" width="585" height="127" />
        </li>
        <li>Un cop connectat, el botó <strong>SlicerDesktop</strong> s’activa, el selector passa a «3D Slicer» i la llista mostra la base DICOM de Slicer. Obriu un estudi — es carrega a Slicer d’escriptori.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist amb visualitzadors i llista d’estudis" width="870" height="498" />
        </li>
        <li>Per a conferència / vista en viu al navegador, useu <strong>SlicerLive</strong> i <strong>Conferència</strong> quan altres segueixin els canvis de nodes i càmera/presentació.</li>
      </ol>
    `,
    howto1Title: 'Com unir-se a una conferència.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Obriu la worklist i feu clic a <strong>Conferència</strong> a dalt a la dreta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Capçalera SlicerLive amb Conferència destacada" width="477" height="117" />
        </li>
        <li>Si hi ha una conferència en curs a la vostra instància del hub, es mostrarà en un desplegable.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Unir-se a una conferència: desplegable de conferències actives i botó Unir-se" width="322" height="175" />
        </li>
        <li>Si la conferència encara no ha començat, espereu la invitació per unir-vos:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitació a la conferència" width="190" height="141" />
        </li>
        <li>Si heu triat seguir, seguiu l’estudi i la presentació de l’amfitrió. Sortiu en qualsevol moment amb <strong>Sortir de la conferència</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Capçalera amb Sortir de la conferència, el vostre lloc i un participant que segueix" width="397" height="80" />
        </li>
        <li>Si deixeu de seguir, després podeu reprendre el seguiment o prendre el control de la conferència.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Capçalera amb Reprendre el seguiment i Prendre el control després d’aturar el seguiment" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Com crear una conferència.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Obriu la worklist i feu clic a <strong>Conferència</strong> a dalt a la dreta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Capçalera SlicerLive amb Conferència destacada" width="477" height="117" />
        </li>
        <li>Com a amfitrió, feu clic a <strong>Conferència</strong> (capçalera o barra de SlicerLive). Trieu un títol i creeu-la — esdevindreu el lloc <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Crear conferència: camp de títol i botó Crear conferència" width="167" height="192" />
        </li>
        <li>Mentre lidereu, els canvis a SlicerLive (disposició, finestra/nivell, visibilitat de segments, càmera, desplaçament/pan/zoom MPR, tinta efímera i actualitzacions d’escena similars) es propaguen als seguidors.</li>
        <li>Podeu <strong>Finalitzar la conferència</strong> per a tothom. Mentre lidereu, useu la tecla <strong>B</strong> per activar/desactivar la tinta efímera.</li>
        <li>Podeu provar la conferència en un sol escriptori amb el botó <strong>Open another user</strong>. Vegeu el vídeo de demostració: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Com cercar a IDC i afegir a una llista personal.',
    howto4Title: 'Com carregar un estudi local a un visualitzador.',
    howto5Title: 'Com utilitzar la IA remota',
    howto6Title: 'Com exportar un segment a STL per a impressió 3D.',
    howto7Title: 'Com utilitzar Reporting / DICOM SR.',
  },
};
