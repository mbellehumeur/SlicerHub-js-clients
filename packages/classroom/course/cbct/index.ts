import type { CourseDefinition, Localized } from '../types';
import { cbctContentFor } from './strings';

const title: Localized = {
  en: 'Dental',
  fr: 'Dentaire',
  de: 'Zahnmedizin',
};

export const cbctCourse: CourseDefinition = {
  id: 'cbct',
  title,
  terms: [],
  scans: [],
  contentFor: cbctContentFor,
};
