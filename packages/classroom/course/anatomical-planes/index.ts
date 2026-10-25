import type { CourseDefinition, CourseScanButton, Localized } from '../types';
import { planesContentFor } from './strings';
import { DIRECTIONAL_TERMS } from './terms';

const title: Localized = {
  en: 'Anatomical Planes',
  fr: 'Plans anatomiques',
};

const scans: CourseScanButton[] = [
  {
    sceneKey: 'mrhead',
    label: { en: 'Head (8 MB)', fr: 'Tête (8 Mo)' },
  },
  {
    sceneKey: 'kits-00038',
    label: { en: 'Thorax - small (19 MB)', fr: 'Thorax — petit (19 Mo)' },
    title: 'KiTS · c4kc kits · KiTS-00038',
  },
  {
    sceneKey: 'totalsegmentator-ct',
    label: { en: 'Thorax - large (60 MB)', fr: 'Thorax — grand (60 Mo)' },
    title: 'TotalSegmentator-CT',
  },
  {
    sceneKey: 'ctaabdomen-panoramix',
    label: {
      en: 'Abdomen, Pelvis - large (80 MB)',
      fr: 'Abdomen, pelvis — grand (80 Mo)',
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
