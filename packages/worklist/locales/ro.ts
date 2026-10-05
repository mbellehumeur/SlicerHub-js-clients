import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const ro: LocaleBundle = {
  chrome: {
    conferencing: 'Conferință',
    open: 'Deschide',
    close: 'Închide',
    searchPortal: 'Portal de căutare',
    searchPortalTitle: 'Deschide portalul de căutare IDC',
    worklist: 'Worklist',
    exploreIdc: 'Explorați NCI Imaging Data Commons:',
    viewers: 'Vizualizatoare:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Curs:',
    currentContext: 'Context curent:',
    none: 'niciunul',
    colStudy: 'Studiu',
    colModalities: 'Modalități',
    colFormat: 'Format',
    colSize: 'Dimensiune',
    language: 'Limbă',
    openStudy: 'Deschide studiul',
    closeStudy: 'Închide studiul deschis',
    closeContext: 'Închide contextul curent',
    cannotOpen: 'Nu se poate deschide',
  },
  conference: CONFERENCE_BY_LOCALE.ro,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Despre această aplicație',
    aboutLinkLabel: 'Despre',
    aboutLinkSuffix: '— licențe, mulțumiri și mărci comerciale.',
    quickStartTitle: 'Start rapid:',
    quickStartBody:
      'Faceți clic pe unul dintre butoanele {{open}} din dreapta pentru a vizualiza un studiu în 3D și MPR.',
    introHtml:
      `
        <p>
          Scopul inițial al acestei aplicații este de a fi un actor «worklist client» într-un sistem open-source 
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>. Sistemul sprijină promovarea, instruirea, dezvoltarea și demonstrarea interoperabilității în aplicațiile de imagistică medicală.
        </p>
        <p>Aplicația este deci o componentă (<strong>WORKLIST_CLIENT actor</strong>) a unui sistem care include:</p>
        <ul class="wl-help-steps">
          <li>un hub WebSub (<strong>HUB actor</strong>) pentru comunicarea între aplicații și utilizatori</li>
          <li>vizualizatoare open-source de imagistică medicală (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>modele open-source de inferență (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>un exemplu de raportare DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li><a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> și baza DICOM <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> ca arhive doar în citire (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>un furnizor de autentificare / identitate cu integrare la endpoint-urile OIDC ale hub-ului sau autentificarea anonimă/mock încorporată în hub</li>
        </ul>
        <p>
          Aplicația include și funcții de educație în anatomie și patologie, independente de fluxul IHE:
        </p>
        <ul class="wl-help-steps">
          <li>crearea, salvarea și încărcarea fișierelor didactice și a cohortelor</li>
          <li>conferință pentru vizualizare colaborativă și predare</li>
          <li>pensulă temporară pentru adnotări scurte în timpul conferinței</li>
          <li>export STL pentru imprimare 3D</li>
        </ul>
    `,
    howto0Title: 'Cum se conectează SlicerWorklist la 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Instalați extensia Slicer Hub Interface</li>
        <li>În <strong>3D Slicer</strong>, deschideți modulul <strong>Hub Interface</strong>, apoi secțiunea <strong>Image Display Client</strong>.</li>
        <li>Alegeți hub-ul <strong>SLICER-HUB-CLOUD</strong> (același hub cloud ca această worklist). Folosiți <strong>SLICER-HUB</strong> doar când rulați un hub local pe portul 2018.</li>
        <li>Fără OIDC, setați <strong>User</strong> la același utilizator ca worklist-ul cloud (stânga sus), apoi faceți clic pe <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>După conectare, butonul vizualizator <strong>SlicerDesktop</strong> se activează, selectorul trece la «3D Slicer», iar lista afișează conținutul bazei DICOM Slicer. Deschideți un studiu — se încarcă în Slicer desktop.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist cu vizualizatoare (SlicerDesktop selectat), AI la distanță și listă de studii" width="870" height="498" />
        </li>
        <li>Pentru conferință în browser / vizualizare live, folosiți <strong>SlicerLive</strong> și <strong>Conferință</strong> când alții urmăresc modificările de nod și cameră/prezentare.</li>
      </ol>
    `,
    howto1Title: 'Cum se alătură unei conferințe.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Deschideți worklist și faceți clic pe <strong>Conferință</strong> în dreapta sus.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Antet SlicerLive cu conferința evidențiată" width="477" height="117" />
        </li>
        <li>Dacă pe instanța hub există o conferință în curs, va apărea într-o listă derulantă.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Alăturare la conferință: lista conferințelor active și butonul Alătură-te" width="322" height="175" />
        </li>
        <li>Dacă conferința nu a început încă, așteptați invitația de alăturare:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitație: Alăturare și urmărire, Alăturare fără urmărire sau Nu mă alătur" width="190" height="141" />
        </li>
        <li>Dacă ați ales urmărirea, urmăriți studiul și prezentarea gazdei. Ieșiți oricând cu <strong>Părăsește conferința</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Antet cu Părăsește conferința, locul dvs. și un participant care urmează" width="397" height="80" />
        </li>
        <li>Dacă opriți urmărirea, puteți apoi relua urmărirea sau prelua conferința.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Antet cu Reluați urmărirea și Preiați după oprirea urmăririi" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Cum se creează o conferință.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Deschideți worklist și faceți clic pe <strong>Conferință</strong> în dreapta sus.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Antet SlicerLive cu conferința evidențiată" width="477" height="117" />
        </li>
        <li>Ca gazdă, faceți clic pe <strong>Conferință</strong> (antet worklist sau bara SlicerLive). Alegeți un titlu și creați — deveniți locul <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Creează conferință: câmp titlu și buton Creează conferință" width="167" height="192" />
        </li>
        <li>În timp ce conduceți, modificările din SlicerLive (layout, fereastră/nivel, vizibilitate segmente, cameră, MPR, marker temporar etc.) sunt trimise urmăritorilor.</li>
        <li>În timp ce conduceți, folosiți tasta <strong>B</strong> pentru marker temporar pornit/oprit.</li>
        <li>Puteți testa conferința pe un singur desktop cu butonul <strong>Open another user</strong>. Vedeți videoclipul demo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Cum se caută în IDC și se adaugă la o listă personală.',
    howto4Title: 'Cum se încarcă un studiu local într-un vizualizator.',
    howto5Title: 'Cum se utilizează AI la distanță',
    howto6Title: 'Cum se exportă un segment în STL pentru imprimare 3D.',
    howto7Title: 'Cum se utilizează Reporting / DICOM SR.',
  },
};
