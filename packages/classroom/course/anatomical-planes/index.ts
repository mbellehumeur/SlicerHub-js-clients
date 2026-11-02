import type { CourseDefinition, CourseScanButton, Localized } from '../types';
import { planesContentFor } from './strings';
import { DIRECTIONAL_TERMS } from './terms';

const title: Localized = {
  en: 'Anatomical Planes',
  fr: 'Plans anatomiques',
  de: 'Anatomische Ebenen',
};

const scans: CourseScanButton[] = [
  {
    sceneKey: 'kits-00038',
    label: {
      en: 'Thorax - small (19 MB)',
      fr: 'Thorax — petit (19 Mo)',
      de: 'Thorax — klein (19 MB)',
    },
    title: 'KiTS · c4kc kits · KiTS-00038',
  },
  {
    sceneKey: 'totalsegmentator-ct',
    label: {
      en: 'Thorax with segmentations - large (60 MB)',
      fr: 'Thorax avec segmentations — grand (60 Mo)',
      de: 'Thorax mit Segmentierungen — groß (60 MB)',
    },
    title: 'TotalSegmentator-CT',
  },
  {
    sceneKey: 'ctaabdomen-panoramix',
    label: {
      en: 'Abdomen, Pelvis - large (80 MB)',
      fr: 'Abdomen, pelvis — grand (80 Mo)',
      de: 'Abdomen, Becken — groß (80 MB)',
    },
    title: 'CTAAbdomenPanoramix',
  },
];

export const anatomicalPlanesCourse: CourseDefinition = {
  id: 'anatomical-planes',
  title,
  terms: DIRECTIONAL_TERMS,
  scans,
  contentFor: planesContentFor,
};

export { DIRECTIONAL_TERMS, termById } from './terms';
export { planesContentFor } from './strings';
