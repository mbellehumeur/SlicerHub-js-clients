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
    worklist: 'Worklist',
    exploreIdc: 'Przeglądaj NCI Imaging Data Commons:',
    viewers: 'Przeglądarki:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurs:',
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
  },
  conference: CONFERENCE_BY_LOCALE.pl,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'O tej aplikacji',
    aboutLinkLabel: 'O aplikacji',
    aboutLinkSuffix: '— licencje, podziękowania i znaki towarowe.',
    quickStartTitle: 'Szybki start:',
    quickStartBody:
      'Kliknij jeden z przycisków {{open}} po prawej, aby wyświetlić badanie w 3D i MPR.',
    introHtml: `
        <p>
          Pierwotnym celem tej aplikacji jest bycie aktorem «worklist client» w open-source’owym systemie
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          System ma wspierać promocję, szkolenia, rozwój i demonstrację interoperacyjności w aplikacjach obrazowania medycznego.
        </p>
        <p>Aplikacja jest więc komponentem (<strong>WORKLIST_CLIENT actor</strong>) systemu, który obejmuje:</p>
        <ul class="wl-help-steps">
          <li>hub WebSub (<strong>HUB actor</strong>) do komunikacji między aplikacjami i użytkownikami</li>
          <li>open-source’owe przeglądarki obrazowania medycznego (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>open-source’owe modele wnioskowania (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>przykład reportingu DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> oraz bazę DICOM <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> jako archiwa tylko do odczytu (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>dostawcę uwierzytelniania / tożsamości z integracją z endpointami OIDC huba lub wbudowanym anonimowym/mock uwierzytelnianiem huba</li>
        </ul>
        <p>
          Aplikacja zawiera także funkcje edukacji anatomii i patologii niezależne od workflow IHE:
        </p>
        <ul class="wl-help-steps">
          <li>tworzenie, zapisywanie i przesyłanie plików dydaktycznych oraz kohort</li>
          <li>konferencję do wspólnego przeglądania i nauczania</li>
          <li>tymczasowy pędzel do krótkich adnotacji podczas konferencji</li>
          <li>eksport STL do druku 3D</li>
        </ul>
    `,
    howto0Title: 'Jak połączyć SlicerWorklist z 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist z przeglądarkami (wybrany SlicerDesktop), zdalnym AI i listą badań" width="870" height="498" />
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
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Nagłówek SlicerLive z podświetloną konferencją" width="477" height="117" />
        </li>
        <li>Jako host kliknij <strong>Konferencja</strong> (nagłówek worklisty lub pasek SlicerLive). Wybierz tytuł i utwórz — stajesz się miejscem <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Utwórz konferencję: pole tytułu i przycisk Utwórz konferencję" width="167" height="192" />
        </li>
        <li>Gdy prowadzisz, zmiany w SlicerLive (układ, okno/poziom, widoczność segmentów, kamera, MPR, znikający marker itd.) są wysyłane do śledzących.</li>
        <li>Gdy prowadzisz, użyj klawisza <strong>B</strong>, aby włączyć/wyłączyć znikający marker.</li>
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
