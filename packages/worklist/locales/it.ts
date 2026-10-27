import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const it: LocaleBundle = {
  chrome: {
    conferencing: 'Conferenza',
    open: 'Apri',
    close: 'Chiudi',
    searchPortal: 'Portale di ricerca',
    searchPortalTitle: 'Apri il portale di ricerca IDC',
    worklist: 'Worklist:',
    exploreIdc: 'Esplora l’NCI Imaging Data Commons:',
    viewers: 'Viewer:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Corso:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Contesto attuale:',
    none: 'nessuno',
    colStudy: 'Studio',
    colModalities: 'Modalità',
    colFormat: 'Formato',
    colSize: 'Dimensione',
    language: 'Lingua',
    openStudy: 'Apri studio',
    closeStudy: 'Chiudi lo studio aperto',
    closeContext: 'Chiudi il contesto attuale',
    cannotOpen: 'Impossibile aprire',
    saveWorklist: 'Salva',
    loadWorklist: 'Carica',
    saveWorklistTitle: 'Salva la mia worklist come JSON',
    loadWorklistTitle: 'Carica la mia worklist da JSON',
  },
  conference: CONFERENCE_BY_LOCALE.it,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Informazioni su questa applicazione',
    aboutLinkLabel: 'Informazioni',
    aboutLinkSuffix: '— licenze, riconoscimenti e marchi.',
    quickStartTitle: 'Avvio rapido:',
    quickStartBody:
      'Fai clic su uno dei pulsanti {{open}} a destra per aprire un CR e usare l’icona bacchetta magica {{magicWand}} per eseguire FleXray.',
    introHtml: `
        <p>
          Lo scopo originale di questa applicazione è essere un attore «worklist client» in un sistema open source
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          e
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>
          che risiede in un’estensione 3D Slicer chiamata
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Slicer Hub fornisce l’infrastruttura di messaggistica e mira a promuovere, formare, sviluppare e
          dimostrare l’interoperabilità nelle applicazioni di imaging medico.
        </p>
        <p>L’applicazione è quindi un componente (<strong>WORKLIST_CLIENT actor</strong>) di un sistema che include:</p>
        <ul class="wl-help-steps">
          <li>un hub WebSub (<strong>HUB actor</strong>) per la comunicazione tra applicazioni e utenti</li>
          <li>viewer di imaging medico open source (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>modelli di inferenza di imaging medico open source (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>un esempio di reporting DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>l’<a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> e il DB DICOM di <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> come archivi in sola lettura (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>un provider di autenticazione / identità con integrazione agli endpoint OIDC dell’hub o autenticazione anonima/mock integrata nell’hub</li>
        </ul>
        <p>
          L’estensione include anche funzioni educative indipendenti dal workflow IHE
          Integrated Reporting:
        </p>
        <ul class="wl-help-steps">
          <li>creazione, salvataggio e caricamento di file didattici e coorti per la preparazione delle lezioni</li>
          <li>conferenza per visualizzazione e insegnamento collaborativi</li>
          <li>uno strumento pennello effimero per annotazioni temporanee in conferenza</li>
          <li>esportazione STL per la stampa 3D</li>
        </ul>
        <p>
          Sono fornite anche funzionalità di ricerca e di 3D Slicer, indipendenti da IHE:
        </p>
        <ul class="wl-help-steps">
          <li>trasferimento file tra applicazioni</li>
          <li>scene e comunicazioni di realtà medica</li>
          <li>client Slicer Qt Image Display</li>
          <li>accesso al DB DICOM di Slicer</li>
        </ul>
        <p>
          Il trasferimento file consente ai server di inferenza di inviare i risultati direttamente ai viewer
          senza salvarli prima in un PACS. Supporta anche formati di ricerca come NIfTI, NRRD e Zarr.
        </p>
    `,
    howto0Title: 'Come collegare Worklist a 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Installa l’estensione Slicer Hub Interface</li>
        <li>In <strong>3D Slicer</strong>, apri il modulo <strong>Hub Interface</strong> e la sezione <strong>Image Display Client</strong>.</li>
        <li>Scegli l’hub <strong>SLICER-HUB-CLOUD</strong> (lo stesso hub cloud di questa worklist). Usa <strong>SLICER-HUB</strong> solo se esegui un hub locale sulla porta 2018.</li>
        <li>Senza OIDC, imposta <strong>User</strong> sullo stesso utente della worklist cloud (in alto a sinistra), poi fai clic su <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Una volta connesso, il pulsante viewer <strong>SlicerDesktop</strong> si attiva, il selettore passa a «3D Slicer» e la lista mostra il contenuto del database DICOM di Slicer. Apri uno studio — viene caricato in Slicer desktop.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist con viewer (SlicerDesktop selezionato), IA remota e elenco studi" width="870" height="498" />
        </li>
        <li>Per la conferenza / vista live nel browser, usa <strong>SlicerLive</strong> e <strong>Conferenza</strong> quando altri seguono le modifiche ai nodi e alla telecamera/presentazione.</li>
      </ol>
    `,
    howto1Title: 'Come unirsi a una conferenza.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Apri la worklist e fai clic su <strong>Conferenza</strong> in alto a destra.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Intestazione SlicerLive con Conferenza evidenziata" width="477" height="117" />
        </li>
        <li>Se è in corso una conferenza sulla tua istanza hub, viene mostrata in un menu a discesa.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Partecipa a una conferenza: menu conferenze attive e pulsante Partecipa" width="322" height="175" />
        </li>
        <li>Se la conferenza non è ancora iniziata, attendi l’invito a partecipare:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invito: Partecipa e segui, Partecipa senza seguire, o Non partecipare" width="190" height="141" />
        </li>
        <li>Se hai scelto di seguire, segui lo studio e la presentazione dell’host. Esci in qualsiasi momento con <strong>Lascia conferenza</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Intestazione con Lascia conferenza, il tuo luogo e un partecipante che segue" width="397" height="80" />
        </li>
        <li>Se interrompi il follow, puoi poi riprendere a seguire o prendere il controllo della conferenza.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Intestazione con Riprendi a seguire e Prendi il controllo dopo aver interrotto il follow" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Come creare una conferenza.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Apri la worklist e fai clic su <strong>Conferenza</strong> in alto a destra.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Intestazione SlicerLive con Conferenza evidenziata" width="477" height="117" />
        </li>
        <li>Come host, fai clic su <strong>Conferenza</strong> (intestazione worklist o barra SlicerLive). Scegli un titolo e creala — diventi il luogo <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Crea conferenza: campo titolo e pulsante Crea conferenza" width="167" height="192" />
        </li>
        <li>Mentre sei leading, le modifiche in SlicerLive (layout, finestra/livello, visibilità segmenti, fotocamera, scroll/pan/zoom MPR, inchiostro effimero e aggiornamenti di scena simili) vengono propagate ai follower.</li>
        <li>Puoi <strong>Termina conferenza</strong> per tutti. Mentre sei leading, usa il tasto <strong>B</strong> per attivare/disattivare l’inchiostro effimero.</li>
        <li>Puoi testare la conferenza su un solo desktop con il pulsante <strong>Open another user</strong>. Guarda il seguente video dimostrativo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Come cercare in IDC e aggiungere a un elenco personale.',
    howto4Title: 'Come caricare uno studio locale in un viewer.',
    howto5Title: 'Come usare l’IA remota',
    howto6Title: 'Come esportare un segmento in STL per la stampa 3D.',
    howto7Title: 'Come usare Reporting / DICOM SR.',
  },
};
