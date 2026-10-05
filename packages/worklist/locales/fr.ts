import { CONFERENCE_BY_LOCALE } from '../../i18n/conference';
import type { en } from './en';

type LocaleBundle = {
  chrome: { [K in keyof typeof en.chrome]: string };
  conference: { [K in keyof typeof en.conference]: string };
  help: { [K in keyof typeof en.help]: string };
};

export const fr: LocaleBundle = {
  chrome: {
    conferencing: 'Conférence',
    open: 'Ouvrir',
    close: 'Fermer',
    searchPortal: 'Portail de recherche',
    searchPortalTitle: 'Ouvrir le portail de recherche IDC',
    worklist: 'Liste de travail',
    exploreIdc: 'Explorer le NCI Imaging Data Commons :',
    viewers: 'Visionneuses :',
    reportingClients: 'Report Creators :',
    localAi: 'Evidence Creators:',
    remoteAi: 'Evidence Creators:',
    classroom: 'Cours :',
    currentContext: 'Contexte actuel :',
    none: 'aucun',
    colStudy: 'Étude',
    colModalities: 'Modalités',
    colFormat: 'Format',
    colSize: 'Taille',
    language: 'Langue',
    openStudy: 'Ouvrir l’étude',
    closeStudy: 'Fermer l’étude ouverte',
    closeContext: 'Fermer le contexte actuel',
    cannotOpen: 'Impossible d’ouvrir',
  },
  conference: CONFERENCE_BY_LOCALE.fr,
  help: {
    modalTitle: 'SlicerWorklist',
    aboutSummary: 'À propos de cette application',
    aboutLinkLabel: 'À propos',
    aboutLinkSuffix: '— licences, remerciements et marques.',
    quickStartTitle: 'Démarrage rapide :',
    quickStartBody:
      'Cliquez sur l’un des boutons {{open}} à droite pour visualiser une étude en 3D et MPR.',
    introHtml: `
        <p>
          Le but initial de cette application est d’être un acteur « worklist client » dans un système open source
          <a href="https://profiles.ihe.net/RAD/IRA/" target="_blank" rel="noopener">IHE Integrated Reporting Application</a>.
          Le système vise à promouvoir, former, développer et démontrer l’interopérabilité des applications d’imagerie médicale.
        </p>
        <p>L’application est donc un composant (<strong>WORKLIST_CLIENT actor</strong>) d’un système qui comprend :</p>
        <ul class="wl-help-steps">
          <li>un hub WebSub (<strong>HUB actor</strong>) pour la communication entre applications et utilisateurs</li>
          <li>des visionneuses d’imagerie open source (<strong>IMAGE_DISPLAY actors</strong>)</li>
          <li>des modèles d’inférence open source (<strong>EVIDENCE_CREATOR actors</strong>)</li>
          <li>un exemple de reporting DICOM SR (<strong>REPORT_CREATOR actor</strong>)</li>
          <li>l’<a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a> et la base DICOM de <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a> comme archives en lecture seule (<strong>IMAGE_ARCHIVE actor</strong>)</li>
          <li>un fournisseur d’authentification / d’identité avec intégration aux endpoints OIDC du hub ou l’authentification anonyme/mock intégrée au hub</li>
        </ul>
        <p>
          L’application inclut aussi des fonctions d’enseignement d’anatomie et de pathologie indépendantes du workflow IHE :
        </p>
        <ul class="wl-help-steps">
          <li>création, enregistrement et téléversement de dossiers pédagogiques et de cohortes</li>
          <li>conférence pour la visualisation et l’enseignement collaboratifs</li>
          <li>un outil de pinceau éphémère pour des annotations temporaires en conférence</li>
          <li>export STL pour l’impression 3D</li>
        </ul>
    `,
    howto0Title: 'Comment connecter SlicerWorklist à 3D Slicer.',
    howto0Body: `
      <ol class="wl-help-steps">
        <li>Installez l’extension Slicer Hub Interface</li>
        <li>Dans <strong>3D Slicer</strong>, ouvrez le module <strong>Hub Interface</strong>, puis la section <strong>Image Display Client</strong>.</li>
        <li>Choisissez le hub <strong>SLICER-HUB-CLOUD</strong> (le même hub cloud que cette liste de travail). Utilisez <strong>SLICER-HUB</strong> uniquement si vous exécutez un hub local sur le port 2018.</li>
        <li>Sans OIDC, définissez <strong>User</strong> sur le même utilisateur que votre liste de travail cloud (en haut à gauche), puis cliquez sur <strong>Connect</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/image-display-client-connect.png" alt="Image Display Client : hub SLICER-HUB-CLOUD, topic défini, Connect, statut Connected" width="585" height="127" />
        </li>
        <li>Une fois connecté, le bouton visionneuse <strong>SlicerDesktop</strong> s’allume, le sélecteur de liste passe à « 3D Slicer » et la liste affiche le contenu de la base DICOM de Slicer. Ouvrez une étude — elle se charge dans Slicer bureau.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="SlicerWorklist avec visionneuses (SlicerDesktop sélectionné), IA distante et liste d’études" width="870" height="498" />
        </li>
        <li>Pour la conférence / vue live dans le navigateur, utilisez <strong>SlicerLive</strong> et <strong>Conférence</strong> lorsque d’autres suivent vos changements de nœuds et de caméra/présentation.</li>
      </ol>
    `,
    howto1Title: 'Comment rejoindre une conférence.',
    howto1Body: `
      <ol class="wl-help-steps">
        <li>Ouvrez la worklist et cliquez sur <strong>Conférence</strong> en haut à droite.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="En-tête SlicerLive avec Conférence mise en évidence" width="477" height="117" />
        </li>
        <li>Si une conférence est en cours sur votre instance de hub, elle apparaît dans une liste déroulante.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-join.png" alt="Rejoindre une conférence : liste des conférences actives et bouton Rejoindre" width="322" height="175" />
        </li>
        <li>Si la conférence n’a pas encore commencé, attendez l’invitation à rejoindre :</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-invitation.png" alt="Invitation : Rejoindre et suivre, Rejoindre sans suivre, ou Ne pas rejoindre" width="190" height="141" />
        </li>
        <li>Si vous avez choisi de suivre, vous suivez l’étude et la présentation de l’hôte. Quittez à tout moment avec <strong>Quitter la conférence</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/conference-chips.png" alt="En-tête avec Quitter la conférence, votre lieu et un participant qui suit" width="397" height="80" />
        </li>
        <li>Si vous arrêtez de suivre, vous pouvez ensuite reprendre le suivi ou prendre le contrôle de la conférence.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/ResumeTakeOverConference.png" alt="En-tête avec Reprendre le suivi et Prendre le contrôle après l’arrêt du suivi" width="643" height="42" />
        </li>
      </ol>
    `,
    howto2Title: 'Comment créer une conférence.',
    howto2Body: `
      <ol class="wl-help-steps">
        <li>Ouvrez la worklist et cliquez sur <strong>Conférence</strong> en haut à droite.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/slicerlive-start-conference.png" alt="En-tête SlicerLive avec Conférence mise en évidence" width="477" height="117" />
        </li>
        <li>En tant qu’hôte, cliquez sur <strong>Conférence</strong> (en-tête de la liste ou barre SlicerLive). Choisissez un titre et créez — vous devenez le lieu <strong>leading</strong>.</li>
        <li class="wl-help-figure">
          <img class="wl-help-img" src="./help-images/create-conference.png" alt="Créer une conférence : titre et bouton Créer une conférence" width="167" height="192" />
        </li>
        <li>En leading, vos changements dans SlicerLive (mise en page, fenêtre/niveau, segments, caméra, MPR, encre éphémère, etc.) sont diffusés aux suiveurs.</li>
        <li>En leading, utilisez la touche <strong>B</strong> pour activer/désactiver l’encre éphémère.</li>
        <li>Vous pouvez tester la conférence sur un seul ordinateur avec le bouton <strong>Open another user</strong>. Voir la vidéo de démonstration : <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Comment rechercher dans IDC et ajouter à une liste personnelle.',
    howto4Title: 'Comment charger une étude locale dans une visionneuse.',
    howto5Title: 'Comment utiliser l’IA distante',
    howto6Title: 'Comment exporter un segment en STL pour l’impression 3D.',
    howto7Title: 'Comment utiliser le Reporting / DICOM SR.',
  },
};
