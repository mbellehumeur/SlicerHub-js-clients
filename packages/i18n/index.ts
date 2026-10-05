export {
  type AppLocale,
  LOCALE_STORAGE_KEY,
  LEGACY_LOCALE_KEY,
  LOCALE_COOKIE,
  isAppLocale,
  resolveStoredLocale,
  persistLocale,
  applyDocumentLocale,
} from './storage';

export {
  APP_LOCALES,
  wireLanguagePicker,
  type WireLanguagePickerOpts,
} from './language-picker';

export {
  type ConferenceStrings,
  CONFERENCE_BY_LOCALE,
  conferenceStringsFor,
} from './conference';

export {
  type HeaderChrome,
  HEADER_BY_LOCALE,
  headerChromeFor,
  applyHeaderChrome,
} from './header';

export {
  type ReportingChrome,
  REPORTING_BY_LOCALE,
  reportingChromeFor,
  applyReportingChrome,
} from './reporting';

export {
  SEGMENT_LABELS_STATIC,
  translateTargetForLocale,
  segmentLabelCacheKey,
  segmentDisplayNameSync,
  ensureSegmentLabelsTranslated,
  segmentDisplayName,
  type SegmentLabelTerminology,
  type TranslateHubOptions,
} from './segment-labels';
