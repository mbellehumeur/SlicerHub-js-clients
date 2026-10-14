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
    worklist: 'Worklist',
    exploreIdc: 'Εξερευνήστε το NCI Imaging Data Commons:',
    viewers: 'Προβολείς:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Μάθημα:',
    anatomicalPlanes: 'Anatomical Planes',
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
  },
  conference: CONFERENCE_BY_LOCALE.el,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Σχετικά με αυτή την εφαρμογή',
    aboutLinkLabel: 'Σχετικά',
    aboutLinkSuffix: '— άδειες, ευχαριστίες και εμπορικά σήματα.',
    quickStartTitle: 'Γρήγορη εκκίνηση:',
    quickStartBody:
      'Κάντε κλικ σε ένα από τα κουμπιά {{open}} δεξιά για να ανοίξετε ένα CR και να χρησιμοποιήσετε το εικονίδιο μαγικού ραβδιού {{magicWand}} για να εκτελέσετε το FleXray.',
    introHtml: `
        <p>
          Ο αρχικός σκοπός αυτής της εφαρμογής είναι να είναι ένας ηθοποιός «worklist client» σε ένα σύστημα ανοιχτού κώδικα
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>
          και
          <a href="https://wiki.ihe.net/index.php/AI_Results" target="_blank" rel="noopener">IHE AI Results</a>
          που βρίσκεται σε επέκταση 3D Slicer με όνομα
          <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>.
          Το Slicer Hub παρέχει την υποδομή μηνυμάτων και στοχεύει στην προώθηση, εκπαίδευση, ανάπτυξη και
          επίδειξη διαλειτουργικότητας σε εφαρμογές ιατρικής απεικόνισης.
        </p>
        <p>Η εφαρμογή είναι επομένως ένα συστατικό (<strong>WORKLIST_CLIENT actor</strong>) ενός συστήματος που περιλαμβάνει:</p>
        <ul class="wl-help-steps">
          <li>ένα WebSub hub (<strong>HUB actor</strong>) για επικοινωνία μεταξύ εφαρμογών και χρηστών</li>
          <li>προβολείς ιατρικής απεικόνισης ανοιχτού κώδικα (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>μοντέλα συμπερασμάτων ιατρικής απεικόνισης ανοιχτού κώδικα (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>ένα παράδειγμα αναφοράς DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>το <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> και τη βάση DICOM του <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> ως αρχεία μόνο για ανάγνωση (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>πάροχο ελέγχου ταυτότητας / ταυτότητας με ενσωμάτωση στα OIDC endpoints του hub ή ενσωματωμένο ανώνυμο/mock έλεγχο ταυτότητας</li>
        </ul>
        <p>
          Το σύστημα περιλαμβάνει επίσης εκπαιδευτικά χαρακτηριστικά ανεξάρτητα από τη ροή εργασίας IHE
          Integrated Reporting:
        </p>
        <ul class="wl-help-steps">
          <li>δημιουργία, αποθήκευση και μεταφόρτωση διδακτικών αρχείων και κοορτών για προετοιμασία μαθημάτων</li>
          <li>διάσκεψη για συνεργατική προβολή και διδασκαλία</li>
          <li>εργαλείο πινέλου που εξαφανίζεται για προσωρινές σχολιασμούς κατά τη διάσκεψη</li>
          <li>εξαγωγή STL για εκτύπωση 3D</li>
        </ul>
        <p>
          Παρέχονται επίσης ερευνητικές και 3D Slicer λειτουργίες, ανεξάρτητες από το IHE:
        </p>
        <ul class="wl-help-steps">
          <li>μεταφορά αρχείων μεταξύ εφαρμογών</li>
          <li>σκηνές ιατρικής πραγματικότητας και επικοινωνίες</li>
          <li>πελάτης Slicer Qt Image Display</li>
          <li>πρόσβαση στη βάση DICOM του Slicer</li>
        </ul>
        <p>
          Η μεταφορά αρχείων επιτρέπει στους διακομιστές συμπερασμάτων να στέλνουν αποτελέσματα απευθείας στους προβολείς
          χωρίς πρώτα να τα αποθηκεύουν σε PACS. Υποστηρίζει επίσης ερευνητικές μορφές όπως NIfTI, NRRD και Zarr.
        </p>
    `,
    howto0Title: 'Πώς να συνδέσετε το SlicerWorklist με 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist με προβολείς (επιλεγμένο SlicerDesktop), απομακρυσμένη AI και λίστα μελετών" width="870" height="498" />
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
