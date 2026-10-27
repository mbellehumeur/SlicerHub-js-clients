import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ro: LocaleBundle = {
  chrome: {
    conferencing: 'Conferință',
    open: 'Deschide',
    close: 'Închide',
    searchPortal: 'Portal de căutare',
    searchPortalTitle: 'Deschide portalul de căutare IDC',
    worklist: 'Worklist:',
    exploreIdc: 'Explorați NCI Imaging Data Commons:',
    viewers: 'Vizualizatoare:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curs:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Context curent:',
    none: 'niciunul',
    colStudy: 'Studiu',
    colModalities: 'Modalități',
    colFormat: 'Format',
    colSize: 'Dimensiune',
    language: 'Limbă',
    openStudy: 'Deschide studiul',
    closeStudy: 'Închide studiul deschis',
    closeContext: 'Închide contextul curent',
    cannotOpen: 'Nu se poate deschide',
    saveWorklist: 'Salvează',
    loadWorklist: 'Încarcă',
    saveWorklistTitle: 'Salvează worklist-ul meu ca JSON',
    loadWorklistTitle: 'Încarcă worklist-ul meu din JSON',
  },
  conference: CONFERENCE_BY_LOCALE.ro,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Despre această aplicație',
    aboutLinkLabel: 'Despre',
    aboutLinkSuffix: '— licențe, mulțumiri și mărci comerciale.',
    quickStartTitle: 'Start rapid:',
    quickStartBody:
      'Faceți clic pe unul dintre butoanele {{open}} din dreapta pentru a deschide un CR și a folosi pictograma baghetei magice {{magicWand}} pentru a rula FleXray.',
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
    howto0Title: 'Cum se conectează Worklist la 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Instalați extensia Slicer Hub Interface</li>
        <li>În <strong>3D Slicer</strong>, deschideți modulul <strong>Hub Interface</strong>, apoi secțiunea <strong>Image Display Client</strong>.</li>
        <li>Alegeți hub-ul <strong>SLICER-HUB-CLOUD</strong> (același hub cloud ca această worklist). Folosiți <strong>SLICER-HUB</strong> doar când rulați un hub local pe portul 2018.</li>
        <li>Fără OIDC, setați <strong>User</strong> la același utilizator ca worklist-ul cloud (stânga sus), apoi faceți clic pe <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>După conectare, butonul vizualizator <strong>SlicerDesktop</strong> se activează, selectorul trece la «3D Slicer», iar lista afișează conținutul bazei DICOM Slicer. Deschideți un studiu — se încarcă în Slicer desktop.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist cu vizualizatoare (SlicerDesktop selectat), AI la distanță și listă de studii" width="870" height="498" />
        </li>
        <li>Pentru conferință în browser / vizualizare live, folosiți <strong>SlicerLive</strong> și <strong>Conferință</strong> când alții urmăresc modificările de nod și cameră/prezentare.</li>
      </ol>
    `,
    howto1Title: 'Cum se alătură unei conferințe.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Deschideți worklist și faceți clic pe <strong>Conferință</strong> în dreapta sus.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Antet SlicerLive cu conferința evidențiată" width="477" height="117" />
        </li>
        <li>Dacă pe instanța hub există o conferință în curs, va apărea într-o listă derulantă.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Alăturare la conferință: lista conferințelor active și butonul Alătură-te" width="322" height="175" />
        </li>
        <li>Dacă conferința nu a început încă, așteptați invitația de alăturare:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitație: Alăturare și urmărire, Alăturare fără urmărire sau Nu mă alătur" width="190" height="141" />
        </li>
        <li>Dacă ați ales urmărirea, urmăriți studiul și prezentarea gazdei. Ieșiți oricând cu <strong>Părăsește conferința</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Antet cu Părăsește conferința, locul dvs. și un participant care urmează" width="397" height="80" />
        </li>
        <li>Dacă opriți urmărirea, puteți apoi relua urmărirea sau prelua conferința.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Antet cu Reluați urmărirea și Preiați după oprirea urmăririi" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Cum se creează o conferință.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Deschideți worklist-ul și faceți clic pe <strong>Conferință</strong> în dreapta sus.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Antet SlicerLive cu Conferință evidențiată" width="477" height="117" />
        </li>
        <li>Ca gazdă, faceți clic pe <strong>Conferință</strong> (antet worklist sau bara SlicerLive). Alegeți un titlu și creați — deveniți locul <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Creați conferința: câmp titlu și buton Creați conferința" width="167" height="192" />
        </li>
        <li>În timp ce conduceți, modificările din SlicerLive (aspect, fereastră/nivel, vizibilitate segmente, cameră, scroll/pan/zoom MPR, cerneală efemeră și actualizări similare de scenă) sunt propagate urmăritorilor.</li>
        <li>Puteți <strong>Încheia conferința</strong> pentru toată lumea. În timp ce conduceți, folosiți tasta <strong>B</strong> pentru a activa/dezactiva cerneala efemeră.</li>
        <li>Puteți testa conferința pe un singur desktop cu butonul <strong>Open another user</strong>. Vedeți videoclipul demo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Cum se caută în IDC și se adaugă la o listă personală.',
    howto4Title: 'Cum se încarcă un studiu local într-un vizualizator.',
    howto5Title: 'Cum se utilizează AI la distanță',
    howto6Title: 'Cum se exportă un segment în STL pentru imprimare 3D.',
    howto7Title: 'Cum se utilizează Reporting / DICOM SR.',
  },
};
