import type { CourseEmbed } from '../types';

/** FU Berlin MView TeachingPortal — dog thorax/abdomen DX. */
export const DOG_THORAX_IFRAME_SRC =
  'https://ks.vetmed.fu-berlin.de/MViewTeachingPortal/embed/73e142d1-eaca-465d-9377-5ea165c9fd98?quickPreview=1&studyUid=1.3.46.670589.30.1.3.1.966169909467.1782036294515.1&seriesUid=1.3.46.670589.30.1.3.1.966169909467.1782037067437.1&sopUid=1.3.46.670589.30.1.3.1.966169909467.1782037067359.2&imageId=5C465E16-4DA1-431C-B7E0-07995DA1D4A7&modality=DX&objectType=1&label=CHEST&mode=2d&annotationSlot=demo-dx-abdomen-becken&showAnnotations=1&hideUi=panel%2Ctoolbar%2Cpatient%2Ccontrols%2Cfilmstrip';

export const DOG_THORAX_EMBEDS: ReadonlyArray<CourseEmbed> = [
  {
    id: 'dog-thorax-dx',
    iframeSrc: DOG_THORAX_IFRAME_SRC,
    iframeTitle: 'Dog Thorax/Abdomen anatomy',
    openHref: DOG_THORAX_IFRAME_SRC,
    toolbar: 'mview',
  },
];
