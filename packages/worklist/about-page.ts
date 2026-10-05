/**
 * Standalone About page entry (about.html → about.js).
 * Keeps acknowledgements / license content out of the worklist ? Help modal.
 */
import { mountAboutPage } from './about-content';
import { THEME_SLICERLIVE, setStoredTheme } from './config';

document.documentElement.dataset.theme = THEME_SLICERLIVE;
setStoredTheme(THEME_SLICERLIVE);

void mountAboutPage();
