import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const cs: LocaleBundle = {
  chrome: {
    conferencing: 'Konference',
    open: 'Otevřít',
    close: 'Zavřít',
    searchPortal: 'Vyhledávací portál',
    searchPortalTitle: 'Otevřít vyhledávací portál IDC',
    worklist: 'Worklist:',
    exploreIdc: 'Prozkoumat NCI Imaging Data Commons:',
    viewers: 'Prohlížeče:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurz:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Aktuální kontext:',
    none: 'žádný',
    colStudy: 'Studie',
    colModalities: 'Modality',
    colFormat: 'Formát',
    colSize: 'Velikost',
    language: 'Jazyk',
    openStudy: 'Otevřít studii',
    closeStudy: 'Zavřít otevřenou studii',
    closeContext: 'Zavřít aktuální kontext',
    cannotOpen: 'Nelze otevřít',
    saveWorklist: 'Uložit',
    loadWorklist: 'Načíst',
    saveWorklistTitle: 'Uložit můj worklist jako JSON',
    loadWorklistTitle: 'Načíst můj worklist z JSON',
  },
  conference: CONFERENCE_BY_LOCALE.cs,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'O této aplikaci',
    aboutLinkLabel: 'O aplikaci',
    aboutLinkSuffix: '— licence, poděkování a ochranné známky.',
    quickStartTitle: 'Rychlý start:',
    quickStartBody:
      'Klikněte na jedno z tlačítek {{open}} vpravo pro otevření CR a použijte ikonu kouzelné hůlky {{magicWand}} ke spuštění FleXray.',
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
    howto0Title: 'Jak připojit Worklist k 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Nainstalujte rozšíření Slicer Hub Interface</li>
        <li>Ve <strong>3D Slicer</strong> otevřete modul <strong>Hub Interface</strong> a sekci <strong>Image Display Client</strong>.</li>
        <li>Zvolte hub <strong>SLICER-HUB-CLOUD</strong> (stejný cloudový hub jako tato worklist). <strong>SLICER-HUB</strong> použijte pouze při lokálním hubu na portu 2018.</li>
        <li>Bez OIDC nastavte <strong>User</strong> na stejného uživatele jako cloudová worklist (vlevo nahoře) a klikněte na <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Po připojení se aktivuje tlačítko prohlížeče <strong>SlicerDesktop</strong>, selektor se změní na «3D Slicer» a seznam zobrazí obsah DICOM databáze Slicer. Otevřete studii — načte se v desktopovém Sliceru.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist s prohlížeči (vybrán SlicerDesktop), vzdálenou AI a seznamem studií" width="870" height="498" />
        </li>
        <li>Pro konferenci / živé zobrazení v prohlížeči použijte <strong>SlicerLive</strong> a <strong>Konferenci</strong>, když ostatní sledují změny uzlů a kamery/prezentace.</li>
      </ol>
    `,
    howto1Title: 'Jak se připojit ke konferenci.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Otevřete worklist a klikněte vpravo nahoře na <strong>Konference</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Záhlaví SlicerLive se zvýrazněnou konferencí" width="477" height="117" />
        </li>
        <li>Pokud na vaší hub instanci již konference probíhá, zobrazí se v rozbalovacím seznamu.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Připojit se ke konferenci: rozbalovací seznam aktivních konferencí a tlačítko Připojit" width="322" height="175" />
        </li>
        <li>Pokud konference ještě nezačala, počkejte na pozvánku k připojení:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Pozvánka: Připojit se a sledovat, Připojit se bez sledování nebo Nepřipojovat se" width="190" height="141" />
        </li>
        <li>Pokud jste zvolili sledování, sledujete studii a prezentaci hostitele. Kdykoli odejděte pomocí <strong>Opustit konferenci</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Záhlaví s Opustit konferenci, vaším místem a sledujícím účastníkem" width="397" height="80" />
        </li>
        <li>Pokud přestanete sledovat, můžete poté sledování obnovit nebo konferenci převzít.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Záhlaví s Obnovit sledování a Převzít po zastavení sledování" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Jak vytvořit konferenci.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Otevřete worklist a klikněte na <strong>Konference</strong> vpravo nahoře.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Záhlaví SlicerLive se zvýrazněnou Konferencí" width="477" height="117" />
        </li>
        <li>Jako hostitel klikněte na <strong>Konference</strong> (záhlaví worklistu nebo lišta SlicerLive). Zvolte název a vytvořte — stanete se <strong>vedoucím</strong> místem.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Vytvořit konferenci: pole názvu a tlačítko Vytvořit konferenci" width="167" height="192" />
        </li>
        <li>Během vedení se změny ve SlicerLive (rozložení, okno/úroveň, viditelnost segmentů, kamera, MPR scroll/pan/zoom, mizející inkoust a podobné aktualizace scény) šíří k následovníkům.</li>
        <li>Můžete <strong>Ukončit konferenci</strong> pro všechny. Během vedení použijte klávesu <strong>B</strong> k zapnutí/vypnutí mizejícího inkoustu.</li>
        <li>Konferenci můžete vyzkoušet na jednom počítači tlačítkem <strong>Open another user</strong>. Ukázkové video: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Jak vyhledávat v IDC a přidávat do osobního seznamu.',
    howto4Title: 'Jak načíst místní studii do prohlížeče.',
    howto5Title: 'Jak používat vzdálenou AI',
    howto6Title: 'Jak exportovat segment do STL pro 3D tisk.',
    howto7Title: 'Jak používat Reporting / DICOM SR.',
  },
};
