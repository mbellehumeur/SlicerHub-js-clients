import type { CourseEmbed } from '../types';

/** Open Anatomy Browser — SPL/NAC Brain atlas. */
export const OPEN_ANATOMY_BRAIN_IFRAME_SRC =
  'https://www.openanatomy.org/atlases/nac/brain-2017-01/viewer/';

export const OPEN_ANATOMY_BRAIN_EMBEDS: ReadonlyArray<CourseEmbed> = [
  {
    id: 'open-anatomy-brain',
    iframeSrc: OPEN_ANATOMY_BRAIN_IFRAME_SRC,
    iframeTitle: 'Human brain anatomy',
    openHref: OPEN_ANATOMY_BRAIN_IFRAME_SRC,
  },
];
