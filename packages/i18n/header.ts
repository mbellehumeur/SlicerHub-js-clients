import type { AppLocale } from './storage';
import { resolveStoredLocale } from './storage';

/** Header chrome shared by IRA / reporting (not worklist-specific Help). */
export type HeaderChrome = {
  worklistLabel: string;
  reportingLabel: string;
  slicerWorklist: string;
  slicerWorklistTitle: string;
  dicomSr: string;
  dicomSrTitle: string;
  remoteAi: string;
  remoteAiTitle: string;
  loadStudy: string;
  loadStudyTitle: string;
  sessionInfo: string;
  language: string;
};

const en: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Open SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Open DICOM SR Report Creator',
  remoteAi: 'Inference',
  remoteAiTitle: 'Inference — inference servers',
  loadStudy: 'Load study',
  loadStudyTitle: 'Load study',
  sessionInfo: 'Session info',
  language: 'Language',
};

const de: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'SlicerWorklist öffnen',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'DICOM-SR-Report-Creator öffnen',
  remoteAi: 'Remote-KI',
  remoteAiTitle: 'Remote-KI — Inferenzserver',
  loadStudy: 'Studie laden',
  loadStudyTitle: 'Studie laden',
  sessionInfo: 'Sitzungsinfo',
  language: 'Sprache',
};

const fr: HeaderChrome = {
  worklistLabel: 'Liste de travail :',
  reportingLabel: 'Reporting :',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Ouvrir SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Ouvrir le Report Creator DICOM SR',
  remoteAi: 'IA distante',
  remoteAiTitle: 'IA distante — serveurs d’inférence',
  loadStudy: 'Charger une étude',
  loadStudyTitle: 'Charger une étude',
  sessionInfo: 'Info session',
  language: 'Langue',
};

const es: HeaderChrome = {
  worklistLabel: 'Lista de trabajo:',
  reportingLabel: 'Informes:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Abrir SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Abrir el Report Creator DICOM SR',
  remoteAi: 'IA remota',
  remoteAiTitle: 'IA remota — servidores de inferencia',
  loadStudy: 'Cargar estudio',
  loadStudyTitle: 'Cargar estudio',
  sessionInfo: 'Info de sesión',
  language: 'Idioma',
};

const ca: HeaderChrome = {
  worklistLabel: 'Llista de treball:',
  reportingLabel: 'Informes:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Obrir SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Obrir el Report Creator DICOM SR',
  remoteAi: 'IA remota',
  remoteAiTitle: 'IA remota — servidors d’inferència',
  loadStudy: 'Carregar estudi',
  loadStudyTitle: 'Carregar estudi',
  sessionInfo: 'Info de sessió',
  language: 'Idioma',
};

const it: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Apri SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Apri il Report Creator DICOM SR',
  remoteAi: 'IA remota',
  remoteAiTitle: 'IA remota — server di inferenza',
  loadStudy: 'Carica studio',
  loadStudyTitle: 'Carica studio',
  sessionInfo: 'Info sessione',
  language: 'Lingua',
};

const pt: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Abrir SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Abrir o Report Creator DICOM SR',
  remoteAi: 'IA remota',
  remoteAiTitle: 'IA remota — servidores de inferência',
  loadStudy: 'Carregar estudo',
  loadStudyTitle: 'Carregar estudo',
  sessionInfo: 'Info da sessão',
  language: 'Idioma',
};

const ko: HeaderChrome = {
  worklistLabel: '워크리스트:',
  reportingLabel: '리포팅:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'SlicerWorklist 열기',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'DICOM SR Report Creator 열기',
  remoteAi: '원격 AI',
  remoteAiTitle: '원격 AI — 추론 서버',
  loadStudy: '검사 불러오기',
  loadStudyTitle: '검사 불러오기',
  sessionInfo: '세션 정보',
  language: '언어',
};

const pl: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Otwórz SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Otwórz Report Creator DICOM SR',
  remoteAi: 'Zdalne AI',
  remoteAiTitle: 'Zdalne AI — serwery wnioskowania',
  loadStudy: 'Wczytaj badanie',
  loadStudyTitle: 'Wczytaj badanie',
  sessionInfo: 'Info o sesji',
  language: 'Język',
};

const uk: HeaderChrome = {
  worklistLabel: 'Робочий список:',
  reportingLabel: 'Звітування:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Відкрити SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Відкрити Report Creator DICOM SR',
  remoteAi: 'Віддалений ШІ',
  remoteAiTitle: 'Віддалений ШІ — сервери висновку',
  loadStudy: 'Завантажити дослідження',
  loadStudyTitle: 'Завантажити дослідження',
  sessionInfo: 'Інформація про сеанс',
  language: 'Мова',
};

const cs: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Otevřít SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Otevřít Report Creator DICOM SR',
  remoteAi: 'Vzdálená AI',
  remoteAiTitle: 'Vzdálená AI — inferenční servery',
  loadStudy: 'Načíst studii',
  loadStudyTitle: 'Načíst studii',
  sessionInfo: 'Info o relaci',
  language: 'Jazyk',
};

const nl: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'SlicerWorklist openen',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'DICOM SR Report Creator openen',
  remoteAi: 'Externe AI',
  remoteAiTitle: 'Externe AI — inferentieservers',
  loadStudy: 'Studie laden',
  loadStudyTitle: 'Studie laden',
  sessionInfo: 'Sessie-info',
  language: 'Taal',
};

const el: HeaderChrome = {
  worklistLabel: 'Λίστα εργασίας:',
  reportingLabel: 'Αναφορές:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Άνοιγμα SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Άνοιγμα Report Creator DICOM SR',
  remoteAi: 'Απομακρυσμένη ΤΝ',
  remoteAiTitle: 'Απομακρυσμένη ΤΝ — διακομιστές συμπερασμού',
  loadStudy: 'Φόρτωση μελέτης',
  loadStudyTitle: 'Φόρτωση μελέτης',
  sessionInfo: 'Πληροφορίες συνεδρίας',
  language: 'Γλώσσα',
};

const lv: HeaderChrome = {
  worklistLabel: 'Darba saraksts:',
  reportingLabel: 'Ziņošana:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Atvērt SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Atvērt DICOM SR Report Creator',
  remoteAi: 'Attālais MI',
  remoteAiTitle: 'Attālais MI — secināšanas serveri',
  loadStudy: 'Ielādēt pētījumu',
  loadStudyTitle: 'Ielādēt pētījumu',
  sessionInfo: 'Sesijas info',
  language: 'Valoda',
};

const hu: HeaderChrome = {
  worklistLabel: 'Munkalista:',
  reportingLabel: 'Jelentés:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'SlicerWorklist megnyitása',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'DICOM SR Report Creator megnyitása',
  remoteAi: 'Távoli MI',
  remoteAiTitle: 'Távoli MI — következtető kiszolgálók',
  loadStudy: 'Vizsgálat betöltése',
  loadStudyTitle: 'Vizsgálat betöltése',
  sessionInfo: 'Munkamenet-infó',
  language: 'Nyelv',
};

const lt: HeaderChrome = {
  worklistLabel: 'Darbų sąrašas:',
  reportingLabel: 'Ataskaitos:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Atidaryti SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Atidaryti DICOM SR Report Creator',
  remoteAi: 'Nuotolinis DI',
  remoteAiTitle: 'Nuotolinis DI — išvadų serveriai',
  loadStudy: 'Įkelti tyrimą',
  loadStudyTitle: 'Įkelti tyrimą',
  sessionInfo: 'Sesijos info',
  language: 'Kalba',
};

const ro: HeaderChrome = {
  worklistLabel: 'Listă de lucru:',
  reportingLabel: 'Raportare:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Deschide SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Deschide Report Creator DICOM SR',
  remoteAi: 'IA la distanță',
  remoteAiTitle: 'IA la distanță — servere de inferență',
  loadStudy: 'Încarcă studiul',
  loadStudyTitle: 'Încarcă studiul',
  sessionInfo: 'Info sesiune',
  language: 'Limbă',
};

const noNb: HeaderChrome = {
  worklistLabel: 'Worklist:',
  reportingLabel: 'Reporting:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'Åpne SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'Åpne DICOM SR Report Creator',
  remoteAi: 'Ekstern AI',
  remoteAiTitle: 'Ekstern AI — inferensservere',
  loadStudy: 'Last studie',
  loadStudyTitle: 'Last studie',
  sessionInfo: 'Øktinfo',
  language: 'Språk',
};

const ar: HeaderChrome = {
  worklistLabel: 'قائمة العمل:',
  reportingLabel: 'التقارير:',
  slicerWorklist: 'SlicerWorklist',
  slicerWorklistTitle: 'فتح SlicerWorklist',
  dicomSr: 'DICOM SR',
  dicomSrTitle: 'فتح منشئ تقارير DICOM SR',
  remoteAi: 'ذكاء اصطناعي عن بُعد',
  remoteAiTitle: 'ذكاء اصطناعي عن بُعد — خوادم الاستدلال',
  loadStudy: 'تحميل دراسة',
  loadStudyTitle: 'تحميل دراسة',
  sessionInfo: 'معلومات الجلسة',
  language: 'اللغة',
};

export const HEADER_BY_LOCALE: Record<AppLocale, HeaderChrome> = {
  en,
  ar,
  fr,
  es,
  ca,
  de,
  it,
  pt,
  ko,
  pl,
  uk,
  cs,
  nl,
  el,
  lv,
  hu,
  lt,
  ro,
  no: noNb,
};

export function headerChromeFor(locale?: AppLocale): HeaderChrome {
  const code = locale || resolveStoredLocale();
  return { ...HEADER_BY_LOCALE[code] };
}

/** Apply [data-i18n-header="key"] text/title/aria from HeaderChrome. */
export function applyHeaderChrome(
  root: ParentNode = document,
  locale?: AppLocale
): void {
  const h = headerChromeFor(locale);
  root.querySelectorAll<HTMLElement>('[data-i18n-header]').forEach((el) => {
    const key = el.getAttribute('data-i18n-header') as keyof HeaderChrome | null;
    if (!key || !(key in h)) return;
    el.textContent = h[key];
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-header-title]').forEach((el) => {
    const key = el.getAttribute(
      'data-i18n-header-title'
    ) as keyof HeaderChrome | null;
    if (!key || !(key in h)) return;
    el.title = h[key];
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-header-aria]').forEach((el) => {
    const key = el.getAttribute(
      'data-i18n-header-aria'
    ) as keyof HeaderChrome | null;
    if (!key || !(key in h)) return;
    el.setAttribute('aria-label', h[key]);
  });
}
