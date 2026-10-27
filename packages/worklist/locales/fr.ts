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
    worklist: 'Liste de travail:',
    exploreIdc: 'Explorer le NCI Imaging Data Commons :',
    viewers: 'Visionneuses :',
    reportingClients: 'Créateurs de rapports :',
    localAi: 'Créateurs d’évidence :',
    remoteAi: 'Créateurs d’évidence :',
    classroom: 'Salle de classe :',
    anatomicalPlanes: 'Salle de classe',
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
    saveWorklist: 'Enregistrer',
    loadWorklist: 'Charger',
    saveWorklistTitle: 'Enregistrer ma liste de travail en JSON',
    loadWorklistTitle: 'Charger ma liste de travail depuis un JSON',
  },
  conference: CONFERENCE_BY_LOCALE.fr,
  help: {
    modalTitle: 'Worklist',
    aboutSummary: 'À propos de cette application',
    aboutLinkLabel: 'À propos',
    aboutLinkSuffix: '— licences, remerciements et marques.',
    quickStartTitle: 'Démarrage rapide :',
    quickStartBody:
      'Cliquez sur l’un des boutons {{open}} à droite pour ouvrir un CR et utiliser l’icône baguette magique {{magicWand}} pour lancer FleXray.',
    introHtml: `
        <p>
          L’
          <a href="https://imaging.datacommons.cancer.gov/" target="_blank" rel="noopener">Imaging Data Commons</a>
          (IDC) fait partie du Cancer Research Data Commons du NCI. Il héberge dans
          le cloud de vastes collections d’imagerie oncologique en accès libre, afin
          que chercheurs, cliniciens et enseignants puissent explorer de vraies
          études de qualité clinique sans déployer leur propre archive.
        </p>
        <p>
          L’IDC s’investit dans l’éducation et les outils ouverts pour que
          étudiants et enseignants puissent apprendre l’imagerie médicale avec des
          données authentiques, des flux reproductibles et des visionneuses libres
          — pas seulement des pipelines de recherche.
        </p>
        <p>
          Cette application <strong>Classroom</strong> est un client pédagogique
          hébergé par le Hub. Elle s’appuie sur l’IDC (et d’autres archives
          ouvertes) avec des affichages d’images en direct pour glossaires,
          examens d’exemple et conférences collaboratives. Les leçons sont
          organisées en <strong>cours</strong> que les enseignants peuvent
          étendre dans le paquet Classroom.
        </p>
        <p>
          L’affichage s’appuie sur des plateformes open source qui partagent
          l’engagement de l’IDC pour une imagerie médicale accessible&nbsp;:
        </p>
        <ul class="wl-help-steps">
          <li>
            <a href="https://ohif.org/" target="_blank" rel="noopener">OHIF</a>
            — visionneuse web d’images médicales fondée sur des normes ouvertes
            (dont DICOMweb). Très utilisée en recherche et en enseignement, elle
            est conçue pour que modes et extensions évoluent avec les flux
            pédagogiques et cliniques.
          </li>
          <li>
            <a href="https://github.com/ImagingDataCommons/slim" target="_blank" rel="noopener">Slim</a>
            — visionneuse interopérable de microscopie sur lames issue de
            l’Imaging Data Commons (National Cancer Institute), pour
            l’enseignement et la recherche en imagerie sur lames entières.
          </li>
          <li>
            <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>
            — plateforme de bureau pour la visualisation, l’analyse et la
            recherche.
            <a href="https://github.com/mbellehumeur/SlicerHub" target="_blank" rel="noopener">Slicer Hub</a>
            s’exécute comme extension Slicer afin que Classroom, la conférence et
            l’affichage d’images partagent une même pile de messagerie ouverte,
            avec les mêmes données et outils.
          </li>
        </ul>
        <p>
          Pour une anatomie libre et ouverte, consultez le
          <a href="https://www.openanatomy.org/" target="_blank" rel="noopener">Open Anatomy Project</a>
          du Brigham and Women’s Hospital. Il diffuse des atlas anatomiques de
          haute qualité et des logiciels open source dans le monde entier, afin
          de démocratiser le savoir médical pour étudiants, cliniciens,
          chercheurs et grand public, où qu’ils vivent et dans de nombreuses
          langues. Les atlas s’explorent dans le navigateur Open Anatomy
          Browser&nbsp;; le groupe a aussi créé
          <a href="https://www.slicer.org/" target="_blank" rel="noopener">3D Slicer</a>,
          utilisé pour produire ces atlas.
        </p>
        <p>
          L’
          <a href="https://bonehub.github.io/Educational-Atlas/" target="_blank" rel="noopener">atlas pédagogique BoneHub</a>
          de l’Université de Twente propose des modèles 3D interactifs du
          squelette complet de l’homme et de la femme Visible Human pour
          l’enseignement, la visualisation et l’impression 3D. Des maillages
          STL et des fichiers CAO IGES/STEP libres (CC BY 4.0) sont disponibles
          dans le jeu de données
          <a href="https://huggingface.co/datasets/BoneHub/visible-human-3d-models" target="_blank" rel="noopener">visible-human-3d-models</a>
          sur Hugging Face.
        </p>
    `,
    howto0Title: 'Comment connecter Worklist à 3D Slicer.',
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
          <img class="wl-help-img" src="./help-images/worklist-viewers-slicer-qt.png" alt="Worklist avec visionneuses (SlicerDesktop sélectionné), IA distante et liste d’études" width="870" height="498" />
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
        <li>En leading, vos changements dans SlicerLive (mise en page, fenêtre/niveau, visibilité des segments, caméra, défilement/panoramique/zoom MPR, encre éphémère et mises à jour de scène similaires) sont diffusés aux suiveurs de la conférence.</li>
        <li>Vous pouvez <strong>Terminer la conférence</strong> pour tout le monde. En leading, utilisez la touche <strong>B</strong> pour activer/désactiver l’encre éphémère.</li>
        <li>Vous pouvez tester la conférence sur un seul ordinateur avec le bouton <strong>Open another user</strong>. Voir la vidéo de démonstration : <a href="https://youtu.be/xKQEOs1_9Bg" target="_blank" rel="noopener noreferrer">https://youtu.be/xKQEOs1_9Bg</a></li>
      </ol>
    `,
    howto3Title: 'Comment rechercher dans IDC et ajouter à une liste personnelle.',
    howto4Title: 'Comment charger une étude locale dans une visionneuse.',
    howto5Title: 'Comment utiliser l’IA distante',
    howto6Title: 'Comment exporter un segment en STL pour l’impression 3D.',
    howto7Title: 'Comment utiliser le Reporting / DICOM SR.',
  },
};
