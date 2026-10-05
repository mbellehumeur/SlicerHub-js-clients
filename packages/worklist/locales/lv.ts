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
      'Noklikšķiniet uz vienas no {{open}} pogām labajā pusē, lai skatītu pētījumu 3D un MPR.',
    introHtml:
      `
        <p>
          Šīs lietotnes sākotnējais mērķis ir būt «worklist client» aktoram atvērtā pirmkoda 
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a> sistēmā. Sistēma atbalsta interoperabilitātes veicināšanu, apmācību, izstrādi un demonstrēšanu medicīniskās attēlošanas lietotnēs.
        </p>
        <p>Tādēļ lietotne ir sistēmas komponents (<strong>WORKLIST_CLIENT actor</strong>), kas ietver:</p>
        <ul class="wl-help-steps">
          <li>WebSub hubu (<strong>HUB actor</strong>) komunikācijai starp lietotnēm un lietotājiem</li>
          <li>atvērtā pirmkoda medicīniskās attēlošanas skatītājus (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>atvērtā pirmkoda secinājumu modeļus (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>DICOM SR atskaišu piemēru (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> un <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM datubāzi kā tikai lasāmus arhīvus (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>autentifikācijas / identitātes sniedzēju ar integrāciju hub OIDC galapunktos vai iebūvētu hub anonīmo/mock autentifikāciju</li>
        </ul>
        <p>
          Lietotne ietver arī anatomijas un patoloģijas mācību funkcijas, kas nav saistītas ar IHE darbplūsmu:
        </p>
        <ul class="wl-help-steps">
          <li>mācību failu un kohortu izveidi, saglabāšanu un augšupielādi</li>
          <li>konferenci kopīgai skatīšanai un mācībām</li>
          <li>pagaidu otu īsām piezīmēm konferences laikā</li>
          <li>STL eksportu 3D drukāšanai</li>
        </ul>
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
        <li>Atveriet worklist un noklikšķiniet uz <strong>Konference</strong> augšā pa labi.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive galvene ar izceltu konferenci" width="477" height="117" />
        </li>
        <li>Kā saimnieks noklikšķiniet <strong>Konference</strong> (worklist galvene vai SlicerLive josla). Izvēlieties nosaukumu un izveidojiet — jūs kļūstat par <strong>leading</strong> vietu.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Izveidot konferenci: nosaukuma lauks un poga Izveidot konferenci" width="167" height="192" />
        </li>
        <li>Vadot, SlicerLive izmaiņas (izkārtojums, logs/līmenis, segmentu redzamība, kamera, MPR, pagaidu marķieris u.c.) tiek nosūtītas sekotājiem.</li>
        <li>Vadot, izmantojiet taustiņu <strong>B</strong>, lai ieslēgtu/izslēgtu pagaidu marķieri.</li>
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
