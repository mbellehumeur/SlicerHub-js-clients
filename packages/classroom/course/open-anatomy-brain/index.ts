import type { CourseDefinition, Localized } from '../types';
import { OPEN_ANATOMY_BRAIN_EMBEDS } from './embeds';
import { openAnatomyBrainContentFor } from './strings';

const title: Localized = {
  en: 'Human brain anatomy',
  fr: 'Anatomie du cerveau humain',
};

export const openAnatomyBrainCourse: CourseDefinition = {
  id: 'open-anatomy-brain',
  title,
  terms: [],
  scans: [],
  embeds: OPEN_ANATOMY_BRAIN_EMBEDS,
  showScenePanel: false,
  contentFor: openAnatomyBrainContentFor,
};
