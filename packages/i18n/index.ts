export type { AppLocale } from './storage';
export {
  LOCALE_STORAGE_KEY,
  LEGACY_LOCALE_KEY,
  LOCALE_COOKIE,
  isAppLocale,
  appLocaleToOhifLng,
  ohifLngToAppLocale,
  resolveStoredLocale,
  persistLocale,
  applyDocumentLocale,
} from './storage';

export type { WireLanguagePickerOpts } from './language-picker';
export { APP_LOCALES, wireLanguagePicker } from './language-picker';

export type { ConferenceStrings } from './conference';
export {
  CONFERENCE_BY_LOCALE,
  conferenceStringsFor,
} from './conference';

export type { HeaderChrome } from './header';
export {
  HEADER_BY_LOCALE,
  headerChromeFor,
  applyHeaderChrome,
} from './header';

export type { ReportingChrome } from './reporting';
export {
  REPORTING_BY_LOCALE,
  reportingChromeFor,
  applyReportingChrome,
} from './reporting';

export type {
  SegmentLabelTerminology,
  TranslateHubOptions,
} from './segment-labels';
export {
  SEGMENT_LABELS_STATIC,
  translateTargetForLocale,
  segmentLabelCacheKey,
  segmentDisplayNameSync,
  ensureSegmentLabelsTranslated,
  segmentDisplayName,
} from './segment-labels';
