import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const pl: LocaleBundle = {
  chrome: {
    conferencing: 'Konferencja',
    open: 'Otwórz',
    close: 'Zamknij',
    searchPortal: 'Portal wyszukiwania',
    searchPortalTitle: 'Otwórz portal wyszukiwania IDC',
    worklist: 'Worklist:',
    exploreIdc: 'Przeglądaj NCI Imaging Data Commons:',
    viewers: 'Przeglądarki:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurs:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Bieżący kontekst:',
    none: 'brak',
    colStudy: 'Badanie',
    colModalities: 'Modalności',
    colFormat: 'Format',
    colSize: 'Rozmiar',
    language: 'Język',
    openStudy: 'Otwórz badanie',
    closeStudy: 'Zamknij otwarte badanie',
    closeContext: 'Zamknij bieżący kontekst',
    cannotOpen: 'Nie można otworzyć',
    saveWorklist: 'Zapisz',
    loadWorklist: 'Wczytaj',
    saveWorklistTitle: 'Zapisz moją worklistę jako JSON',
    loadWorklistTitle: 'Wczytaj moją worklistę z JSON',
  },
  conference: CONFERENCE_BY_LOCALE.pl,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'O tej aplikacji',
    aboutLinkLabel: 'O aplikacji',
    aboutLinkSuffix: '— licencje, podziękowania i znaki towarowe.',
    quickStartTitle: 'Szybki start:',
    quickStartBody:
      'Kliknij jeden z przycisków {{open}} po prawej, aby otworzyć CR i użyć ikony magicznej różdżki {{magicWand}}, aby uruchomić FleXray.',
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
    howto0Title: 'Jak połączyć Worklist z 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Zainstaluj rozszerzenie Slicer Hub Interface</li>
        <li>W <strong>3D Slicer</strong> otwórz modul <strong>Hub Interface</strong>, a następnie sekcję <strong>Image Display Client</strong>.</li>
        <li>Wybierz hub <strong>SLICER-HUB-CLOUD</strong> (ten sam hub w chmurze co ta worklist). Użyj <strong>SLICER-HUB</strong> tylko, gdy uruchamiasz lokalny hub na porcie 2018.</li>
        <li>Bez OIDC ustaw <strong>User</strong> na tego samego użytkownika co w workliście w chmurze (lewy górny róg), potem kliknij <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Po połączeniu przycisk przeglądarki <strong>SlicerDesktop</strong> się aktywuje, selektor zmienia się na «3D Slicer», a lista pokazuje zawartość bazy DICOM Slicera. Otwórz badanie — wczyta się w desktopowym Slicerze.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist z przeglądarkami (wybrany SlicerDesktop), zdalnym AI i listą badań" width="870" height="498" />
        </li>
        <li>Do konferencji / widoku na żywo w przeglądarce użyj <strong>SlicerLive</strong> i <strong>Konferencji</strong>, gdy inni śledzą zmiany węzłów oraz kamery/prezentacji.</li>
      </ol>
    `,
    howto1Title: 'Jak dołączyć do konferencji.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Otwórz worklistę i kliknij <strong>Konferencja</strong> w prawym górnym rogu.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Nagłówek SlicerLive z podświetloną konferencją" width="477" height="117" />
        </li>
        <li>Jeśli na Twojej instancji huba trwa konferencja, pojawi się na liście rozwijanej.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Dołącz do konferencji: lista aktywnych konferencji i przycisk Dołącz" width="322" height="175" />
        </li>
        <li>Jeśli konferencja jeszcze się nie zaczęła, poczekaj na zaproszenie do dołączenia:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Zaproszenie: Dołącz i śledź, Dołącz bez śledzenia lub Nie dołączaj" width="190" height="141" />
        </li>
        <li>Jeśli wybrałeś śledzenie, śledzisz badanie i prezentację hosta. Wyjdź w dowolnym momencie przez <strong>Opuść konferencję</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Nagłówek z Opuść konferencję, Twoim miejscem i śledzącym uczestnikiem" width="397" height="80" />
        </li>
        <li>Jeśli przestaniesz śledzić, możesz następnie wznowić śledzenie lub przejąć konferencję.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Nagłówek z Wznów śledzenie i Przejmij po zatrzymaniu śledzenia" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Jak utworzyć konferencję.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Otwórz worklistę i kliknij <strong>Konferencja</strong> w prawym górnym rogu.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Nagłówek SlicerLive z wyróżnioną Konferencją" width="477" height="117" />
        </li>
        <li>Jako gospodarz kliknij <strong>Konferencja</strong> (nagłówek worklisty lub pasek SlicerLive). Wybierz tytuł i utwórz — stajesz się miejscem <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Utwórz konferencję: pole tytułu i przycisk Utwórz konferencję" width="167" height="192" />
        </li>
        <li>Podczas prowadzenia zmiany w SlicerLive (układ, okno/poziom, widoczność segmentów, kamera, przewijanie/pan/zoom MPR, znikający atrament i podobne aktualizacje sceny) są rozsyłane do obserwujących.</li>
        <li>Możesz <strong>Zakończyć konferencję</strong> dla wszystkich. Podczas prowadzenia użyj klawisza <strong>B</strong>, aby włączyć/wyłączyć znikający atrament.</li>
        <li>Możesz przetestować konferencję na jednym pulpicie przyciskiem <strong>Open another user</strong>. Zobacz film demonstracyjny: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Jak wyszukiwać w IDC i dodawać do listy osobistej.',
    howto4Title: 'Jak wczytać lokalne badanie do przeglądarki.',
    howto5Title: 'Jak używać zdalnego AI',
    howto6Title: 'Jak wyeksportować segment do STL do druku 3D.',
    howto7Title: 'Jak używać Reporting / DICOM SR.',
  },
};
