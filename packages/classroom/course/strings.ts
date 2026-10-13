/** Classroom course + conference chat chrome (EN/FR). */

export type CourseChrome = {
  headerTitle: string;
  course: string;
  volumesAndSegs: string;
  glossary: string;
  viewScan: string;
  scanMrHead: string;
  scanTotalSegCt: string;
  activityLabel: string;
  activityInstruction: string;
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
};

const en: CourseChrome = {
  headerTitle: 'ST-444 Anatomical terminology planes',
  course: 'Body planes',
  volumesAndSegs: 'Volumes & segmentations',
  glossary: 'Anatomical Planes Identification',
  viewScan: 'Open one of the studies to perform the plane identification activity',
  scanMrHead: 'Head',
  scanTotalSegCt: 'Thorax',
  activityLabel: 'Activity:',
  activityInstruction:
    'Use the brush tool (hotkey B) in the viewer to mark each anatomical plane and make a snapshot of each.',
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
  conferenceLog: 'Conference',
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
};

const fr: CourseChrome = {
  headerTitle: 'ST-444 Terminologie anatomique — plans',
  course: 'Plans anatomiques',
  volumesAndSegs: 'Volumes et segmentations',
  glossary: 'Identification des plans anatomiques',
  viewScan: 'Ouvrez une des études pour réaliser l’activité d’identification des plans',
  scanMrHead: 'Head',
  scanTotalSegCt: 'Thorax',
  activityLabel: 'Activité :',
  activityInstruction:
    'Utilisez l’outil pinceau (raccourci B) dans le visualiseur pour marquer chaque plan anatomique et en faire une capture.',
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
  conferenceLog: 'Conférence',
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
};

export function courseChromeFor(locale?: string): CourseChrome {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
