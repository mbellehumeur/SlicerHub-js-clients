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
          This application uses the
          <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) together with
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">WebSub integration</a>
          and open-source viewers to provide a collaborative conferencing
          environment for education. Lessons are organized as
          <strong>courses</strong> that educators can extend by adding folders
          under the courses folder.
        </p>
        <p>
          The IDC is part of the NCI Cancer Research Data Commons. It hosts large,
          publicly available collections of cancer imaging data in the cloud so
          researchers, clinicians, and educators can explore real clinical-grade
          studies without setting up their own archive.
        </p>
        <p>
          IDC invests in education and open tooling so students and teachers can
          learn medical imaging with authentic data, reproducible workflows, and
          freely available viewers—not only research pipelines.
        </p>
        <p>
          Viewing is powered by open-source platforms that share IDC’s commitment
          to accessible medical imaging:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="https://ohif.org/" target="_blank" rel="noopener">OHIF</a>
            — a web-based medical image viewer built on open standards (including
            DICOMweb). It is widely used in research and education, and is designed
            so modes and extensions can grow with teaching and clinical workflows.
          </li>
          <li>
            <a href="https://github.com/ImagingDataCommons/slim" target="_blank" rel="noopener">Slim</a>
            — an interoperable slide microscopy viewer from the Imaging Data
            Commons (National Cancer Institute), for teaching and research with
            whole-slide imaging.
          </li>
          <li>
            <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>
            — a desktop platform for visualization, analysis, and research.
            <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>
            runs as a Slicer extension so Classroom, conferencing, and image
            display can share one open messaging stack with the same data and tools.
          </li>
        </ul>
        <p>
          For free, open anatomy education, see the
          <a href="https://www.openanatomy.org/" target="_blank" rel="noopener">Open Anatomy Project</a>
          at Brigham and Women’s Hospital. It distributes high-quality anatomy
          atlases and open-source software worldwide—democratizing medical
          knowledge for students, clinicians, researchers, and the public,
          wherever they live and in many languages. Atlases are viewed in the
          web-based Open Anatomy Browser; the group also created
          <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>,
          which was used to build the atlases.
        </p>
        <p>
          The University of Twente
          <a href="https://bonehub.github.io/Educational-Atlas/" target="_blank" rel="noopener">BoneHub Educational Atlas</a>
          offers interactive full-skeleton 3D models of the Visible Human Male
          and Female for teaching, visualization, and 3D printing. Free STL
          meshes and IGES/STEP CAD files (CC BY 4.0) are available from the
          <a href="https://huggingface.co/datasets/BoneHub/visible-human-3d-models" target="_blank" rel="noopener">visible-human-3d-models</a>
          dataset on Hugging Face.
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
