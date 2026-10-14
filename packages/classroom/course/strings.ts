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
  instructionSteps: [string, string, string];
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
    'Use the brush tool toggle key (hotkey B) in the viewer to mark each anatomical plane.',
    'Make a snapshot {{camera}} of each.',
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
  conferenceLog: 'Conference Chat',
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
    'Utilisez la touche bascule de l’outil pinceau (raccourci B) dans le visualiseur pour marquer chaque plan anatomique.',
    'Faites une capture {{camera}} de chacun.',
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
  conferenceLog: 'Chat de conférence',
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
};

export function courseChromeFor(locale?: string): CourseChrome {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
