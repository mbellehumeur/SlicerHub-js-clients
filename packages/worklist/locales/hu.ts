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
    worklist: 'Worklist',
    exploreIdc: 'Fedezze fel az NCI Imaging Data Commons-ot:',
    viewers: 'Megjelenítők:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurzus:',
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
  },
  conference: CONFERENCE_BY_LOCALE.hu,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Az alkalmazásról',
    aboutLinkLabel: 'Névjegy',
    aboutLinkSuffix: '— licencek, köszönetnyilvánítások és védjegyek.',
    quickStartTitle: 'Gyors indítás:',
    quickStartBody:
      'Kattintson jobbra az egyik {{open}} gombra egy vizsgálat 3D és MPR megtekintéséhez.',
    introHtml:
      `
        <p>
          Az alkalmazás eredeti célja, hogy «worklist client» szereplő legyen egy nyílt forráskódú 
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a> rendszerben. A rendszer célja az interoperabilitás előmozdítása, képzése, fejlesztése és bemutatása orvosi képalkotó alkalmazásokban.
        </p>
        <p>Az alkalmazás ezért egy rendszer komponense (<strong>WORKLIST_CLIENT actor</strong>), amely a következőket tartalmazza:</p>
        <ul class="wl-help-steps">
          <li>WebSub hub (<strong>HUB actor</strong>) az alkalmazások és felhasználók közötti kommunikációhoz</li>
          <li>nyílt forráskódú orvosi képalkotó megjelenítők (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>nyílt forráskódú következtetési modellek (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>DICOM SR jelentéskészítési példa (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>az <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> és a <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM adatbázisa csak olvasható archívumként (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>egy hitelesítési / identitásszolgáltató a hub OIDC végpontjaival való integrációval vagy a hub beépített anonim/mock hitelesítésével</li>
        </ul>
        <p>
          Az alkalmazás anatómiai és patológiai oktatási funkciókat is tartalmaz, függetlenül az IHE munkafolyamattól:
        </p>
        <ul class="wl-help-steps">
          <li>tananyagok és kohorszok létrehozása, mentése és feltöltése</li>
          <li>konferencia közös megtekintéshez és oktatáshoz</li>
          <li>ideiglenes ecset rövid megjegyzésekhez konferencia közben</li>
          <li>STL export 3D nyomtatáshoz</li>
        </ul>
    `,
    howto0Title: 'A SlicerWorklist csatlakoztatása 3D Slicerhez.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist megjelenítőkkel (SlicerDesktop kiválasztva), távoli AI-val és vizsgálatlistával" width="870" height="498" />
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
        <li>Nyissa meg a worklistet, és kattintson a jobb felső <strong>Konferencia</strong> gombra.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive fejléc kiemelt konferenciával" width="477" height="117" />
        </li>
        <li>Hoszként kattintson a <strong>Konferencia</strong> gombra (worklist fejléc vagy SlicerLive sáv). Válasszon címet és hozza létre — Ön lesz a <strong>leading</strong> hely.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Konferencia létrehozása: cím mező és Létrehozás gomb" width="167" height="192" />
        </li>
        <li>Vezetés közben a SlicerLive-ban végzett módosítások (elrendezés, ablak/szint, szegmens láthatóság, kamera, MPR, ideiglenes marker stb.) eljutnak a követőkhöz.</li>
        <li>Vezetés közben a <strong>B</strong> billentyűvel kapcsolhatja ki/be az ideiglenes markert.</li>
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
