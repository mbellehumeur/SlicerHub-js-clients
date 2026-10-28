import type { CourseDefinition, Localized } from '../types';
import { DOG_THORAX_EMBEDS } from './embeds';
import { dogThoraxContentFor } from './strings';

const title: Localized = {
  en: 'Dog Thorax/Abdomen anatomy',
  fr: 'Anatomie thorax/abdomen du chien',
};

export const dogThoraxAbdomenCourse: CourseDefinition = {
  id: 'dog-thorax-abdomen',
  title,
  terms: [],
  scans: [],
  embeds: DOG_THORAX_EMBEDS,
  showScenePanel: false,
  contentFor: dogThoraxContentFor,
};
