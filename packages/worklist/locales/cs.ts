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
    worklist: 'Worklist',
    exploreIdc: 'Prozkoumat NCI Imaging Data Commons:',
    viewers: 'Prohlížeče:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurz:',
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
  },
  conference: CONFERENCE_BY_LOCALE.cs,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'O této aplikaci',
    aboutLinkLabel: 'O aplikaci',
    aboutLinkSuffix: '— licence, poděkování a ochranné známky.',
    quickStartTitle: 'Rychlý start:',
    quickStartBody:
      'Klikněte na jedno z tlačítek {{open}} vpravo pro zobrazení studie ve 3D a MPR.',
    introHtml: `
        <p>
          Původním účelem této aplikace je být aktérem «worklist client» v open-source systému
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          Systém má podporovat propagaci, školení, vývoj a demonstraci interoperability v aplikacích lékařského zobrazování.
        </p>
        <p>Aplikace je proto komponentou (<strong>WORKLIST_CLIENT actor</strong>) systému, který zahrnuje:</p>
        <ul class="wl-help-steps">
          <li>WebSub hub (<strong>HUB actor</strong>) pro komunikaci mezi aplikacemi a uživateli</li>
          <li>open-source prohlížeče lékařského zobrazování (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>open-source inferenční modely (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>příklad reportingu DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> a DICOM DB <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> jako archivy pouze pro čtení (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>poskytovatele autentizace / identity s integrací na OIDC endpointy hubu nebo vestavěnou anonymní/mock autentizaci hubu</li>
        </ul>
        <p>
          Aplikace také obsahuje funkce pro výuku anatomie a patologie nezávislé na workflow IHE:
        </p>
        <ul class="wl-help-steps">
          <li>vytváření, ukládání a nahrávání výukových souborů a kohort</li>
          <li>konference pro společné prohlížení a výuku</li>
          <li>dočasný štětec pro krátké anotace během konference</li>
          <li>export STL pro 3D tisk</li>
        </ul>
    `,
    howto0Title: 'Jak připojit SlicerWorklist k 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist s prohlížeči (vybrán SlicerDesktop), vzdálenou AI a seznamem studií" width="870" height="498" />
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
        <li>Otevřete worklist a klikněte vpravo nahoře na <strong>Konference</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Záhlaví SlicerLive se zvýrazněnou konferencí" width="477" height="117" />
        </li>
        <li>Jako hostitel klikněte na <strong>Konference</strong> (záhlaví worklistu nebo lišta SlicerLive). Vyberte název a vytvořte — stanete se místem <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Vytvořit konferenci: pole názvu a tlačítko Vytvořit konferenci" width="167" height="192" />
        </li>
        <li>Při vedení se změny ve SlicerLive (rozvržení, okno/úroveň, viditelnost segmentů, kamera, MPR, dočasný marker atd.) šíří ke sledujícím.</li>
        <li>Při vedení použijte klávesu <strong>B</strong> k zapnutí/vypnutí dočasného markeru.</li>
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
