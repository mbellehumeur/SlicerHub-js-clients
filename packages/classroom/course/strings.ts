/** Classroom course + conference chat chrome (EN/FR). */

export type CourseChrome = {
  brand: string;
  headerTitle: string;
  course: string;
  volumesAndSegs: string;
  glossary: string;
  activityLabel: string;
  activityText: string;
  instructionsLabel: string;
  instructionSteps: [string, string, string, string, string];
  scanMrHead: string;
  scanKits: string;
  scanThoraxLarge: string;
  scanAbdomenPelvisLarge: string;
  quiz: string;
  term: string;
  definition: string;
  examples: string;
  showOnIra: string;
  relativeDemoNote: string;
  quizPromptDef: string;
  quizPromptTerm: string;
  quizScore: string;
  quizNext: string;
  quizRestart: string;
  quizCorrect: string;
  quizWrong: string;
  conferenceLog: string;
  chatPlaceholder: string;
  chatSend: string;
  chatNeedConference: string;
  joined: string;
  left: string;
  conferenceStarted: string;
  conferenceEnded: string;
  tookOver: string;
  colTerm: string;
  colDefinition: string;
  colExamples: string;
  planesIntro: string;
  planesFigureAlt: string;
  planesFigureCredit: string;
  viewerFigureAlt: string;
  bonus: string;
  bonusPitch: string;
  bonusLink: string;
  bonusControls: ReadonlyArray<{ key: string; action: string }>;
  bonusFigureAlt: string;
  bonusCreditSlicerHeart: string;
  bonusCreditJacc: string;
  bonusCreditRadiol: string;
  bonusCreditSource: string;
};

const en: CourseChrome = {
  brand: 'Classroom',
  headerTitle: 'Anatomical Planes Identification',
  course: 'Anatomical planes',
  volumesAndSegs: 'Volumes & Segmentations',
  glossary: 'Anatomical Planes Identification',
  activityLabel: 'Activity:',
  activityText: 'Identify the anatomical planes on medical images.',
  instructionsLabel: 'Instructions:',
  instructionSteps: [
    'Click one of the buttons below to open medical images and perform the plane identification activity.',
    'Select one of the anatomical planes and use the left mouse button to navigate to an interesting image.',
    'Use the brush tool {{brush}} (also toggle key B) in the viewer to mark each anatomical plane.',
    'Use a circle for the sagittal plane, a triangle for the frontal plane and a square for the transverse plane.',
    'Make a snapshot {{camera}} of each and share your results in the classroom chat.',
  ],
  scanMrHead: 'Head (8 MB)',
  scanKits: 'Thorax - small (19 MB)',
  scanThoraxLarge: 'Thorax - large (60 MB)',
  scanAbdomenPelvisLarge: 'Abdomen, Pelvis - large (80 MB)',
  quiz: 'Quiz',
  term: 'Plane',
  definition: 'Definition',
  examples: 'Example(s)',
  showOnIra: 'Show on IRA',
  relativeDemoNote:
    'Discuss this plane on the live volume in IRA.',
  quizPromptDef: 'Which plane matches this definition?',
  quizPromptTerm: 'What is the definition of this plane?',
  quizScore: 'Score',
  quizNext: 'Next',
  quizRestart: 'Restart quiz',
  quizCorrect: 'Correct',
  quizWrong: 'Not quite',
  conferenceLog: 'Classroom Chat',
  chatPlaceholder: 'Message the conference…',
  chatSend: 'Send',
  chatNeedConference: 'Join a conference to chat',
  joined: 'joined',
  left: 'left',
  conferenceStarted: 'Conference started',
  conferenceEnded: 'Conference ended',
  tookOver: 'took over the scene',
  colTerm: 'Plane',
  colDefinition: 'Definition',
  colExamples: 'Example(s)',
  planesIntro:
    'Anatomical planes are imaginary flat surfaces used to describe locations and sections of the body in anatomy and medical imaging. The three planes most commonly used are the sagittal, frontal (coronal), and transverse (axial) planes.',
  planesFigureAlt:
    'Anatomical planes of the body: sagittal, frontal (coronal), and transverse',
  planesFigureCredit: 'OpenStax Anatomy & Physiology / CC BY 4.0',
  viewerFigureAlt:
    'Viewer screenshot with brush marks for sagittal, frontal, and transverse planes',
  bonus: 'Bonus',
  bonusPitch:
    'Fly a camera through the aorta: contrast-filled blood is transparent so you can travel the aorta and heart chambers with no segmentation or centreline.',
  bonusLink: 'Open endovascular flythrough',
  bonusControls: [
    { key: 'Space', action: 'forward cruise on/off' },
    { key: 'Shift+Space', action: 'reverse' },
    { key: 'Left-drag / arrow keys', action: 'look around' },
    { key: 'Shift+click', action: 'set autopilot target' },
  ],
  bonusFigureAlt:
    'Endovascular flythrough through transverse planes of the aorta',
  bonusCreditSlicerHeart: 'SlicerHeart',
  bonusCreditJacc: 'JACC 2025 (CT/VSD)',
  bonusCreditRadiol: 'Radiol CT Imaging 2026 (4D)',
  bonusCreditSource: 'source',
};

const fr: CourseChrome = {
  brand: 'Salle de classe',
  headerTitle: 'Identification des plans anatomiques',
  course: 'Plans anatomiques',
  volumesAndSegs: 'Volumes et Segmentations',
  glossary: 'Identification des plans anatomiques',
  activityLabel: 'Activité :',
  activityText: 'Identifier les plans anatomiques sur des images médicales.',
  instructionsLabel: 'Instructions :',
  instructionSteps: [
    'Cliquez sur l’un des boutons ci-dessous pour ouvrir des images médicales et réaliser l’activité d’identification des plans.',
    'Sélectionnez l’un des plans anatomiques et utilisez le bouton gauche de la souris pour naviguer jusqu’à une image intéressante.',
    'Utilisez l’outil pinceau {{brush}} (aussi touche B) dans le visualiseur pour marquer chaque plan anatomique.',
    'Utilisez un cercle pour le plan sagittal, un triangle pour le plan frontal et un carré pour le plan transversal.',
    'Faites une capture {{camera}} de chacun et partagez vos résultats dans le clavardage.',
  ],
  scanMrHead: 'Tête (8 Mo)',
  scanKits: 'Thorax — petit (19 Mo)',
  scanThoraxLarge: 'Thorax — grand (60 Mo)',
  scanAbdomenPelvisLarge: 'Abdomen, pelvis — grand (80 Mo)',
  quiz: 'Quiz',
  term: 'Plan',
  definition: 'Définition',
  examples: 'Exemple(s)',
  showOnIra: 'Montrer dans IRA',
  relativeDemoNote:
    'Discutez de ce plan sur le volume dans IRA.',
  quizPromptDef: 'Quel plan correspond à cette définition ?',
  quizPromptTerm: 'Quelle est la définition de ce plan ?',
  quizScore: 'Score',
  quizNext: 'Suivant',
  quizRestart: 'Recommencer',
  quizCorrect: 'Correct',
  quizWrong: 'Pas tout à fait',
  conferenceLog: 'Clavardage',
  chatPlaceholder: 'Message à la conférence…',
  chatSend: 'Envoyer',
  chatNeedConference: 'Rejoignez une conférence pour discuter',
  joined: 'a rejoint',
  left: 'a quitté',
  conferenceStarted: 'Conférence démarrée',
  conferenceEnded: 'Conférence terminée',
  tookOver: 'a pris la direction de la scène',
  colTerm: 'Plan',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  planesIntro:
    'Les plans anatomiques sont des surfaces planes imaginaires utilisées pour décrire la localisation et les coupes du corps en anatomie et en imagerie médicale. Les trois plans les plus couramment utilisés sont les plans sagittal, frontal (coronal) et transversal (axial).',
  planesFigureAlt:
    'Plans anatomiques du corps : sagittal, frontal (coronal) et transversal',
  planesFigureCredit: 'OpenStax Anatomy & Physiology / CC BY 4.0',
  viewerFigureAlt:
    'Capture du visualiseur avec des marques au pinceau pour les plans sagittal, frontal et transversal',
  bonus: 'Bonus',
  bonusPitch:
    'Faites voler une caméra dans l’aorte : le sang rempli de contraste est transparent, ce qui permet de parcourir l’aorte et les cavités cardiaques sans segmentation ni ligne centrale.',
  bonusLink: 'Ouvrir le survol endovasculaire',
  bonusControls: [
    { key: 'Espace', action: 'croisière avant marche/arrêt' },
    { key: 'Maj+Espace', action: 'marche arrière' },
    { key: 'Glisser gauche / flèches', action: 'regarder autour' },
    { key: 'Maj+clic', action: 'cible du pilote automatique' },
  ],
  bonusFigureAlt:
    'Survol endovasculaire des plans transversaux de l’aorte',
  bonusCreditSlicerHeart: 'SlicerHeart',
  bonusCreditJacc: 'JACC 2025 (CT/VSD)',
  bonusCreditRadiol: 'Radiol CT Imaging 2026 (4D)',
  bonusCreditSource: 'code source',
};

export function courseChromeFor(locale?: string): CourseChrome {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
