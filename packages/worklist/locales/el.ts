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
      'Κάντε κλικ σε ένα από τα κουμπιά {{open}} δεξιά για προβολή μελέτης σε 3D και MPR.',
    introHtml:
      `
        <p>
          Ο αρχικός σκοπός αυτής της εφαρμογής είναι να είναι «worklist client» σε ένα ανοιχτού κώδικα σύστημα 
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>. Το σύστημα υποστηρίζει την προώθηση, εκπαίδευση, ανάπτυξη και επίδειξη διαλειτουργικότητας σε εφαρμογές ιατρικής απεικόνισης.
        </p>
        <p>Η εφαρμογή είναι επομένως ένα συστατικό (<strong>WORKLIST_CLIENT actor</strong>) ενός συστήματος που περιλαμβάνει:</p>
        <ul class="wl-help-steps">
          <li>ένα WebSub hub (<strong>HUB actor</strong>) για επικοινωνία μεταξύ εφαρμογών και χρηστών</li>
          <li>προβολείς ιατρικής απεικόνισης ανοιχτού κώδικα (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>μοντέλα συμπερασμάτων ανοιχτού κώδικα (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>ένα παράδειγμα αναφοράς DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>το <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> και τη βάση DICOM του <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> ως αρχεία μόνο για ανάγνωση (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>έναν πάροχο ελέγχου ταυτότητας / ταυτότητας με ενσωμάτωση στα OIDC endpoints του hub ή την ενσωματωμένη ανώνυμη/mock πιστοποίηση του hub</li>
        </ul>
        <p>
          Η εφαρμογή περιλαμβάνει επίσης λειτουργίες εκπαίδευσης ανατομίας και παθολογίας, ανεξάρτητα από τη ροή εργασίας IHE:
        </p>
        <ul class="wl-help-steps">
          <li>δημιουργία, αποθήκευση και μεταφόρτωση διδακτικών αρχείων και κοhortών</li>
          <li>διάσκεψη για συνεργατική προβολή και διδασκαλία</li>
          <li>προσωρινό πινέλο για σύντομες σημειώσεις κατά τη διάσκεψη</li>
          <li>εξαγωγή STL για εκτύπωση 3D</li>
        </ul>
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
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="Κεφαλίδα SlicerLive με επισημασμένη διάσκεψη" width="477" height="117" />
        </li>
        <li>Ως οικοδεσπότης, κάντε κλικ <strong>Διάσκεψη</strong> (κεφαλίδα worklist ή γραμμή SlicerLive). Επιλέξτε τίτλο και δημιουργήστε — γίνεστε η θέση <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Δημιουργία διάσκεψης: πεδίο τίτλου και κουμπί Δημιουργία" width="167" height="192" />
        </li>
        <li>Κατά την ηγεσία, αλλαγές στο SlicerLive (διάταξη, παράθυρο/επίπεδο, ορατότητα τμημάτων, κάμερα, MPR, προσωρινό marker κ.λπ.) αποστέλλονται στους ακολουθούντες.</li>
        <li>Κατά την ηγεσία, πατήστε <strong>B</strong> για εναλλαγή προσωρινού marker.</li>
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
