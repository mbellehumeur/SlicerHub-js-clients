import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const el: LocaleBundle = {
  chrome: {
    conferencing: 'Διάσκεψη',
    open: 'Άνοιγμα',
    close: 'Κλείσιμο',
    searchPortal: 'Πύλη αναζήτησης',
    searchPortalTitle: 'Άνοιγμα πύλης αναζήτησης IDC',
    worklist: 'Worklist:',
    exploreIdc: 'Εξερευνήστε το NCI Imaging Data Commons:',
    viewers: 'Προβολείς:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Μάθημα:',
    anatomicalPlanes: 'Classroom',
    currentContext: 'Τρέχον πλαίσιο:',
    none: 'κανένα',
    colStudy: 'Μελέτη',
    colModalities: 'Τρόποι',
    colFormat: 'Μορφή',
    colSize: 'Μέγεθος',
    language: 'Γλώσσα',
    openStudy: 'Άνοιγμα μελέτης',
    closeStudy: 'Κλείσιμο ανοιχτής μελέτης',
    closeContext: 'Κλείσιμο τρέχοντος πλαισίου',
    cannotOpen: 'Δεν είναι δυνατό το άνοιγμα',
    saveWorklist: 'Αποθήκευση',
    loadWorklist: 'Φόρτωση',
    saveWorklistTitle: 'Αποθήκευση της λίστας εργασίας ως JSON',
    loadWorklistTitle: 'Φόρτωση της λίστας εργασίας από JSON',
  },
  conference: CONFERENCE_BY_LOCALE.el,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Σχετικά με αυτή την εφαρμογή',
    aboutLinkLabel: 'Σχετικά',
    aboutLinkSuffix: '— άδειες, ευχαριστίες και εμπορικά σήματα.',
    quickStartTitle: 'Γρήγορη εκκίνηση:',
    quickStartBody:
      'Κάντε κλικ σε ένα από τα κουμπιά {{open}} δεξιά για να ανοίξετε ένα CR και να χρησιμοποιήσετε το εικονίδιο μαγικού ραβδιού {{magicWand}} για να εκτελέσετε το FleXray.',
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
    howto0Title: 'Πώς να συνδέσετε το Worklist με 3D Slicer.',
    howto0Body:
      `
      <ol class="wl-help-steps">
        <li>Εγκαταστήστε την επέκταση Slicer Hub Interface</li>
        <li>Στο <strong>3D Slicer</strong> ανοίξτε τη module <strong>Hub Interface</strong> και την ενότητα <strong>Image Display Client</strong>.</li>
        <li>Επιλέξτε hub <strong>SLICER-HUB-CLOUD</strong> (το ίδιο cloud hub με αυτή τη worklist). Χρησιμοποιήστε <strong>SLICER-HUB</strong> μόνο αν τρέχετε τοπικό hub στη θύρα 2018.</li>
        <li>Χωρίς OIDC, ορίστε <strong>User</strong> στον ίδιο χρήστη με το cloud worklist (πάνω αριστερά) και κάντε κλικ <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: hub SLICER-HUB-CLOUD, topic, Connect, Connected" width="585" height="127" />
        </li>
        <li>Μετά τη σύνδεση, το κουμπί προβολέα <strong>SlicerDesktop</strong> ενεργοποιείται, ο επιλογέας αλλάζει σε «3D Slicer» και η λίστα δείχνει το περιεχόμενο της βάσης DICOM του Slicer. Ανοίξτε μια μελέτη — φορτώνεται στο desktop Slicer.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist με προβολείς (επιλεγμένο SlicerDesktop), απομακρυσμένη AI και λίστα μελετών" width="870" height="498" />
        </li>
        <li>Για διάσκεψη στο πρόγραμμα περιήγησης / ζωντανή προβολή, χρησιμοποιήστε <strong>SlicerLive</strong> και <strong>Διάσκεψη</strong> όταν άλλοι ακολουθούν τις αλλαγές κόμβων και κάμερας/παρουσίασης.</li>
      </ol>
    `,
    howto1Title: 'Πώς να συμμετάσχετε σε διάσκεψη.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Ανοίξτε τη worklist και κάντε κλικ στο <strong>Διάσκεψη</strong> πάνω δεξιά.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Κεφαλίδα SlicerLive με επισημασμένη διάσκεψη" width="477" height="117" />
        </li>
        <li>Αν υπάρχει διάσκεψη σε εξέλιξη στο hub σας, εμφανίζεται σε αναπτυσσόμενο μενού.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Συμμετοχή σε διάσκεψη: μενού ενεργών διασκέψεων και κουμπί Συμμετοχή" width="322" height="175" />
        </li>
        <li>Αν η διάσκεψη δεν έχει ξεκινήσει, περιμένετε την πρόσκληση συμμετοχής:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Πρόσκληση: Συμμετοχή και ακολούθηση, Συμμετοχή χωρίς ακολούθηση ή Μη συμμετοχή" width="190" height="141" />
        </li>
        <li>Αν επιλέξατε ακολούθηση, ακολουθείτε τη μελέτη και την προσουσίαση του οικοδεσπότη. Αποχωρήστε οποιαδήποτε στιγμή με <strong>Αποχώρηση από διάσκεψη</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Κεφαλίδα με Αποχώρηση από διάσκεψη, τη θέση σας και έναν ακόλουθο συμμετέχοντα" width="397" height="80" />
        </li>
        <li>Αν διακόψετε την παρακολούθηση, μπορείτε στη συνέχεια να την συνεχίσετε ή να αναλάβετε τη διάσκεψη.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Κεφαλίδα με Συνέχεια παρακολούθησης και Ανάληψη μετά τη διακοπή" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Πώς να δημιουργήσετε διάσκεψη.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Ανοίξτε τη worklist και κάντε κλικ στο <strong>Διάσκεψη</strong> πάνω δεξιά.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Κεφαλίδα SlicerLive με επισημασμένη Διάσκεψη" width="477" height="117" />
        </li>
        <li>Ως οικοδεσπότης, κάντε κλικ στο <strong>Διάσκεψη</strong> (κεφαλίδα worklist ή γραμμή SlicerLive). Επιλέξτε τίτλο και δημιουργήστε — γίνεστε το <strong>leading</strong> μέρος.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Δημιουργία διάσκεψης: πεδίο τίτλου και κουμπί Δημιουργία διάσκεψης" width="167" height="192" />
        </li>
        <li>Ενώ οδηγείτε, οι αλλαγές στο SlicerLive (διάταξη, παράθυρο/επίπεδο, ορατότητα τμημάτων, κάμερα, κύλιση/pan/zoom MPR, μελάνι που εξαφανίζεται και παρόμοιες ενημερώσεις σκηνής) διαδίδονται στους ακόλουθους.</li>
        <li>Μπορείτε να <strong>Τερματίσετε τη διάσκεψη</strong> για όλους. Ενώ οδηγείτε, χρησιμοποιήστε το πλήκτρο <strong>B</strong> για εναλλαγή του μελανιού που εξαφανίζεται.</li>
        <li>Μπορείτε να δοκιμάσετε τη διάσκεψη σε έναν υπολογιστή με το κουμπί <strong>Open another user</strong>. Δείτε το βίντεο επίδειξης: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Πώς να αναζητήσετε στο IDC και να προσθέσετε σε προσωπική λίστα.',
    howto4Title: 'Πώς να φορτώσετε τοπική μελέτη σε προβολέα.',
    howto5Title: 'Πώς να χρησιμοποιήσετε απομακρυσμένη AI',
    howto6Title: 'Πώς να εξαγάγετε τμήμα σε STL για εκτύπωση 3D.',
    howto7Title: 'Πώς να χρησιμοποιήσετε Reporting / DICOM SR.',
  },
};
