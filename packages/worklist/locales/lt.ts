import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const lt: LocaleBundle = {
  chrome: {
    conferencing: 'Konferencija',
    open: 'Atidaryti',
    close: 'Uždaryti',
    searchPortal: 'Paieškos portalas',
    searchPortalTitle: 'Atidaryti IDC paieškos portalą',
    worklist: 'Worklist:',
    exploreIdc: 'Naršykite NCI Imaging Data Commons:',
    viewers: 'Peržiūros programos:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kursas:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Dabartinis kontekstas:',
    none: 'nėra',
    colStudy: 'Tyrimas',
    colModalities: 'Modalumai',
    colFormat: 'Formatas',
    colSize: 'Dydis',
    language: 'Kalba',
    openStudy: 'Atidaryti tyrimą',
    closeStudy: 'Uždaryti atidarytą tyrimą',
    closeContext: 'Uždaryti dabartinį kontekstą',
    cannotOpen: 'Nepavyksta atidaryti',
    saveWorklist: 'Išsaugoti',
    loadWorklist: 'Įkelti',
    saveWorklistTitle: 'Išsaugoti mano darbų sąrašą kaip JSON',
    loadWorklistTitle: 'Įkelti mano darbų sąrašą iš JSON',
  },
  conference: CONFERENCE_BY_LOCALE.lt,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Apie šią programą',
    aboutLinkLabel: 'Apie',
    aboutLinkSuffix: '— licencijos, padėkos ir prekių ženklai.',
    quickStartTitle: 'Greita pradžia:',
    quickStartBody:
      'Dešinėje spustelėkite vieną mygtukų {{open}}, kad atidarytumėte CR ir naudotumėte magijos lazdelės piktogramą {{magicWand}} FleXray paleisti.',
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
    howto0Title: 'Kaip prijungti Worklist prie 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Įdiekite Slicer Hub Interface plėtinį</li>
        <li><strong>3D Slicer</strong> atidarykite modulį <strong>Hub Interface</strong> ir skiltį <strong>Image Display Client</strong>.</li>
        <li>Pasirinkite hubą <strong>SLICER-HUB-CLOUD</strong> (tas pats debesies hubas kaip šioje worklist). Naudokite <strong>SLICER-HUB</strong> tik kai vietinis hubas veikia 2018 prievade.</li>
        <li>Be OIDC nustatykite <strong>User</strong> tą patį vartotoją kaip debesies worklist (viršuje kairėje), tada spustelėkite <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Prisijungus worklist <strong>SlicerDesktop</strong> peržiūros mygtukas užsidega, selektorius pasikeičia į «3D Slicer», o sąrašas rodo Slicer DICOM duomenų bazės turinį. Atidarykite tyrimą — jis įkeliamas į darbalaukio Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist su peržiūros programomis (pasirinktas SlicerDesktop), nuotoliniu AI ir tyrimų sąrašu" width="870" height="498" />
        </li>
        <li>Naršyklės konferencijai / tiesioginei peržiūrai naudokite <strong>SlicerLive</strong> ir <strong>Konferencija</strong>, kai kiti seka mazgo ir kameros/prezentacijos pakeitimus.</li>
      </ol>
    `,
    howto1Title: 'Kaip prisijungti prie konferencijos.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Atidarykite worklist ir spustelėkite <strong>Konferencija</strong> viršuje dešinėje.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive antraštė su paryškinta konferencija" width="477" height="117" />
        </li>
        <li>Jei jūsų hub egzemplioriuje jau vyksta konferencija, ji bus rodoma išskleidžiamajame sąraše.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Prisijungti prie konferencijos: aktyvių konferencijų sąrašas ir mygtukas Prisijungti" width="322" height="175" />
        </li>
        <li>Jei konferencija dar neprasidėjo, palaukite kvietimo prisijungti:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Kvietimas: Prisijungti ir sekti, Prisijungti be sekimo arba Ne prisijungti" width="190" height="141" />
        </li>
        <li>Jei pasirinkote sekti, sekate šeimininko tyrimą ir pristatymą. Išeikite bet kada su <strong>Palikti konferenciją</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Antraštė su Palikti konferenciją, jūsų vieta ir sekančiu dalyviu" width="397" height="80" />
        </li>
        <li>Jei nustojate sekti, vėliau galite atnaujinti sekimą arba perimti konferenciją.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Antraštė su Atnaujinti sekimą ir Perimti sustabdžius sekimą" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Kaip sukurti konferenciją.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Atidarykite worklist ir spustelėkite <strong>Konferencija</strong> viršuje dešinėje.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive antraštė su paryškinta Konferencija" width="477" height="117" />
        </li>
        <li>Kaip šeimininkas spustelėkite <strong>Konferencija</strong> (worklist antraštė arba SlicerLive juosta). Pasirinkite pavadinimą ir sukurkite — tampate <strong>leading</strong> vieta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Sukurti konferenciją: pavadinimo laukas ir mygtukas Sukurti konferenciją" width="167" height="192" />
        </li>
        <li>Vadovaujant SlicerLive pakeitimai (išdėstymas, langas/lygis, segmentų matomumas, kamera, MPR slinkimas/pan/zoom, nykstantis rašalas ir panašūs scenos atnaujinimai) perduodami sekėjams.</li>
        <li>Galite <strong>Baigti konferenciją</strong> visiems. Vadovaujant naudokite klavišą <strong>B</strong>, kad įjungtumėte/išjungtumėte nykstantį rašalą.</li>
        <li>Konferenciją galite išbandyti viename kompiuteryje mygtuku <strong>Open another user</strong>. Demonstracinis vaizdo įrašas: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Kaip ieškoti IDC ir pridėti prie asmeninio sąrašo.',
    howto4Title: 'Kaip įkelti vietinį tyrimą į peržiūros programą.',
    howto5Title: 'Kaip naudoti nuotolinį AI',
    howto6Title: 'Kaip eksportuoti segmentą į STL 3D spausdinimui.',
    howto7Title: 'Kaip naudoti Reporting / DICOM SR.',
  },
};
