/** Anatomical planes course content chrome (EN/FR). */

import type { CourseContent } from '../types';

const BONUS_ENDO_URL = 'https://pieper.github.io/live/webgpu/endo.html';
const BONUS_CREDIT_SLICERHEART_URL =
  'https://github.com/SlicerHeart/SlicerHeart';
const BONUS_CREDIT_JACC_URL =
  'https://doi.org/10.1016/j.jaccas.2024.102827';
const BONUS_CREDIT_RADIOL_URL = 'https://doi.org/10.1148/ryct.250129';
const BONUS_CREDIT_SOURCE_URL = 'https://github.com/pieper/SlicerLive';

const en: CourseContent = {
  headerTitle: 'Anatomical Planes',
  course: 'Anatomical planes',
  glossary: 'Anatomical Planes',
  intro:
    'Anatomical planes are imaginary flat surfaces used to describe locations and sections of the body in anatomy and medical imaging. The three planes most commonly used are the sagittal, frontal (coronal), and transverse (axial) planes.',
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
  colTerm: 'Plane',
  colDefinition: 'Definition',
  colExamples: 'Example(s)',
  relativeDemoNote: 'Discuss this plane on the live volume in IRA.',
  figureSrc: 'assets/planes-of-body-labeled.jpg',
  figureAlt:
    'Anatomical planes of the body: sagittal, frontal (coronal), and transverse',
  figureCredit: 'OpenStax Anatomy & Physiology / CC BY 4.0',
  figureCreditHref: 'https://creativecommons.org/licenses/by/4.0/',
  figureWidth: 619,
  figureHeight: 635,
  viewerFigureSrc: 'assets/screenshot-viewer.jpg',
  viewerFigureAlt:
    'Viewer screenshot with brush marks for sagittal, frontal, and transverse planes',
  viewerFigureWidth: 1431,
  viewerFigureHeight: 846,
  letterLabels: true,
  bonus: {
    title: 'Bonus',
    pitch:
      'Fly a camera through the aorta: contrast-filled blood is transparent so you can travel the aorta and heart chambers with no segmentation or centreline.',
    link: 'Open endovascular flythrough',
    linkHref: BONUS_ENDO_URL,
    controls: [
      { key: 'Space', action: 'forward cruise on/off' },
      { key: 'Shift+Space', action: 'reverse' },
      { key: 'Left-drag / arrow keys', action: 'look around' },
      { key: 'Shift+click', action: 'set autopilot target' },
    ],
    figureSrc: 'assets/Screenshot-fly-through.png',
    figureAlt:
      'Endovascular flythrough through transverse planes of the aorta',
    credits: [
      { label: 'SlicerHeart', href: BONUS_CREDIT_SLICERHEART_URL },
      { label: 'JACC 2025 (CT/VSD)', href: BONUS_CREDIT_JACC_URL },
      { label: 'Radiol CT Imaging 2026 (4D)', href: BONUS_CREDIT_RADIOL_URL },
      { label: 'source', href: BONUS_CREDIT_SOURCE_URL },
    ],
  },
};

const fr: CourseContent = {
  headerTitle: 'Plans anatomiques',
  course: 'Plans anatomiques',
  glossary: 'Plans anatomiques',
  intro:
    'Les plans anatomiques sont des surfaces planes imaginaires utilisées pour décrire la localisation et les coupes du corps en anatomie et en imagerie médicale. Les trois plans les plus couramment utilisés sont les plans sagittal, frontal (coronal) et transversal (axial).',
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
  colTerm: 'Plan',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: 'Discutez de ce plan sur le volume dans IRA.',
  figureSrc: 'assets/planes-of-body-labeled.jpg',
  figureAlt:
    'Plans anatomiques du corps : sagittal, frontal (coronal) et transversal',
  figureCredit: 'OpenStax Anatomy & Physiology / CC BY 4.0',
  figureCreditHref: 'https://creativecommons.org/licenses/by/4.0/',
  figureWidth: 619,
  figureHeight: 635,
  viewerFigureSrc: 'assets/screenshot-viewer.jpg',
  viewerFigureAlt:
    'Capture du visualiseur avec des marques au pinceau pour les plans sagittal, frontal et transversal',
  viewerFigureWidth: 1431,
  viewerFigureHeight: 846,
  letterLabels: true,
  bonus: {
    title: 'Bonus',
    pitch:
      'Faites voler une caméra dans l’aorte : le sang rempli de contraste est transparent, ce qui permet de parcourir l’aorte et les cavités cardiaques sans segmentation ni ligne centrale.',
    link: 'Ouvrir le survol endovasculaire',
    linkHref: BONUS_ENDO_URL,
    controls: [
      { key: 'Espace', action: 'croisière avant marche/arrêt' },
      { key: 'Maj+Espace', action: 'marche arrière' },
      { key: 'Glisser gauche / flèches', action: 'regarder autour' },
      { key: 'Maj+clic', action: 'cible du pilote automatique' },
    ],
    figureSrc: 'assets/Screenshot-fly-through.png',
    figureAlt:
      'Survol endovasculaire des plans transversaux de l’aorte',
    credits: [
      { label: 'SlicerHeart', href: BONUS_CREDIT_SLICERHEART_URL },
      { label: 'JACC 2025 (CT/VSD)', href: BONUS_CREDIT_JACC_URL },
      { label: 'Radiol CT Imaging 2026 (4D)', href: BONUS_CREDIT_RADIOL_URL },
      { label: 'code source', href: BONUS_CREDIT_SOURCE_URL },
    ],
  },
};

export function planesContentFor(locale?: string): CourseContent {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
