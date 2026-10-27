import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const hu: LocaleBundle = {
  chrome: {
    conferencing: 'Konferencia',
    open: 'Megnyitás',
    close: 'Bezárás',
    searchPortal: 'Keresőportál',
    searchPortalTitle: 'IDC keresőportál megnyitása',
    worklist: 'Worklist:',
    exploreIdc: 'Fedezze fel az NCI Imaging Data Commons-ot:',
    viewers: 'Megjelenítők:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurzus:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Jelenlegi kontextus:',
    none: 'nincs',
    colStudy: 'Vizsgálat',
    colModalities: 'Modalitások',
    colFormat: 'Formátum',
    colSize: 'Méret',
    language: 'Nyelv',
    openStudy: 'Vizsgálat megnyitása',
    closeStudy: 'Nyitott vizsgálat bezárása',
    closeContext: 'Jelenlegi kontextus bezárása',
    cannotOpen: 'Nem nyitható meg',
    saveWorklist: 'Mentés',
    loadWorklist: 'Betöltés',
    saveWorklistTitle: 'Saját worklist mentése JSON-ként',
    loadWorklistTitle: 'Saját worklist betöltése JSON-ból',
  },
  conference: CONFERENCE_BY_LOCALE.hu,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Az alkalmazásról',
    aboutLinkLabel: 'Névjegy',
    aboutLinkSuffix: '— licencek, köszönetnyilvánítások és védjegyek.',
    quickStartTitle: 'Gyors indítás:',
    quickStartBody:
      'Kattintson jobbra az egyik {{open}} gombra egy CR megnyitásához, majd használja a varázspálca ikont {{magicWand}} a FleXray futtatásához.',
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
    howto0Title: 'A Worklist csatlakoztatása 3D Slicerhez.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Telepítse a Slicer Hub Interface bővítményt</li>
        <li>A <strong>3D Slicer</strong>-ben nyissa meg a <strong>Hub Interface</strong> modult, majd az <strong>Image Display Client</strong> szekciót.</li>
        <li>Válassza a <strong>SLICER-HUB-CLOUD</strong> hubot (ugyanaz a felhő hub, mint ennél a worklistnél). A <strong>SLICER-HUB</strong>-ot csak akkor használja, ha helyi hub fut a 2018-as porton.</li>
        <li>OIDC nélkül állítsa a <strong>User</strong> mezőt ugyanarra a felhasználóra, mint a felhő worklist (bal felső), majd kattintson a <strong>Connect</strong> gombra.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Csatlakozás után a worklist <strong>SlicerDesktop</strong> megjelenítő gombja kivilágosodik, a választó «3D Slicer»-re vált, és a lista a Slicer DICOM adatbázis tartalmát mutatja. Nyisson meg egy vizsgálatot — az asztali Slicerben töltődik be.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist megjelenítőkkel (SlicerDesktop kiválasztva), távoli AI-val és vizsgálatlistával" width="870" height="498" />
        </li>
        <li>Böngészős konferenciához / élő nézethez használja a <strong>SlicerLive</strong>-ot és a <strong>Konferencia</strong>t, amikor mások követik a csomópont- és kamera/prezentáció-változásokat.</li>
      </ol>
    `,
    howto1Title: 'Hogyan csatlakozzon konferenciához.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Nyissa meg a worklistet, és kattintson a jobb felső <strong>Konferencia</strong> gombra.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive fejléc kiemelt konferenciával" width="477" height="117" />
        </li>
        <li>Ha a hub példányán már van folyamatban lévő konferencia, az egy legördülő listában jelenik meg.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Csatlakozás konferenciához: aktív konferenciák listája és Csatlakozás gomb" width="322" height="175" />
        </li>
        <li>Ha a konferencia még nem indult el, várja meg a csatlakozási meghívót:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Meghívó: Csatlakozás és követés, Csatlakozás követés nélkül vagy Nem csatlakozom" width="190" height="141" />
        </li>
        <li>Ha a követést választotta, követi a házigazda vizsgálatát és prezentációját. Bármikor kiléphet a <strong>Konferencia elhagyása</strong> gombbal.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Fejléc Konferencia elhagyása, az Ön helye és egy követő résztvevő" width="397" height="80" />
        </li>
        <li>Ha abbahagyja a követést, ezután folytathatja a követést, vagy átveheti a konferenciát.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Fejléc Követés folytatása és Átvétel a követés leállítása után" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Hogyan hozzon létre konferenciát.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Nyissa meg a worklistet, és kattintson a <strong>Konferencia</strong> gombra jobbra fent.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive fejléc kiemelt Konferenciával" width="477" height="117" />
        </li>
        <li>Házigazdaként kattintson a <strong>Konferencia</strong> gombra (worklist fejléc vagy SlicerLive sáv). Válasszon címet és hozza létre — Ön lesz a <strong>vezető</strong> hely.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Konferencia létrehozása: cím mező és Konferencia létrehozása gomb" width="167" height="192" />
        </li>
        <li>Vezetés közben a SlicerLive változásai (elrendezés, ablak/szint, szegmensláthatóság, kamera, MPR görgetés/pan/zoom, eltűnő tinta és hasonló jelenetfrissítések) eljutnak a követőkhöz.</li>
        <li>Mindenki számára <strong>Befejezheti a konferenciát</strong>. Vezetés közben a <strong>B</strong> billentyűvel kapcsolhatja az eltűnő tintát.</li>
        <li>Egy asztalon a <strong>Open another user</strong> gombbal tesztelheti a konferenciát. Demóvideó: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Keresés az IDC-ben és hozzáadás személyes listához.',
    howto4Title: 'Helyi vizsgálat betöltése megjelenítőbe.',
    howto5Title: 'Távoli AI használata',
    howto6Title: 'Szegmens exportálása STL-be 3D nyomtatáshoz.',
    howto7Title: 'Reporting / DICOM SR használata.',
  },
};
