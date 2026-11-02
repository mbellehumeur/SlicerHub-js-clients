import type { CourseDefinition, Localized } from '../types';
import { cellStructuresContentFor } from './strings';

const title: Localized = {
  en: 'Cell Structures',
  fr: 'Structures cellulaires',
  de: 'Zellstrukturen',
};

export const cellStructuresCourse: CourseDefinition = {
  id: 'cell-structures',
  title,
  terms: [],
  scans: [],
  contentFor: cellStructuresContentFor,
};
