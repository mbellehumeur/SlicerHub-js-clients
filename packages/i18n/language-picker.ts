import type { AppLocale } from './storage';

export const APP_LOCALES: readonly {
  code: AppLocale;
  nativeLabel: string;
}[] = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'fr', nativeLabel: 'Français' },
  { code: 'ar', nativeLabel: 'العربية' },
  { code: 'es', nativeLabel: 'Español' },
  { code: 'ca', nativeLabel: 'Català' },
  { code: 'de', nativeLabel: 'Deutsch' },
  { code: 'it', nativeLabel: 'Italiano' },
  { code: 'pt', nativeLabel: 'Português' },
  { code: 'ko', nativeLabel: '한국어' },
  { code: 'pl', nativeLabel: 'Polski' },
  { code: 'uk', nativeLabel: 'Українська' },
  { code: 'cs', nativeLabel: 'Čeština' },
  { code: 'nl', nativeLabel: 'Nederlands' },
  { code: 'el', nativeLabel: 'Ελληνικά' },
  { code: 'lv', nativeLabel: 'Latviešu' },
  { code: 'hu', nativeLabel: 'Magyar' },
  { code: 'lt', nativeLabel: 'Lietuvių' },
  { code: 'ro', nativeLabel: 'Română' },
  { code: 'no', nativeLabel: 'Norsk' },
];

export type WireLanguagePickerOpts = {
  btnId?: string;
  menuId?: string;
  getLocale: () => AppLocale;
  setLocale: (code: AppLocale) => void | Promise<void>;
};

/** Globe button + locale listbox; same UX as worklist. */
export function wireLanguagePicker(opts: WireLanguagePickerOpts): void {
  const btnId = opts.btnId ?? 'langPickerBtn';
  const menuId = opts.menuId ?? 'langPickerMenu';
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  if (!(btn instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
    return;
  }

  const renderMenu = () => {
    const current = opts.getLocale();
    menu.replaceChildren();
    for (const { code, nativeLabel } of APP_LOCALES) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.locale = code;
      li.textContent = nativeLabel;
      li.classList.toggle('is-active', code === current);
      li.setAttribute('aria-selected', code === current ? 'true' : 'false');
      menu.appendChild(li);
    }
  };

  const closeMenu = () => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    renderMenu();
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  menu.addEventListener('click', (ev) => {
    const li = (ev.target as HTMLElement | null)?.closest('li[data-locale]');
    if (!(li instanceof HTMLElement)) return;
    const code = li.dataset.locale as AppLocale | undefined;
    if (!code) return;
    void Promise.resolve(opts.setLocale(code)).then(() => {
      closeMenu();
    });
  });

  document.addEventListener('click', (ev) => {
    if (menu.hidden) return;
    const target = ev.target as Node | null;
    if (btn.contains(target) || menu.contains(target)) return;
    closeMenu();
  });

  renderMenu();
}
