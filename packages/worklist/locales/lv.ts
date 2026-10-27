import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const lv: LocaleBundle = {
  chrome: {
    conferencing: 'Konference',
    open: 'Atvērt',
    close: 'Aizvērt',
    searchPortal: 'Meklēšanas portāls',
    searchPortalTitle: 'Atvērt IDC meklēšanas portālu',
    worklist: 'Worklist:',
    exploreIdc: 'Izpētiet NCI Imaging Data Commons:',
    viewers: 'Skatītāji:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurss:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Pašreizējais konteksts:',
    none: 'nav',
    colStudy: 'Pētījums',
    colModalities: 'Modalitātes',
    colFormat: 'Formāts',
    colSize: 'Izmērs',
    language: 'Valoda',
    openStudy: 'Atvērt pētījumu',
    closeStudy: 'Aizvērt atvērto pētījumu',
    closeContext: 'Aizvērt pašreizējo kontekstu',
    cannotOpen: 'Nevar atvērt',
    saveWorklist: 'Saglabāt',
    loadWorklist: 'Ielādēt',
    saveWorklistTitle: 'Saglabāt manu darba sarakstu kā JSON',
    loadWorklistTitle: 'Ielādēt manu darba sarakstu no JSON',
  },
  conference: CONFERENCE_BY_LOCALE.lv,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Par šo lietotni',
    aboutLinkLabel: 'Par',
    aboutLinkSuffix: '— licences, pateicības un preču zīmes.',
    quickStartTitle: 'Ātrais sākums:',
    quickStartBody:
      'Noklikšķiniet uz vienas no {{open}} pogām labajā pusē, lai atvērtu CR un izmantotu burvju nūjiņas ikonu {{magicWand}}, lai palaistu FleXray.',
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
    howto0Title: 'Kā savienot Worklist ar 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Instalējiet Slicer Hub Interface paplašinājumu</li>
        <li><strong>3D Slicer</strong> atveriet moduli <strong>Hub Interface</strong> un sadaļu <strong>Image Display Client</strong>.</li>
        <li>Izvēlieties hubu <strong>SLICER-HUB-CLOUD</strong> (tas pats mākoņa hubs kā šai worklist). Izmantojiet <strong>SLICER-HUB</strong> tikai, ja darbināt lokālu hubu portā 2018.</li>
        <li>Bez OIDC iestatiet <strong>User</strong> uz to pašu lietotāju kā mākoņa worklist (augšā pa kreisi), tad noklikšķiniet <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Pēc savienojuma worklist <strong>SlicerDesktop</strong> skatītāja poga iedegas, selektors mainās uz «3D Slicer», un saraksts rāda Slicer DICOM datubāzes saturu. Atveriet pētījumu — tas ielādējas desktop Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist ar skatītājiem (izvēlēts SlicerDesktop), attālo AI un pētījumu sarakstu" width="870" height="498" />
        </li>
        <li>Pārlūkprogrammas konferencei / tiešraidei izmantojiet <strong>SlicerLive</strong> un <strong>Konference</strong>, kad citi seko jūsu mezglu un kameras/prezentācijas izmaiņām.</li>
      </ol>
    `,
    howto1Title: 'Kā pievienoties konferencei.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Atveriet worklist un noklikšķiniet uz <strong>Konference</strong> augšā pa labi.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive galvene ar izceltu konferenci" width="477" height="117" />
        </li>
        <li>Ja jūsu hub instancē jau notiek konference, tā parādīsies nolaižamajā sarakstā.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Pievienoties konferencei: aktīvo konferenču saraksts un poga Pievienoties" width="322" height="175" />
        </li>
        <li>Ja konference vēl nav sākusies, gaidiet uzaicinājumu pievienoties:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Uzaicinājums: Pievienoties un sekot, Pievienoties bez sekošanas vai Nepievienoties" width="190" height="141" />
        </li>
        <li>Ja izvēlējāties sekot, sekojat saimnieka pētījumam un prezentācijai. Izejiet jebkurā laikā ar <strong>Atstāt konferenci</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Galvene ar Atstāt konferenci, jūsu vietu un sekojošu dalībnieku" width="397" height="80" />
        </li>
        <li>Ja pārtraucat sekošanu, pēc tam varat atsākt sekošanu vai pārņemt konferenci.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Galvene ar Atsākt sekošanu un Pārņemt pēc sekošanas apturēšanas" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Kā izveidot konferenci.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Atveriet worklist un noklikšķiniet uz <strong>Konference</strong> augšējā labajā stūrī.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive galvene ar izcelto Konferenci" width="477" height="117" />
        </li>
        <li>Kā saimnieks noklikšķiniet uz <strong>Konference</strong> (worklist galvene vai SlicerLive josla). Izvēlieties virsrakstu un izveidojiet — kļūstat par <strong>leading</strong> vietu.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Izveidot konferenci: virsraksta lauks un poga Izveidot konferenci" width="167" height="192" />
        </li>
        <li>Vadot izmaiņas SlicerLive (izkārtojums, logs/līmenis, segmentu redzamība, kamera, MPR ritināšana/pan/zoom, izzūdoša tinte un līdzīgi ainas atjauninājumi) tiek izplatītas sekotājiem.</li>
        <li>Varat <strong>Beigt konferenci</strong> visiem. Vadot izmantojiet taustiņu <strong>B</strong>, lai ieslēgtu/izslēgtu izzūdošo tinti.</li>
        <li>Varat pārbaudīt konferenci vienā datorā ar pogu <strong>Open another user</strong>. Demonstrācijas video: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Kā meklēt IDC un pievienot personīgajam sarakstam.',
    howto4Title: 'Kā ielādēt lokālu pētījumu skatītājā.',
    howto5Title: 'Kā lietot attālo AI',
    howto6Title: 'Kā eksportēt segmentu STL failā 3D drukāšanai.',
    howto7Title: 'Kā lietot Reporting / DICOM SR.',
  },
};
