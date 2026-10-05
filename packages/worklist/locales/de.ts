import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const de: LocaleBundle = {
  chrome: {
    conferencing: 'Konferenz',
    open: 'Öffnen',
    close: 'Schließen',
    searchPortal: 'Suchportal',
    searchPortalTitle: 'IDC-Suchportal öffnen',
    worklist: 'Worklist',
    exploreIdc: 'NCI Imaging Data Commons erkunden:',
    viewers: 'Viewer:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurs:',
    currentContext: 'Aktueller Kontext:',
    none: 'keiner',
    colStudy: 'Studie',
    colModalities: 'Modalitäten',
    colFormat: 'Format',
    colSize: 'Größe',
    language: 'Sprache',
    openStudy: 'Studie öffnen',
    closeStudy: 'Offene Studie schließen',
    closeContext: 'Aktuellen Kontext schließen',
    cannotOpen: 'Kann nicht geöffnet werden',
  },
  conference: CONFERENCE_BY_LOCALE.de,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'Über diese Anwendung',
    aboutLinkLabel: 'Info',
    aboutLinkSuffix: '— Lizenzen, Danksagungen und Marken.',
    quickStartTitle: 'Schnellstart:',
    quickStartBody:
      'Klicken Sie rechts auf einen der {{open}} Buttons, um eine Studie in 3D und MPR anzuzeigen.',
    introHtml: `
        <p>
          Ursprünglich dient diese Anwendung als „worklist client“-Akteur in einem Open-Source-
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>-System.
          Das System soll Interoperabilität in medizinischen Bildgebungsanwendungen fördern, schulen, entwickeln und demonstrieren.
        </p>
        <p>Die Anwendung ist daher ein Bestandteil (<strong>WORKLIST_CLIENT actor</strong>) eines Systems, das Folgendes umfasst:</p>
        <ul class="wl-help-steps">
          <li>einen WebSub-Hub (<strong>HUB actor</strong>) für die Kommunikation zwischen Anwendungen und Benutzern</li>
          <li>Open-Source-Viewer für medizinische Bildgebung (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>Open-Source-Inferenzmodelle (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>ein DICOM-SR-Reporting-Beispiel (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>das <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> und die DICOM-DB von <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> als schreibgeschützte Archive (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>einen Authentifizierungs- / Identitätsanbieter mit Integration in die OIDC-Endpunkte des Hubs oder die eingebaute anonyme/Mock-Authentifizierung des Hubs</li>
        </ul>
        <p>
          Die Anwendung enthält außerdem Funktionen für Anatomie- und Pathologieunterricht unabhängig vom IHE-Reporting-Workflow:
        </p>
        <ul class="wl-help-steps">
          <li>Erstellen, Speichern und Hochladen von Lehrdateien und Kohorten</li>
          <li>Konferenz für gemeinsames Betrachten und Unterrichten</li>
          <li>ein temporärer Pinsel für kurze Annotationen während der Konferenz</li>
          <li>STL-Export für den 3D-Druck</li>
        </ul>
    `,
    howto0Title: 'So verbinden Sie SlicerWorklist mit 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Installieren Sie die Slicer Hub Interface Extension</li>
        <li>Öffnen Sie in <strong>3D Slicer</strong> das Modul <strong>Hub Interface</strong> und den Abschnitt <strong>Image Display Client</strong>.</li>
        <li>Wählen Sie den Hub <strong>SLICER-HUB-CLOUD</strong> (derselbe Cloud-Hub wie diese Worklist). Nutzen Sie <strong>SLICER-HUB</strong> nur, wenn Sie einen lokalen Hub auf Port 2018 betreiben.</li>
        <li>Ohne OIDC setzen Sie <strong>User</strong> auf denselben Benutzer wie Ihre Cloud-Worklist (oben links) und klicken auf <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client: Hub SLICER-HUB-CLOUD, Topic gesetzt, Connect, Status Connected" width="585" height="127" />
        </li>
        <li>Nach der Verbindung leuchtet der Viewer-Button <strong>SlicerDesktop</strong>, die Worklist-Auswahl wechselt zu „3D Slicer“ und zeigt den Inhalt der Slicer-DICOM-Datenbank. Öffnen Sie eine Studie — sie wird in Desktop-Slicer geladen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist mit Viewern (SlicerDesktop ausgewählt), Remote-KI und Studienliste" width="870" height="498" />
        </li>
        <li>Für Browser-Konferenz / Live-Ansicht nutzen Sie <strong>SlicerLive</strong> und <strong>Konferenz</strong>, wenn andere Ihre Knoten- und Kamera-/Präsentationsänderungen folgen.</li>
      </ol>
    `,
    howto1Title: 'So treten Sie einer Konferenz bei.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Öffnen Sie die Worklist und klicken Sie oben rechts auf <strong>Konferenz</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-Kopfzeile mit hervorgehobener Konferenz" width="477" height="117" />
        </li>
        <li>Wenn auf Ihrer Hub-Instanz bereits eine Konferenz läuft, erscheint sie in einem Dropdown.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Konferenz beitreten: Dropdown Aktive Konferenzen und Schaltfläche Konferenz beitreten" width="322" height="175" />
        </li>
        <li>Wenn die Konferenz noch nicht gestartet ist, warten Sie auf die Einladung zum Beitreten:</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Konferenzeinladung: Beitreten und folgen, Beitreten ohne Folgen oder Nicht beitreten" width="190" height="141" />
        </li>
        <li>Wenn Sie Folgen gewählt haben, folgen Sie Studie und Präsentation des Hosts. Verlassen Sie jederzeit mit <strong>Konferenz verlassen</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="Kopfzeile mit Konferenz verlassen, Ihrem Ort und einem folgenden Teilnehmer" width="397" height="80" />
        </li>
        <li>Wenn Sie das Folgen beenden, können Sie anschließend das Folgen wieder aufnehmen oder die Konferenz übernehmen.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="Kopfzeile mit Folgen fortsetzen und Übernehmen nach Beenden des Folgens" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'So erstellen Sie eine Konferenz.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Öffnen Sie die Worklist und klicken Sie oben rechts auf <strong>Konferenz</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-Kopfzeile mit hervorgehobener Konferenz" width="477" height="117" />
        </li>
        <li>Als Host klicken Sie auf <strong>Konferenz</strong> (Worklist-Kopfzeile oder SlicerLive-Leiste). Wählen Sie einen Titel und erstellen Sie die Konferenz — Sie werden der <strong>führende</strong> Ort.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Konferenz erstellen: Titelfeld und Schaltfläche Konferenz erstellen" width="167" height="192" />
        </li>
        <li>Während Sie führen, werden Änderungen in SlicerLive (Layout, Fenster/Level, Segment-Sichtbarkeit, Kamera, MPR, temporäre Markierungen u. Ä.) an die Follower der Konferenz gesendet.</li>
        <li>Während Sie führen, schalten Sie mit der Taste <strong>B</strong> die temporäre Markierungsfarbe ein/aus.</li>
        <li>Sie können Conferencing auf einem einzelnen Desktop mit der Schaltfläche <strong>Open another user</strong> testen. Siehe das folgende Demovideo: <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'So durchsuchen Sie IDC und fügen Einträge zu einer persönlichen Liste hinzu.',
    howto4Title: 'So laden Sie eine lokale Studie in einen Viewer.',
    howto5Title: 'So nutzen Sie Remote-KI',
    howto6Title: 'So exportieren Sie ein Segment als STL für den 3D-Druck.',
    howto7Title: 'So nutzen Sie Reporting / DICOM SR.',
  },
};
