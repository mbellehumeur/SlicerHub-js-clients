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
    worklist: 'Worklist',
    exploreIdc: 'Naršykite NCI Imaging Data Commons:',
    viewers: 'Peržiūros programos:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kursas:',
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
  },
  conference: CONFERENCE_BY_LOCALE.lt,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Apie šią programą',
    aboutLinkLabel: 'Apie',
    aboutLinkSuffix: '— licencijos, padėkos ir prekių ženklai.',
    quickStartTitle: 'Greita pradžia:',
    quickStartBody:
      'Dešinėje spustelėkite vieną mygtukų {{open}}, kad peržiūrėtumėte tyrimą 3D ir MPR.',
    introHtml:
      `
        <p>
          Pradinė šios programos paskirtis – būti «worklist client» aktoriumi atvirojo kodo 
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a> sistemoje. Sistema skirta skatinti, mokyti, kurti ir demonstruoti medicininio vaizdavimo programų sąveiką.
        </p>
        <p>Todėl programa yra sistemos komponentas (<strong>WORKLIST_CLIENT actor</strong>), apimantis:</p>
        <ul class="wl-help-steps">
          <li>WebSub hubą (<strong>HUB actor</strong>) komunikacijai tarp programų ir naudotojų</li>
          <li>atvirojo kodo medicininio vaizdavimo peržiūros programas (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>atvirojo kodo inferencijos modelius (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>DICOM SR ataskaitų pavyzdį (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> ir <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM DB kaip tik skaitymo archyvus (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>autentifikavimo / tapatybės teikėją su integracija į hub OIDC galinius taškus arba įmontuotą hub anoniminę/mock autentifikaciją</li>
        </ul>
        <p>
          Programa taip pat turi anatomijos ir patologijos mokymo funkcijas, nepriklausomas nuo IHE darbo eigos:
        </p>
        <ul class="wl-help-steps">
          <li>mokomųjų failų ir kohortų kūrimą, saugojimą ir įkėlimą</li>
          <li>konferenciją bendram peržiūrėjimui ir mokymui</li>
          <li>laikiną teptuką trumpoms pastaboms konferencijos metu</li>
          <li>STL eksportą 3D spausdinimui</li>
        </ul>
    `,
    howto0Title: 'Kaip prijungti SlicerWorklist prie 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist su peržiūros programomis (pasirinktas SlicerDesktop), nuotoliniu AI ir tyrimų sąrašu" width="870" height="498" />
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
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive antraštė su paryškinta konferencija" width="477" height="117" />
        </li>
        <li>Kaip šeimininkas spustelėkite <strong>Konferencija</strong> (worklist antraštė arba SlicerLive juosta). Pasirinkite pavadinimą ir sukurkite — tampate <strong>leading</strong> vieta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Sukurti konferenciją: pavadinimo laukas ir mygtukas Sukurti" width="167" height="192" />
        </li>
        <li>Vadovaujant, SlicerLive pakeitimai (išdėstymas, langas/lygis, segmentų matomumas, kamera, MPR, laikinas markeris ir pan.) siunčiami sekėjams.</li>
        <li>Vadovaujant naudokite klavišą <strong>B</strong>, kad įjungtumėte/išjungtumėte laikiną markerį.</li>
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
