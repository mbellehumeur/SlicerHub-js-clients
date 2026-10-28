import type { CourseDefinition, Localized } from '../types';
import { cbctContentFor } from './strings';

const title: Localized = {
  en: 'Dental',
  fr: 'Dentaire',
};

export const cbctCourse: CourseDefinition = {
  id: 'cbct',
  title,
  terms: [],
  scans: [],
  contentFor: cbctContentFor,
};
