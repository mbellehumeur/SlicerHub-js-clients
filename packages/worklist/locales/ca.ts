import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ca: LocaleBundle = {
  chrome: {
    conferencing: 'Conferència',
    open: 'Obrir',
    close: 'Tancar',
    searchPortal: 'Portal de cerca',
    searchPortalTitle: 'Obrir el portal de cerca IDC',
    worklist: 'Llista de treball',
    exploreIdc: 'Explorar el NCI Imaging Data Commons:',
    viewers: 'Visualitzadors:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curs:',
    currentContext: 'Context actual:',
    none: 'cap',
    colStudy: 'Estudi',
    colModalities: 'Modalitats',
    colFormat: 'Format',
    colSize: 'Mida',
    language: 'Idioma',
    openStudy: 'Obrir l’estudi',
    closeStudy: 'Tancar l’estudi obert',
    closeContext: 'Tancar el context actual',
    cannotOpen: 'No es pot obrir',
  },
  conference: CONFERENCE_BY_LOCALE.ca,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Quant a aquesta aplicació',
    aboutLinkLabel: 'Quant a',
    aboutLinkSuffix: '— llicències, agraïments i marques.',
    quickStartTitle: 'Inici ràpid:',
    quickStartBody:
      'Feu clic en un dels botons {{open}} a la dreta per veure un estudi en 3D i MPR.',
    introHtml: `
        <p>
          L’objectiu original d’aquesta aplicació és ser un actor «worklist client» en un sistema de codi obert
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          El sistema vol donar suport a la promoció, formació, desenvolupament i demostració de la interoperabilitat en aplicacions d’imatge mèdica.
        </p>
        <p>L’aplicació és, doncs, un component (<strong>WORKLIST_CLIENT actor</strong>) d’un sistema que inclou:</p>
        <ul class="wl-help-steps">
          <li>un hub WebSub (<strong>HUB actor</strong>) per a la comunicació entre aplicacions i usuaris</li>
          <li>visualitzadors d’imatge mèdica de codi obert (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>models d’inferència de codi obert (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>un exemple de reporting DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>l’<a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> i la BD DICOM de <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> com a arxius de només lectura (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>un proveïdor d’autenticació / identitat amb integració als endpoints OIDC del hub o autenticació anònima/mock integrada al hub</li>
        </ul>
        <p>
          L’aplicació també inclou funcions d’ensenyament d’anatomia i patologia independents del flux IHE:
        </p>
        <ul class="wl-help-steps">
          <li>crear, desar i pujar fitxers docents i cohorts</li>
          <li>conferència per a visualització i ensenyament col·laboratius</li>
          <li>un pinzell efímer per a anotacions temporals en conferència</li>
          <li>exportació STL per a impressió 3D</li>
        </ul>
    `,
    howto0Title: 'Com connectar SlicerWorklist a 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Instal·leu l’extensió Slicer Hub Interface</li>
        <li>A <strong>3D Slicer</strong>, obriu el mòdul <strong>Hub Interface</strong> i la secció <strong>Image Display Client</strong>.</li>
        <li>Trieu el hub <strong>SLICER-HUB-CLOUD</strong> (el mateix hub al núvol que aquesta llista). Useu <strong>SLICER-HUB</strong> només si executeu un hub local al port 2018.</li>
        <li>Sense OIDC, poseu <strong>User</strong> igual que l’usuari de la llista al núvol (a dalt a l’esquerra) i feu clic a <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD" width="585" height="127" />
        </li>
        <li>Un cop connectat, el botó <strong>SlicerDesktop</strong> s’activa, el selector passa a «3D Slicer» i la llista mostra la base DICOM de Slicer. Obriu un estudi — es carrega a Slicer d’escriptori.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist amb visualitzadors i llista d’estudis" width="870" height="498" />
        </li>
        <li>Per a conferència / vista en viu al navegador, useu <strong>SlicerLive</strong> i <strong>Conferència</strong> quan altres segueixin els canvis de nodes i càmera/presentació.</li>
      </ol>
    `,
    howto1Title: 'Com unir-se a una conferència.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Obriu la worklist i feu clic a <strong>Conferència</strong> a dalt a la dreta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Capçalera SlicerLive amb Conferència destacada" width="477" height="117" />
        </li>
        <li>Si hi ha una conferència en curs a la vostra instància del hub, es mostrarà en un desplegable.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Unir-se a una conferència: desplegable de conferències actives i botó Unir-se" width="322" height="175" />
        </li>
        <li>Si la conferència encara no ha començat, espereu la invitació per unir-vos:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitació a la conferència" width="190" height="141" />
        </li>
        <li>Si heu triat seguir, seguiu l’estudi i la presentació de l’amfitrió. Sortiu en qualsevol moment amb <strong>Sortir de la conferència</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Capçalera amb Sortir de la conferència, el vostre lloc i un participant que segueix" width="397" height="80" />
        </li>
        <li>Si deixeu de seguir, després podeu reprendre el seguiment o prendre el control de la conferència.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Capçalera amb Reprendre el seguiment i Prendre el control després d’aturar el seguiment" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Com crear una conferència.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Obriu la worklist i feu clic a <strong>Conferència</strong> a dalt a la dreta.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Capçalera SlicerLive amb Conferència destacada" width="477" height="117" />
        </li>
        <li>Com a amfitrió, feu clic a <strong>Conferència</strong> (capçalera o barra de SlicerLive). Trieu un títol i creeu-la — esdevindreu el lloc <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Crear conferència: camp de títol i botó Crear conferència" width="167" height="192" />
        </li>
        <li>Mentre liderau, els canvis a SlicerLive es propaguen als qui segueixen.</li>
        <li>Mentre liderau, useu la tecla <strong>B</strong> per activar/desactivar la tinta efímera.</li>
        <li>Podeu provar la conferència en un sol escriptori amb el botó <strong>Open another user</strong>. Vegeu el vídeo de demostració: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Com cercar a IDC i afegir a una llista personal.',
    howto4Title: 'Com carregar un estudi local a un visualitzador.',
    howto5Title: 'Com utilitzar la IA remota',
    howto6Title: 'Com exportar un segment a STL per a impressió 3D.',
    howto7Title: 'Com utilitzar Reporting / DICOM SR.',
  },
};
