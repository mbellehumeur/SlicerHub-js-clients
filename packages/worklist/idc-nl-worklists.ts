/**
 * Session-scoped IDC custom worklist orgs for the org <select>.
 */
export const WORKLIST_ORG_IDC_CUSTOM_PREFIX = 'idc-custom-';
export const IDC_CUSTOM_WORKLISTS_STORAGE_KEY =
  'pw46.worklist.idcCustomWorklists';

export type IdcCustomWorklistEntry = {
  organization: string;
  label: string;
  prompt?: string;
  createdAt?: number;
};

let customWorklists: IdcCustomWorklistEntry[] = [];

export function getIdcCustomWorklists(): IdcCustomWorklistEntry[] {
  return customWorklists;
}

export function isIdcCustomOrgValue(value: string): boolean {
  return String(value || '').startsWith(WORKLIST_ORG_IDC_CUSTOM_PREFIX);
}

export function loadIdcCustomWorklistsFromSession(): IdcCustomWorklistEntry[] {
  try {
    const raw = sessionStorage.getItem(IDC_CUSTOM_WORKLISTS_STORAGE_KEY);
    if (!raw) {
      customWorklists = [];
      return customWorklists;
    }
    const parsed = JSON.parse(raw);
    customWorklists = Array.isArray(parsed)
      ? parsed.filter(
          (e) =>
            e &&
            typeof e === 'object' &&
            String((e as IdcCustomWorklistEntry).organization || '').startsWith(
              WORKLIST_ORG_IDC_CUSTOM_PREFIX
            )
        )
      : [];
  } catch {
    customWorklists = [];
  }
  return customWorklists;
}

export function saveIdcCustomWorklistsToSession(): void {
  try {
    sessionStorage.setItem(
      IDC_CUSTOM_WORKLISTS_STORAGE_KEY,
      JSON.stringify(customWorklists)
    );
  } catch {
    // ignore quota / private mode
  }
}

export function ensureIdcCustomWorklistEntry(meta: {
  organization: string;
  label?: string;
  prompt?: string;
}): IdcCustomWorklistEntry | null {
  const org = String(meta.organization || '').trim();
  if (!org.startsWith(WORKLIST_ORG_IDC_CUSTOM_PREFIX)) return null;
  let entry = customWorklists.find((e) => e.organization === org);
  if (!entry) {
    entry = {
      organization: org,
      label: String(meta.label || org).trim() || org,
      prompt: meta.prompt,
      createdAt: Date.now(),
    };
    customWorklists.push(entry);
  } else {
    if (meta.label) entry.label = String(meta.label).trim() || entry.label;
    if (meta.prompt) entry.prompt = meta.prompt;
  }
  saveIdcCustomWorklistsToSession();
  return entry;
}

/** Append custom org options after the static ones; preserve current value. */
export function refreshOrgSelectWithCustomWorklists(
  select: HTMLSelectElement
): void {
  const current = select.value;
  select.querySelectorAll('option[data-idc-custom="1"]').forEach((n) => n.remove());
  for (const entry of customWorklists) {
    const opt = document.createElement('option');
    opt.value = entry.organization;
    opt.textContent = entry.label || entry.organization;
    opt.dataset.idcCustom = '1';
    select.append(opt);
  }
  if (
    current &&
    [...select.options].some((o) => o.value === current)
  ) {
    select.value = current;
  }
}
