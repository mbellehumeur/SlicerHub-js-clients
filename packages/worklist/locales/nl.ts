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
    worklist: 'Worklist',
    exploreIdc: 'NCI Imaging Data Commons verkennen:',
    viewers: 'Viewers:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Cursus:',
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
  },
  conference: CONFERENCE_BY_LOCALE.nl,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Over deze toepassing',
    aboutLinkLabel: 'Over',
    aboutLinkSuffix: '— licenties, dankbetuigingen en handelsmerken.',
    quickStartTitle: 'Snel starten:',
    quickStartBody:
      'Klik rechts op een van de knoppen {{open}} om een CR te openen en het toverstafpictogram {{magicWand}} te gebruiken om FleXray uit te voeren.',
    introHtml: `
        <p>
          Het oorspronkelijke doel van deze toepassing is om een «worklist client»-actor te zijn in een open-source
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>-
          en
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>-systeem
          dat zich bevindt in een 3D Slicer-extensie genaamd
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Slicer Hub biedt de messaging-infrastructuur en beoogt interoperabiliteit in medische beeldvormingstoepassingen
          te bevorderen, te trainen, te ontwikkelen en te demonstreren.
        </p>
        <p>De toepassing is daarom een component (<strong>WORKLIST_CLIENT actor</strong>) van een systeem dat omvat:</p>
        <ul class="wl-help-steps">
          <li>een WebSub-hub (<strong>HUB actor</strong>) voor communicatie tussen toepassingen en gebruikers</li>
          <li>open-source viewers voor medische beeldvorming (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>open-source inferentiemodellen voor medische beeldvorming (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>een DICOM SR-reportingvoorbeeld (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>de <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> en de DICOM-DB van <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> als alleen-lezen archieven (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>een authenticatie- / identiteitsprovider met integratie naar de OIDC-eindpunten van de hub of ingebouwde anonieme/mock-authenticatie van de hub</li>
        </ul>
        <p>
          Het systeem bevat ook educatieve functies die onafhankelijk zijn van de IHE
          Integrated Reporting-workflow:
        </p>
        <ul class="wl-help-steps">
          <li>aanmaken, opslaan en uploaden van lesbestanden en cohorten voor lesvoorbereiding</li>
          <li>conferencing voor gezamenlijk bekijken en onderwijzen</li>
          <li>een tijdelijke penseeltool voor tijdelijke annotaties tijdens conferencing</li>
          <li>STL-export voor 3D-printen</li>
        </ul>
        <p>
          Ook worden onderzoeks- en 3D Slicer-functionaliteiten geleverd, eveneens onafhankelijk van IHE:
        </p>
        <ul class="wl-help-steps">
          <li>bestandsoverdracht tussen toepassingen</li>
          <li>medische-realiteitsscènes en communicatie</li>
          <li>Slicer Qt Image Display-client</li>
          <li>toegang tot de Slicer-DICOM-DB</li>
        </ul>
        <p>
          Bestandsoverdracht stelt inferentieservers in staat resultaten rechtstreeks naar viewers te sturen
          zonder ze eerst in een PACS op te slaan. Het ondersteunt ook onderzoeksformaten zoals NIfTI, NRRD en Zarr.
        </p>
    `,
    howto0Title: 'Hoe SlicerWorklist te verbinden met 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist met viewers (SlicerDesktop geselecteerd), externe AI en studielijst" width="870" height="498" />
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
