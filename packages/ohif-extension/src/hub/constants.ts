export const HUB_TOPIC_SESSION_KEY = 'ohif.hub.sessionTopic';
export const HUB_OHIF_PRODUCT_NAME = 'OHIF';
export const LOG_PREFIX = 'HubService(OHIF):';

/** Wire ``target.product.name`` for TotalSegmentator Hub subscribers. */
export const TOTAL_SEGMENTATOR_PRODUCT_NAME = 'TOTALSEG';

/** Wire ``target.product.name`` for lung screening Hub subscribers. */
export const LUNG_SCREENING_PRODUCT_NAME = 'LUNGSCREENING';

/** Wire ``target.product.name`` for neurosegmentation Hub subscribers. */
export const NEURO_SEG_PRODUCT_NAME = 'NEURO_SEG';

/** OHIF data source for Hub IDC direct bucket download (not DICOMweb). */
export const HUB_IDC_DATA_SOURCE = 'idc';

/** OHIF data source for Cast-ingested local DICOM (dicom-send, zip, etc.). */
export const HUB_LOCAL_DATA_SOURCE = 'dicomlocal';

/** OHIF data source for Cast imagingstudy-open DICOMweb (root from context). */
export const HUB_DICOMWEB_DATA_SOURCE = 'cast-dicomweb';
