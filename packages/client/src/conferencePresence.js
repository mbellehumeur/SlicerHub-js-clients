/**
 * Shared conference header presence: decorate the Hub user capsule and
 * optionally render participant chips or an anchored participants popover.
 */

import { mergeCastConferenceStrings } from './conferenceStrings.js';

/**
 * @param {string} prefix
 * @param {string} part
 */
function cls(prefix, part) {
  return `${prefix}-${part}`;
}

/**
 * @param {import('./index.d.ts').CastConferenceView | null | undefined} view
 * @returns {import('./index.d.ts').CastConferencePlace | null}
 */
export function castConferenceLeaderPlace(view) {
  if (!view?.places?.length) return null;
  const byFlag = view.places.find((p) => p && p.isLeading);
  if (byFlag) return byFlag;
  const id = String(view.leadingPlaceId || '').trim();
  if (!id) return null;
  return (
    view.places.find(
      (p) =>
        p &&
        (p.placeId === id || p.placeId.toLowerCase() === id.toLowerCase())
    ) || null
  );
}

/**
 * Status text on a place chip, with local follow/apply overlay.
 * @param {{ isFollowing?: boolean, statusLabel?: string } | null | undefined} place
 * @param {boolean} followHost
 */
export function castConferencePlaceStatusLabel(place, followHost = true) {
  if (place?.isFollowing) {
    return followHost ? 'Following' : 'Skipping';
  }
  return String(place?.statusLabel || '').trim();
}

/**
 * @param {{ isSelf?: boolean, isLeading?: boolean, statusLabel?: string } | null | undefined} place
 * @param {'leading' | 'following' | string | null | undefined} selfRole
 * @param {'short' | 'full'} mode
 * @param {boolean} [followHost]
 * @param {string} [leaderLabel]
 */
export function castConferenceSelfStatusLabel(
  place,
  selfRole,
  mode = 'short',
  followHost = true,
  leaderLabel = ''
) {
  const role =
    selfRole === 'leading' || selfRole === 'following'
      ? selfRole
      : place?.isLeading
        ? 'leading'
        : 'following';
  if (role === 'leading') {
    return mode === 'full' ? 'You · leading' : 'Leading';
  }
  const leader = String(leaderLabel || '').trim();
  if (!followHost) {
    if (leader) return `Skipping ${leader}`;
    return mode === 'full' ? 'You · skipping' : 'Skipping';
  }
  if (leader) return `Following ${leader}`;
  if (mode === 'full') {
    const fromPlace = String(place?.statusLabel || '').trim();
    if (fromPlace) return fromPlace;
    return 'You';
  }
  return 'Following';
}

/**
 * Status string for one roster row (popup or chip), viewer-relative.
 * @param {import('./index.d.ts').CastConferencePlace | null | undefined} place
 * @param {import('./index.d.ts').CastConferenceView | null | undefined} view
 * @param {boolean} [followHost]
 */
export function castConferenceParticipantRowStatus(
  place,
  view,
  followHost = true
) {
  if (!place) return '';
  if (place.isSelf) {
    const leader = castConferenceLeaderPlace(view);
    return castConferenceSelfStatusLabel(
      place,
      view?.selfRole,
      'short',
      followHost,
      leader && !leader.isSelf ? leader.label : ''
    );
  }
  return castConferencePlaceStatusLabel(place, followHost);
}

/**
 * @param {HTMLElement} statusControl
 * @param {string} statusClassPrefix
 */
function clearStatusConference(statusControl, statusClassPrefix) {
  statusControl.classList.remove(statusClassPrefix, `${statusClassPrefix}-leading`);
  const roleEl = statusControl.querySelector('[data-hub-conference-role]');
  if (roleEl instanceof HTMLElement) {
    roleEl.hidden = true;
    roleEl.textContent = '';
  }
}

/**
 * @param {HTMLElement} host
 * @param {import('./index.d.ts').CastConferenceView} view
 * @param {string} classPrefix
 * @param {boolean} followHost
 * @param {boolean} includeSelf
 */
function appendParticipantRows(host, view, classPrefix, followHost, includeSelf) {
  const places = (view.places || []).filter((p) => p && (includeSelf || !p.isSelf));
  for (const place of places) {
    const chip = document.createElement('div');
    chip.className = cls(classPrefix, 'chip');
    chip.setAttribute('role', 'listitem');
    if (place.isSelf) chip.classList.add(cls(classPrefix, 'chip-self'));
    if (place.isLeading) chip.classList.add(cls(classPrefix, 'chip-leading'));
    if (place.isFollowing) {
      chip.classList.add(cls(classPrefix, 'chip-following'));
      if (!followHost) chip.classList.add(cls(classPrefix, 'chip-skipping'));
    }

    const statusText = castConferenceParticipantRowStatus(
      place,
      view,
      followHost
    );
    const name = document.createElement('span');
    name.className = cls(classPrefix, 'chip-name');
    name.textContent = place.label;
    const tip = [place.label, statusText, place.placeId]
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .join(' — ');
    name.title = tip;
    chip.title = tip;
    chip.append(name);

    if (statusText) {
      const status = document.createElement('span');
      status.className = cls(classPrefix, 'chip-status');
      status.textContent = statusText;
      chip.append(status);
    }

    host.append(chip);
  }
}

/**
 * @param {object} options
 * @param {import('./index.d.ts').CastConferenceView | null | undefined} options.view
 * @param {HTMLElement} options.statusControl
 * @param {HTMLElement | null} [options.statusLabelEl]
 * @param {HTMLElement | null} [options.chipsHost] optional; omit to skip header chips
 * @param {string} options.classPrefix
 * @param {string} [options.statusClassPrefix]
 * @param {'short' | 'full'} [options.selfStatusMode]
 * @param {boolean} [options.followHost] when false, leader/self show Skipping (default true)
 */
export function renderCastConferencePresence(options) {
  const view = options?.view ?? null;
  const statusControl = options?.statusControl;
  const chipsHost =
    options?.chipsHost instanceof HTMLElement ? options.chipsHost : null;
  const classPrefix = String(options?.classPrefix || 'hub-conference').trim() || 'hub-conference';
  const statusClassPrefix =
    String(options?.statusClassPrefix || cls(classPrefix, 'user')).trim() ||
    cls(classPrefix, 'user');
  const selfStatusMode = options?.selfStatusMode === 'full' ? 'full' : 'short';
  const followHost = options?.followHost !== false;
  const roleClass = cls(classPrefix, 'chip-status');

  if (!(statusControl instanceof HTMLElement)) {
    return;
  }

  const active = Boolean(view?.places?.length);
  if (!active) {
    clearStatusConference(statusControl, statusClassPrefix);
    if (chipsHost) {
      chipsHost.replaceChildren();
      chipsHost.hidden = true;
    }
    closeCastConferenceParticipantsPopup();
    return;
  }

  const selfPlace = view.places.find((p) => p && p.isSelf) || null;
  const leaderPlace = castConferenceLeaderPlace(view);
  const leading = view.selfRole === 'leading' || Boolean(selfPlace?.isLeading);
  const leaderLabel =
    leaderPlace && !leaderPlace.isSelf
      ? String(leaderPlace.label || '').trim()
      : '';

  statusControl.classList.add(statusClassPrefix);
  statusControl.classList.toggle(`${statusClassPrefix}-leading`, leading);

  let roleEl = statusControl.querySelector('[data-hub-conference-role]');
  if (!(roleEl instanceof HTMLElement)) {
    roleEl = document.createElement('span');
    roleEl.dataset.hubConferenceRole = '1';
    statusControl.append(roleEl);
  }
  roleEl.className = roleClass;
  roleEl.hidden = false;
  roleEl.textContent = castConferenceSelfStatusLabel(
    selfPlace,
    view.selfRole,
    selfStatusMode,
    followHost,
    leaderLabel
  );

  if (!chipsHost) {
    return;
  }

  chipsHost.replaceChildren();
  const others = view.places.filter((p) => p && !p.isSelf);
  if (!others.length) {
    chipsHost.hidden = true;
    return;
  }
  chipsHost.hidden = false;
  appendParticipantRows(chipsHost, view, classPrefix, followHost, false);
}

/** @type {{ panel: HTMLElement, cleanup: () => void } | null} */
let activeParticipantsPopup = null;

export function closeCastConferenceParticipantsPopup() {
  if (!activeParticipantsPopup) return;
  activeParticipantsPopup.cleanup();
  activeParticipantsPopup = null;
}

export function isHubConferenceParticipantsPopupOpen() {
  return Boolean(activeParticipantsPopup);
}

/**
 * Anchored participants popover (no Session info action).
 * Toggle: calling again with the same anchor closes it.
 * @param {object} options
 * @param {HTMLElement} options.anchor
 * @param {import('./index.d.ts').CastConferenceView | null | undefined} options.view
 * @param {boolean} [options.followHost]
 * @param {string} [options.classPrefix]
 * @param {ParentNode} [options.root]
 * @returns {{ close: () => void, open: boolean }}
 */
export function openHubConferenceParticipantsPopup(options) {
  const anchor = options?.anchor;
  const view = options?.view ?? null;
  const followHost = options?.followHost !== false;
  const classPrefix =
    String(options?.classPrefix || 'hub-conference').trim() || 'hub-conference';
  const root = options?.root || (typeof document !== 'undefined' ? document.body : null);

  if (!(anchor instanceof HTMLElement) || !root || !view?.places?.length) {
    closeCastConferenceParticipantsPopup();
    return { close: closeCastConferenceParticipantsPopup, open: false };
  }

  if (activeParticipantsPopup) {
    const wasForAnchor = activeParticipantsPopup.panel.__castAnchor === anchor;
    closeCastConferenceParticipantsPopup();
    if (wasForAnchor) {
      return { close: closeCastConferenceParticipantsPopup, open: false };
    }
  }

  const panel = document.createElement('div');
  panel.className = cls(classPrefix, 'participants-popup');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Conference participants');
  panel.dataset.castParticipantsPopup = '1';
  panel.__castAnchor = anchor;

  const title = document.createElement('div');
  title.className = cls(classPrefix, 'participants-popup-title');
  title.textContent = 'Participants';
  panel.append(title);

  const list = document.createElement('div');
  list.className = cls(classPrefix, 'participants-popup-list');
  list.setAttribute('role', 'list');
  appendParticipantRows(list, view, classPrefix, followHost, true);
  panel.append(list);

  root.appendChild(panel);

  const place = () => {
    const rect = anchor.getBoundingClientRect();
    const pad = 6;
    const width = Math.max(220, Math.min(320, panel.offsetWidth || 260));
    let left = rect.left;
    let top = rect.bottom + pad;
    const maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    if (top + panel.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - panel.offsetHeight - pad);
    }
    panel.style.position = 'fixed';
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
    panel.style.zIndex = '10030';
    panel.style.minWidth = '220px';
    panel.style.maxWidth = '320px';
  };
  place();

  const onDocPointer = (ev) => {
    const t = ev.target;
    if (!(t instanceof Node)) return;
    if (panel.contains(t) || anchor.contains(t)) return;
    closeCastConferenceParticipantsPopup();
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') closeCastConferenceParticipantsPopup();
  };
  const onResize = () => place();

  // Defer outside-click so the opening click does not immediately close.
  const bindTimer = window.setTimeout(() => {
    document.addEventListener('pointerdown', onDocPointer, true);
  }, 0);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', onResize);

  const cleanup = () => {
    window.clearTimeout(bindTimer);
    document.removeEventListener('pointerdown', onDocPointer, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    panel.remove();
  };

  activeParticipantsPopup = { panel, cleanup };
  requestAnimationFrame(place);

  return { close: closeCastConferenceParticipantsPopup, open: true };
}

/**
 * Pure visibility / labels for Start, Leave/End, Stop, Resume, Take over.
 * Single source for worklist, reporting, and IRA headers.
 *
 * @param {{
 *   view?: import('./index.d.ts').CastConferenceView | null,
 *   followHost?: boolean,
 *   connected?: boolean,
 *   strings?: Partial<import('./conferenceStrings.js').CastConferenceStrings>,
 * }} [options]
 */
export function resolveHubConferenceHeaderActions(options = {}) {
  const s = mergeCastConferenceStrings(options.strings);
  const view = options.view ?? null;
  const followHost = Boolean(options.followHost);
  const connected = Boolean(options.connected);
  const active = Boolean(view?.places?.length);
  const leading = view?.selfRole === 'leading';
  const hostAction = Boolean(view?.isConferenceOwner);
  const leaveLabel = hostAction ? s.endConference : s.leaveConference;
  const showStop = active && !leading && followHost;
  const showSkipActions = active && !leading && !followHost;
  const startTitle = connected ? s.conferencing : s.subscribeHubFirst;

  return {
    active,
    start: {
      // Keep Conferencing available while active so User/topic + Manage stay reachable.
      hidden: false,
      disabled: !connected,
      label: s.conferencing,
      title: startTitle,
      ariaLabel: s.conferencing,
    },
    leave: {
      hidden: !active,
      disabled: !connected || !active,
      label: leaveLabel,
      title: leaveLabel,
      ariaLabel: leaveLabel,
    },
    stopFollowing: {
      hidden: !showStop,
      label: s.stopFollowing,
      title: s.stopFollowing,
      ariaLabel: s.stopFollowing,
    },
    resumeFollowing: {
      hidden: !showSkipActions,
      label: s.resumeFollowing,
      title: s.resumeFollowing,
      ariaLabel: s.resumeFollowing,
    },
    takeOver: {
      hidden: !showSkipActions,
      disabled: !connected || !showSkipActions,
      label: s.takeOver,
      title: s.takeOver,
      ariaLabel: s.takeOver,
    },
  };
}

/**
 * @param {HTMLButtonElement | HTMLElement | null | undefined} btn
 * @param {{
 *   hidden?: boolean,
 *   disabled?: boolean,
 *   label?: string,
 *   title?: string,
 *   ariaLabel?: string,
 * }} state
 */
function applyConferenceHeaderButton(btn, state) {
  if (!(btn instanceof HTMLElement)) return;
  if (typeof state.hidden === 'boolean') {
    btn.hidden = state.hidden;
  }
  if (typeof state.disabled === 'boolean' && 'disabled' in btn) {
    /** @type {HTMLButtonElement} */ (btn).disabled = state.disabled;
    if (!state.disabled) {
      btn.removeAttribute('disabled');
    }
  }
  if (typeof state.label === 'string') {
    btn.textContent = state.label;
  }
  if (typeof state.title === 'string') {
    btn.title = state.title;
  }
  if (typeof state.ariaLabel === 'string') {
    btn.setAttribute('aria-label', state.ariaLabel);
  }
}

/**
 * Apply Start / Leave / Stop / Resume / Take over button state from conference view.
 * Pass only the elements that exist; null/undefined are skipped.
 *
 * @param {{
 *   view?: import('./index.d.ts').CastConferenceView | null,
 *   followHost?: boolean,
 *   connected?: boolean,
 *   startBtn?: HTMLButtonElement | HTMLElement | null,
 *   endBtn?: HTMLButtonElement | HTMLElement | null,
 *   stopFollowBtn?: HTMLButtonElement | HTMLElement | null,
 *   resumeFollowBtn?: HTMLButtonElement | HTMLElement | null,
 *   takeOverBtn?: HTMLButtonElement | HTMLElement | null,
 *   strings?: Partial<import('./conferenceStrings.js').CastConferenceStrings>,
 * }} [options]
 * @returns {ReturnType<typeof resolveHubConferenceHeaderActions>}
 */
export function applyCastConferenceHeaderActions(options = {}) {
  const actions = resolveHubConferenceHeaderActions({
    view: options.view,
    followHost: options.followHost,
    connected: options.connected,
    strings: options.strings,
  });
  applyConferenceHeaderButton(options.startBtn, actions.start);
  applyConferenceHeaderButton(options.endBtn, actions.leave);
  applyConferenceHeaderButton(options.stopFollowBtn, actions.stopFollowing);
  applyConferenceHeaderButton(options.resumeFollowBtn, actions.resumeFollowing);
  applyConferenceHeaderButton(options.takeOverBtn, actions.takeOver);
  return actions;
}
