import type { CourseEmbed } from '../types';

/** FU Berlin MView TeachingPortal — CT 3D cat head. */
export const CAT_HEAD_IFRAME_SRC =
  'https://ks.vetmed.fu-berlin.de/MViewTeachingPortal/embed/431c5c0d-0581-4ad8-b3c2-708fd467b694?quickPreview=1&studyUid=1.2.840.113704.1.111.6232.1780654237.1&seriesUid=1.2.840.113704.1.111.6232.1780654493.14&sopUid=1.2.840.113704.1.111.3744.1780654636.14003&imageId=17102E10-5C94-4C4B-8F81-CD80CAE9C2D1&modality=CT&objectType=1&label=+&mode=3d&annotationSlot=default&showAnnotations=1&hideUi=panel%2Ctoolbar%2Cpatient%2Cfilmstrip';

export const CAT_HEAD_EMBEDS: ReadonlyArray<CourseEmbed> = [
  {
    id: 'cat-head-ct',
    iframeSrc: CAT_HEAD_IFRAME_SRC,
    iframeTitle: 'Cat head anatomy',
    openHref: CAT_HEAD_IFRAME_SRC,
    toolbar: 'mview',
  },
];
