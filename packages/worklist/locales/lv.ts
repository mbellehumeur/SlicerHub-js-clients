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
    worklist: 'Worklist',
    exploreIdc: 'Izpētiet NCI Imaging Data Commons:',
    viewers: 'Skatītāji:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurss:',
    anatomicalPlanes: 'Anatomical Planes',
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
  },
  conference: CONFERENCE_BY_LOCALE.lv,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Par šo lietotni',
    aboutLinkLabel: 'Par',
    aboutLinkSuffix: '— licences, pateicības un preču zīmes.',
    quickStartTitle: 'Ātrais sākums:',
    quickStartBody:
      'Noklikšķiniet uz vienas no {{open}} pogām labajā pusē, lai atvērtu CR un izmantotu burvju nūjiņas ikonu {{magicWand}}, lai palaistu FleXray.',
    introHtml: `
        <p>
          Šīs lietotnes sākotnējais mērķis ir būt «worklist client» aktoram atvērtā pirmkoda
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          un
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>
          sistēmā, kas atrodas 3D Slicer paplašinājumā ar nosaukumu
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Slicer Hub nodrošina ziņojumapmaiņas infrastruktūru un tiecas veicināt, apmācīt, attīstīt un
          demonstrēt savietojamību medicīniskās attēlveidošanas lietotnēs.
        </p>
        <p>Tādēļ lietotne ir komponents (<strong>WORKLIST_CLIENT actor</strong>) sistēmā, kas ietver:</p>
        <ul class="wl-help-steps">
          <li>WebSub centrmezglu (<strong>HUB actor</strong>) saziņai starp lietotnēm un lietotājiem</li>
          <li>atvērtā pirmkoda medicīniskās attēlveidošanas skatītājus (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>atvērtā pirmkoda medicīniskās attēlveidošanas secinājumu modeļus (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>DICOM SR atskaišu piemēru (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> un <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM DB kā tikai lasāmus arhīvus (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>autentifikācijas / identitātes nodrošinātāju ar integrāciju hub OIDC galapunktos vai iebūvētu anonīmu/mock autentifikāciju</li>
        </ul>
        <p>
          Paplašinājums ietver arī izglītības funkcijas, kas ir neatkarīgas no IHE
          Integrated Reporting darba plūsmas:
        </p>
        <ul class="wl-help-steps">
          <li>mācību failu un kohortu izveide, saglabāšana un augšupielāde nodarbību sagatavošanai</li>
          <li>konference kopīgai skatīšanai un mācīšanai</li>
          <li>izzūdoša otas rīks īslaicīgām anotācijām konferences laikā</li>
          <li>STL eksportēšana 3D drukai</li>
        </ul>
        <p>
          Tiek nodrošinātas arī pētniecības un 3D Slicer funkcijas, neatkarīgas no IHE:
        </p>
        <ul class="wl-help-steps">
          <li>failu pārsūtīšana starp lietotnēm</li>
          <li>medicīniskās realitātes ainas un komunikācija</li>
          <li>Slicer Qt Image Display klients</li>
          <li>piekļuve Slicer DICOM DB</li>
        </ul>
        <p>
          Failu pārsūtīšana ļauj secinājumu serveriem nosūtīt rezultātus tieši skatītājiem
          bez iepriekšējas saglabāšanas PACS. Tā atbalsta arī pētniecības formātus, piemēram, NIfTI, NRRD un Zarr.
        </p>
    `,
    howto0Title: 'Kā savienot SlicerWorklist ar 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist ar skatītājiem (izvēlēts SlicerDesktop), attālo AI un pētījumu sarakstu" width="870" height="498" />
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
