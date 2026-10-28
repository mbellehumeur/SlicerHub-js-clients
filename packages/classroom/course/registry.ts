import { anatomicalPlanesCourse } from './anatomical-planes';
import { catHeadAnatomyCourse } from './cat-head-anatomy';
import { cbctCourse } from './cbct';
import { cellStructuresCourse } from './cell-structures';
import { dogThoraxAbdomenCourse } from './dog-thorax-abdomen';
import { openAnatomyBrainCourse } from './open-anatomy-brain';
import type { CourseDefinition, CourseId, CourseTerm } from './types';

export type { CourseDefinition, CourseId, CourseTerm } from './types';
export { coursePanelVisibility, pickLocale } from './types';

export const DEFAULT_COURSE_ID: CourseId = 'anatomical-planes';

/** Ordered list for the course dropdown. */
export const COURSES: CourseDefinition[] = [
  anatomicalPlanesCourse,
  catHeadAnatomyCourse,
  dogThoraxAbdomenCourse,
  openAnatomyBrainCourse,
  cellStructuresCourse,
  cbctCourse,
];

const byId = new Map<CourseId, CourseDefinition>(
  COURSES.map((c) => [c.id, c])
);

export function getCourse(id: string | null | undefined): CourseDefinition {
  if (id && byId.has(id as CourseId)) return byId.get(id as CourseId)!;
  return byId.get(DEFAULT_COURSE_ID)!;
}

export function isCourseId(id: string): id is CourseId {
  return byId.has(id as CourseId);
}

export function termByIdInCourse(
  course: CourseDefinition,
  termId: string
): CourseTerm | undefined {
  return course.terms.find((t) => t.id === termId);
}
