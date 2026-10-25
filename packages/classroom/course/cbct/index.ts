import type { CourseDefinition, Localized } from '../types';
import { cbctContentFor } from './strings';

const title: Localized = {
  en: 'CBCT',
  fr: 'CBCT',
};

export const cbctCourse: CourseDefinition = {
  id: 'cbct',
  title,
  terms: [],
  scans: [],
  contentFor: cbctContentFor,
};
