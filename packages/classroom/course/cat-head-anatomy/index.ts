import type { CourseDefinition, Localized } from '../types';
import { CAT_HEAD_EMBEDS } from './embeds';
import { catHeadContentFor } from './strings';

const title: Localized = {
  en: 'Cat head anatomy',
  fr: 'Anatomie tête de chat',
};

export const catHeadAnatomyCourse: CourseDefinition = {
  id: 'cat-head-anatomy',
  title,
  terms: [],
  scans: [],
  embeds: CAT_HEAD_EMBEDS,
  showScenePanel: false,
  contentFor: catHeadContentFor,
};
