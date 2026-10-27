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
    worklist: 'Worklist:',
    exploreIdc: 'Utforsk NCI Imaging Data Commons:',
    viewers: 'Visere:',
    reportingClients: 'Report Creators:',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Kurs:',
    anatomicalPlanes: 'Classroom',
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
    saveWorklist: 'Lagre',
    loadWorklist: 'Last inn',
    saveWorklistTitle: 'Lagre min worklist som JSON',
    loadWorklistTitle: 'Last inn min worklist fra JSON',
  },
  conference: CONFERENCE_BY_LOCALE.no,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'Om denne applikasjonen',
    aboutLinkLabel: 'Om',
    aboutLinkSuffix: '— lisenser, takk og varemerker.',
    quickStartTitle: 'Hurtigstart:',
    quickStartBody:
      'Klikk en av {{open}}-knappene til høyre for å åpne et CR og bruke tryllestavikonet {{magicWand}} for å kjøre FleXray.',
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
    howto0Title: 'Slik kobler du Worklist til 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist med visere (SlicerDesktop valgt), ekstern AI og studieliste" width="870" height="498" />
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
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="SlicerLive-topptekst med Konferanse uthevet" width="477" height="117" />
        </li>
        <li>Som vert klikker du <strong>Konferanse</strong> (worklist-topptekst eller SlicerLive-linjen). Velg en tittel og opprett — du blir det <strong>ledende</strong> stedet.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Opprett konferanse: tittelfelt og Opprett konferanse-knapp" width="167" height="192" />
        </li>
        <li>Mens du leder, sendes endringer i SlicerLive (layout, vindusnivå, segmentvisning, kamera, MPR scroll/pan/zoom, midlertidig blekk og lignende sceneoppdateringer) til følgere.</li>
        <li>Du kan <strong>Avslutt konferanse</strong> for alle. Mens du leder, bruker du <strong>B</strong>-tasten for å slå midlertidig blekk av/på.</li>
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
