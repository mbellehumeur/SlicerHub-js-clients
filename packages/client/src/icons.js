/**
 * Shared Hub connection radio mark (lucide-style radio waves).
 * Apps color it with currentColor and overlay .hub-radio-slash when offline.
 */

export const HUB_RADIO_ICON_CLASS = 'hub-radio-icon';

/** SVG markup; uses currentColor. Class: HUB_RADIO_ICON_CLASS. */
export const HUB_RADIO_ICON_SVG = `<svg class="${HUB_RADIO_ICON_CLASS}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>`;

export const HUB_RADIO_STATUS_ICON_CLASS = 'hub-radio-status-icon';
export const HUB_RADIO_SLASH_CLASS = 'hub-radio-slash';

/**
 * Shared Conferencing mark (lucide-style two people).
 * Apps color it with currentColor.
 */
export const HUB_CONFERENCE_ICON_CLASS = 'hub-conference-icon';

/** SVG markup; uses currentColor. Class: HUB_CONFERENCE_ICON_CLASS. */
export const HUB_CONFERENCE_ICON_SVG = `<svg class="${HUB_CONFERENCE_ICON_CLASS}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

/**
 * Icon + diagonal slash overlay for idle / disconnected / error.
 * @param {{ slashId?: string }} [options]
 * @returns {string} HTML
 */
export function castRadioStatusMarkup(options = {}) {
  const slashId = options.slashId || 'castRadioSlash';
  return `<span class="${HUB_RADIO_STATUS_ICON_CLASS}">${HUB_RADIO_ICON_SVG}<span id="${slashId}" class="${HUB_RADIO_SLASH_CLASS}" aria-hidden="true" hidden></span></span>`;
}

/**
 * Visual hints for the Hub radio status control.
 * @param {string} status connected | connecting | token-ready | error | disconnected | idle | …
 * @param {{ conferenceActive?: boolean }} [options]
 * @returns {{ showSlash: boolean, pulse: boolean, conferencePulse: boolean, tone: 'connected' | 'connecting' | 'error' | 'idle' }}
 */
export function castRadioStatusVisual(status, options = {}) {
  // conferenceActive is accepted for API stability; presence UI no longer blinks.
  void options?.conferenceActive;
  if (status === 'connected') {
    return {
      tone: 'connected',
      showSlash: false,
      pulse: false,
      conferencePulse: false,
    };
  }
  if (status === 'connecting' || status === 'token-ready') {
    return {
      tone: 'connecting',
      showSlash: false,
      pulse: true,
      conferencePulse: false,
    };
  }
  if (status === 'error' || status === 'disconnected') {
    return {
      tone: 'error',
      showSlash: true,
      pulse: false,
      conferencePulse: false,
    };
  }
  return {
    tone: 'idle',
    showSlash: true,
    pulse: false,
    conferencePulse: false,
  };
}
