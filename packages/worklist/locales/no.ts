import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const no: LocaleBundle = {
  chrome: {
    conferencing: 'Konferanse',
    open: 'Åpne',
    close: 'Lukk',
    searchPortal: 'Søkeportal',
    searchPortalTitle: 'Åpne IDC-søkeportalen',
    worklist: 'Worklist',
    exploreIdc: 'Utforsk NCI Imaging Data Commons:',
    viewers: 'Visere:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurs:',
    currentContext: 'Gjeldende kontekst:',
    none: 'ingen',
    colStudy: 'Studie',
    colModalities: 'Modaliteter',
    colFormat: 'Format',
    colSize: 'Størrelse',
    language: 'Språk',
    openStudy: 'Åpne studie',
    closeStudy: 'Lukk åpen studie',
    closeContext: 'Lukk gjeldende kontekst',
    cannotOpen: 'Kan ikke åpne',
  },
  conference: CONFERENCE_BY_LOCALE.no,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Om denne applikasjonen',
    aboutLinkLabel: 'Om',
    aboutLinkSuffix: '— lisenser, takk og varemerker.',
    quickStartTitle: 'Hurtigstart:',
    quickStartBody:
      'Klikk en av {{open}}-knappene til høyre for å vise en studie i 3D og MPR.',
    introHtml:
      `
        <p>
          Det opprinnelige formålet med denne applikasjonen er å være en «worklist client»-aktør i et åpen kildekode-
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>-system. Systemet skal støtte promotering, opplæring, utvikling og demonstrasjon av interoperabilitet i medisinske bildediagnostikk-applikasjoner.
        </p>
        <p>Applikasjonen er derfor én komponent (<strong>WORKLIST_CLIENT actor</strong>) i et system som omfatter:</p>
        <ul class="wl-help-steps">
          <li>en WebSub-hub (<strong>HUB actor</strong>) for kommunikasjon mellom applikasjoner og brukere</li>
          <li>åpen kildekode-visere for medisinsk bildediagnostikk (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>åpen kildekode-modeller for inferens (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>et DICOM SR-rapporteringseksempel (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> og <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> DICOM-databasen som skrivebeskyttede arkiver (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>en autentiserings- / identitetsleverandør med integrasjon til hubens OIDC-endepunkter eller innebygd anonym/mock-autentisering i huben</li>
        </ul>
        <p>
          Applikasjonen har også funksjoner for anatomi- og patologiundervisning, uavhengig av IHE-arbeidsflyten:
        </p>
        <ul class="wl-help-steps">
          <li>oppretting, lagring og opplasting av undervisningsfiler og kohorter</li>
          <li>konferanse for felles visning og undervisning</li>
          <li>midlertidig pensel for korte merknader under konferansen</li>
          <li>STL-eksport for 3D-utskrift</li>
        </ul>
    `,
    howto0Title: 'Slik kobler du SlicerWorklist til 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Installer Slicer Hub Interface-utvidelsen</li>
        <li>I <strong>3D Slicer</strong>, åpne modulen <strong>Hub Interface</strong>, deretter seksjonen <strong>Image Display Client</strong>.</li>
        <li>Velg hub <strong>SLICER-HUB-CLOUD</strong> (samme skyhub som denne worklisten). Bruk <strong>SLICER-HUB</strong> bare når du kjører en lokal hub på port 2018.</li>
        <li>Uten OIDC, sett <strong>User</strong> til samme bruker som sky-worklisten (øverst til venstre), og klikk <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Når du er tilkoblet, lyser worklist-knappen <strong>SlicerDesktop</strong> opp, velgeren endres til «3D Slicer», og listen viser innholdet i Slicer DICOM-databasen. Åpne en studie — den lastes i desktop Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist med visere (SlicerDesktop valgt), ekstern AI og studieliste" width="870" height="498" />
        </li>
        <li>For nettleserkonferanse / direktevisning, bruk <strong>SlicerLive</strong> og <strong>Konferanse</strong> når andre følger node- og kamera-/presentasjonsendringene dine.</li>
      </ol>
    `,
    howto1Title: 'Slik blir du med i en konferanse.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Åpne worklisten og klikk <strong>Konferanse</strong> øverst til høyre.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-header med konferanse uthevet" width="477" height="117" />
        </li>
        <li>Hvis en konferanse pågår på hub-instansen din, vises den i en nedtrekksliste.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Bli med i konferanse: nedtrekksliste for aktive konferanser og knappen Bli med" width="322" height="175" />
        </li>
        <li>Hvis konferansen ikke har startet, vent på invitasjonen om å bli med:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Konferanseinvitasjon: Bli med og følge, Bli med uten å følge, eller Ikke bli med" width="190" height="141" />
        </li>
        <li>Hvis du valgte å følge, følger du vertens studie og presentasjon. Forlat når som helst med <strong>Forlat konferanse</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Header med Forlat konferanse, din plass og en følgende deltaker" width="397" height="80" />
        </li>
        <li>Hvis du stopper å følge, kan du deretter gjenoppta følging eller ta over konferansen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Header med Fortsett å følge og Ta over etter å ha stoppet følging" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Slik oppretter du en konferanse.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Åpne worklisten og klikk <strong>Konferanse</strong> øverst til høyre.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-header med konferanse uthevet" width="477" height="117" />
        </li>
        <li>Som vert, klikk <strong>Konferanse</strong> (worklist-header eller SlicerLive-linjen). Velg tittel og opprett — du blir <strong>leading</strong>-plassen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Opprett konferanse: tittelfelt og knappen Opprett konferanse" width="167" height="192" />
        </li>
        <li>Mens du leder, sendes endringer i SlicerLive (layout, vindu/nivå, segment-synlighet, kamera, MPR, midlertidig markør osv.) til følgere.</li>
        <li>Mens du leder, bruk tasten <strong>B</strong> for å slå midlertidig markør av/på.</li>
        <li>Du kan teste konferanse på én desktop med knappen <strong>Open another user</strong>. Se demovideoen: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Slik søker du i IDC og legger til i en personlig liste.',
    howto4Title: 'Slik laster du en lokal studie til en viser.',
    howto5Title: 'Slik bruker du ekstern AI',
    howto6Title: 'Slik eksporterer du et segment til STL for 3D-utskrift.',
    howto7Title: 'Slik bruker du Reporting / DICOM SR.',
  },
};
