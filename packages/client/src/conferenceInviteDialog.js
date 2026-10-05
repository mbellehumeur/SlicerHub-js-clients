import {
  deleteHubConference,
  resolveHubConferenceView,
} from './conference.js';
import {
  interpolateCastConferenceString,
  mergeCastConferenceStrings,
} from './conferenceStrings.js';

/** IHE Image Display actor (IID). */
export const HUB_IMAGE_DISPLAY_ACTOR = 'ID';

/**
 * @param {{ selfActors?: string[], connectedActors?: string[] }} opts
 * @returns {boolean}
 */
export function shouldShowConferenceInvite(opts = {}) {
  const selfActors = Array.isArray(opts.selfActors)
    ? opts.selfActors.map((a) => String(a || '').trim()).filter(Boolean)
    : [];
  const connectedActors = Array.isArray(opts.connectedActors)
    ? opts.connectedActors.map((a) => String(a || '').trim()).filter(Boolean)
    : [];
  const selfIsId = selfActors.some(
    (a) => a === HUB_IMAGE_DISPLAY_ACTOR || a.toUpperCase() === 'ID'
  );
  if (selfIsId) {
    return true;
  }
  const hasConnectedId = connectedActors.some(
    (a) => a === HUB_IMAGE_DISPLAY_ACTOR || a.toUpperCase() === 'ID'
  );
  return !hasConnectedId;
}

/**
 * @param {unknown} message
 * @returns {{
 *   hubEvent: string,
 *   title: string,
 *   hostTopic: string,
 *   hostUserName: string,
 *   hostLabel: string,
 *   sceneLeaderTopic: string,
 *   leaderUserName: string,
 *   leaderLabel: string,
 *   joinedTopic: string,
 * } | null}
 */
export function parseConferenceInviteFromMessage(message) {
  const event =
    message && typeof message === 'object'
      ? /** @type {{ event?: Record<string, unknown> }} */ (message).event
      : null;
  if (!event || typeof event !== 'object') {
    return null;
  }
  const hubEvent = String(event['hub.event'] || '')
    .trim()
    .toLowerCase();
  if (hubEvent !== 'conference-start' && hubEvent !== 'conference-end' && hubEvent !== 'conference-lead') {
    return null;
  }
  const context =
    event.context && typeof event.context === 'object'
      ? /** @type {Record<string, unknown>} */ (event.context)
      : {};
  const hostTopic = String(
    context.hostTopic || event['hub.topic'] || ''
  ).trim();
  const title = String(context.title || '').trim();
  const hostUserName = String(context.hostUserName || '').trim();
  const sceneLeaderTopic = String(context.sceneLeaderTopic || '').trim();
  const leaderUserName = String(
    context.leaderUserName || context.leaderLabel || ''
  ).trim();
  const leaderLabel =
    leaderUserName || sceneLeaderTopic || hostUserName || hostTopic || 'host';
  const joinedTopic = String(context.joinedTopic || '').trim();
  return {
    hubEvent,
    title,
    hostTopic,
    hostUserName,
    hostLabel: hostUserName || hostTopic || 'host',
    sceneLeaderTopic,
    leaderUserName,
    leaderLabel,
    joinedTopic,
  };
}

function cls(prefix, name) {
  return `${prefix}-${name}`;
}

function escapeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @typedef {'join-follow' | 'join' | 'decline'} CastConferenceInviteChoice
 */

/**
 * Mountable conference-start invite dialog.
 * @param {{
 *   root?: ParentNode,
 *   classPrefix?: string,
 *   strings?: Partial<import('./conferenceStrings.js').CastConferenceStrings>,
 *   onDecision?: (choice: CastConferenceInviteChoice, invite: object) => void | Promise<void>,
 * }} options
 */
export function createHubConferenceInviteDialog(options = {}) {
  const onDecision =
    typeof options.onDecision === 'function' ? options.onDecision : null;
  const prefix = String(
    options.classPrefix || 'hub-conference-invite'
  ).trim();
  const root =
    options.root || (typeof document !== 'undefined' ? document.body : null);
  if (!root) {
    throw new Error('createHubConferenceInviteDialog requires a DOM root');
  }

  /** @type {ReturnType<typeof mergeCastConferenceStrings>} */
  let s = mergeCastConferenceStrings(options.strings);

  /** @type {ReturnType<typeof parseConferenceInviteFromMessage> | null} */
  let currentInvite = null;
  let busy = false;

  const overlay = document.createElement('div');
  overlay.className = cls(prefix, 'overlay');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="${cls(prefix, 'dialog')}" role="dialog" aria-modal="true" aria-labelledby="${cls(prefix, 'title')}" tabindex="-1">
      <div class="${cls(prefix, 'header')}">
        <h2 id="${cls(prefix, 'title')}" class="${cls(prefix, 'title')}" data-hub-invite-title></h2>
        <button type="button" class="${cls(prefix, 'close')}" data-hub-invite-close aria-label="">×</button>
      </div>
      <div class="${cls(prefix, 'body')}">
        <p class="${cls(prefix, 'lead')}" data-hub-invite-lead></p>
        <p class="${cls(prefix, 'status')}" data-hub-invite-status role="alert" hidden></p>
        <div class="${cls(prefix, 'actions')}">
          <button type="button" class="${cls(prefix, 'primary')}" data-hub-invite-follow></button>
          <button type="button" class="${cls(prefix, 'secondary')}" data-hub-invite-join></button>
          <button type="button" class="${cls(prefix, 'secondary')}" data-hub-invite-decline></button>
        </div>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  const dialog = overlay.querySelector(`.${cls(prefix, 'dialog')}`);
  const titleEl = overlay.querySelector('[data-hub-invite-title]');
  const leadEl = overlay.querySelector('[data-hub-invite-lead]');
  const statusEl = overlay.querySelector('[data-hub-invite-status]');
  const followBtn = overlay.querySelector('[data-hub-invite-follow]');
  const joinBtn = overlay.querySelector('[data-hub-invite-join]');
  const declineBtn = overlay.querySelector('[data-hub-invite-decline]');
  const closeBtn = overlay.querySelector('[data-hub-invite-close]');

  function applyStaticLabels() {
    if (titleEl) titleEl.textContent = s.inviteTitle;
    if (joinBtn) joinBtn.textContent = s.joinNoFollow;
    if (declineBtn) declineBtn.textContent = s.doNotJoin;
    if (closeBtn instanceof HTMLElement) {
      closeBtn.setAttribute('aria-label', s.closeAria);
    }
    if (followBtn && currentInvite) {
      followBtn.textContent = interpolateCastConferenceString(
        s.joinAndFollowHost,
        { host: currentInvite.hostLabel || s.hostFallback }
      );
    } else if (followBtn) {
      followBtn.textContent = s.joinAndFollow;
    }
  }

  applyStaticLabels();

  function setStatus(kind, text) {
    if (!(statusEl instanceof HTMLElement)) return;
    const msg = String(text || '').trim();
    statusEl.hidden = !msg;
    statusEl.textContent = msg;
    statusEl.classList.toggle(cls(prefix, 'status-error'), kind === 'error');
  }

  function setBusy(next) {
    busy = next;
    for (const btn of [followBtn, joinBtn, declineBtn]) {
      if (btn instanceof HTMLButtonElement) btn.disabled = next;
    }
  }

  function close() {
    overlay.hidden = true;
    currentInvite = null;
    setStatus('', '');
    setBusy(false);
  }

  /**
   * @param {{ title?: string, hostTopic?: string, hostUserName?: string, hostLabel?: string }} invite
   */
  function open(invite) {
    const hostLabel =
      String(
        invite?.hostLabel ||
          invite?.hostUserName ||
          invite?.hostTopic ||
          s.hostFallback
      ).trim() || s.hostFallback;
    const title = String(invite?.title || '').trim();
    currentInvite = {
      hubEvent: 'conference-start',
      title,
      hostTopic: String(invite?.hostTopic || '').trim(),
      hostUserName: String(invite?.hostUserName || '').trim(),
      hostLabel,
    };
    if (leadEl instanceof HTMLElement) {
      leadEl.textContent = title
        ? interpolateCastConferenceString(s.inviteLeadWithTitle, {
            title,
            host: hostLabel,
          })
        : interpolateCastConferenceString(s.inviteLeadNoTitle, {
            host: hostLabel,
          });
    }
    if (followBtn instanceof HTMLElement) {
      followBtn.textContent = interpolateCastConferenceString(
        s.joinAndFollowHost,
        { host: hostLabel }
      );
    }
    setStatus('', '');
    overlay.hidden = false;
    if (dialog instanceof HTMLElement) {
      dialog.focus({ preventScroll: true });
    }
  }

  async function decide(choice) {
    if (busy || !currentInvite) return;
    const invite = currentInvite;
    setBusy(true);
    try {
      if (onDecision) {
        await onDecision(choice, invite);
      }
      close();
    } catch (error) {
      setStatus(
        'error',
        error instanceof Error ? error.message : s.failedUpdate
      );
      setBusy(false);
    }
  }

  followBtn?.addEventListener('click', () => {
    void decide('join-follow');
  });
  joinBtn?.addEventListener('click', () => {
    void decide('join');
  });
  declineBtn?.addEventListener('click', () => {
    void decide('decline');
  });
  overlay.querySelectorAll('[data-hub-invite-close]').forEach((el) => {
    el.addEventListener('click', () => close());
  });
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });

  return {
    open,
    close,
    /**
     * @param {Partial<import('./conferenceStrings.js').CastConferenceStrings> | null | undefined} next
     */
    setStrings(next) {
      s = mergeCastConferenceStrings(next);
      applyStaticLabels();
      if (currentInvite && !overlay.hidden) {
        open(currentInvite);
      }
    },
    destroy() {
      close();
      overlay.remove();
    },
    isOpen() {
      return !overlay.hidden;
    },
    getInvite() {
      return currentInvite;
    },
    element: overlay,
  };
}

/**
 * Wire conference-start/end into the invite dialog + leave/join decisions.
 * @param {{
 *   getSession: () => {
 *     hubEndpoint?: string,
 *     topic?: string,
 *     subscriberName?: string,
 *     userName?: string,
 *     connected?: boolean,
 *   },
 *   shouldShow?: () => boolean,
 *   dialog?: ReturnType<typeof createHubConferenceInviteDialog>,
 *   root?: ParentNode,
 *   classPrefix?: string,
 *   strings?: Partial<import('./conferenceStrings.js').CastConferenceStrings>,
 *   onConferenceChange?: (view: object | null) => void,
 *   onFollowChange?: (followHost: boolean, invite?: object) => void,
 *   onLeadChange?: (info: {
 *     sceneLeaderTopic?: string,
 *     leaderLabel?: string,
 *     leaderUserName?: string,
 *     hostTopic?: string,
 *     title?: string,
 *   }) => void,
 * }} options
 */
export function createHubConferenceInviteController(options) {
  const getSession =
    typeof options?.getSession === 'function' ? options.getSession : () => ({});
  const shouldShow =
    typeof options?.shouldShow === 'function' ? options.shouldShow : () => true;
  const onConferenceChange =
    typeof options?.onConferenceChange === 'function'
      ? options.onConferenceChange
      : null;
  const onFollowChange =
    typeof options?.onFollowChange === 'function'
      ? options.onFollowChange
      : null;
  const onLeadChange =
    typeof options?.onLeadChange === 'function' ? options.onLeadChange : null;

  const dialog =
    options?.dialog ||
    createHubConferenceInviteDialog({
      root: options?.root,
      classPrefix: options?.classPrefix,
      strings: options?.strings,
      onDecision: async (choice, invite) => {
        await handleDecision(choice, invite);
      },
    });

  async function refreshView() {
    const session = getSession();
    const view = await resolveHubConferenceView(
      session.hubEndpoint || '',
      session.topic || '',
      session.subscriberName || '',
      session.userName || ''
    );
    onConferenceChange?.(view);
    return view;
  }

  async function handleDecision(choice, invite) {
    const session = getSession();
    const hostTopic = String(invite?.hostTopic || '').trim();
    if (!hostTopic) {
      throw new Error('Missing conference host topic.');
    }

    if (choice === 'decline') {
      await deleteHubConference(
        session.hubEndpoint || '',
        hostTopic,
        session.topic || ''
      );
      onFollowChange?.(false);
      onConferenceChange?.(null);
      return;
    }

    const followHost = choice === 'join-follow';
    onFollowChange?.(followHost, followHost ? invite : undefined);
    await refreshView();
  }

  /**
   * @param {Record<string, unknown>} message
   * @returns {boolean}
   */
  function handleHubMessage(message) {
    const parsed = parseConferenceInviteFromMessage(message);
    if (!parsed) return false;

    const session = getSession();
    const selfTopic = String(session.topic || '').trim();

    if (parsed.hubEvent === 'conference-lead') {
      const leadTopic = String(parsed.sceneLeaderTopic || '').trim();
      const isSelfLead =
        Boolean(selfTopic) &&
        Boolean(leadTopic) &&
        (selfTopic === leadTopic ||
          selfTopic.toLowerCase() === leadTopic.toLowerCase());
      onFollowChange?.(!isSelfLead, parsed);
      void refreshView().then(() => {
        onLeadChange?.(parsed);
      });
      return true;
    }

    if (parsed.hubEvent === 'conference-end') {
      const event = /** @type {{ context?: Record<string, unknown> }} */ (
        message.event || {}
      );
      const ctx =
        event.context && typeof event.context === 'object' ? event.context : {};
      const left = String(ctx.leaveTopic || '').trim();
      if (!left || left === selfTopic) {
        dialog.close();
        onFollowChange?.(false);
        onConferenceChange?.(null);
      } else {
        void refreshView();
      }
      return true;
    }

    // conference-start
    if (
      selfTopic &&
      parsed.hostTopic &&
      (selfTopic === parsed.hostTopic ||
        selfTopic.toLowerCase() === parsed.hostTopic.toLowerCase())
    ) {
      // Host already leading — refresh roster, no invite. Not following.
      onFollowChange?.(false);
      void refreshView();
      return true;
    }

    // Voluntary join from the Conferencing dialog — already following; no invite popup.
    const joined = String(parsed.joinedTopic || '').trim();
    if (
      selfTopic &&
      joined &&
      (selfTopic === joined || selfTopic.toLowerCase() === joined.toLowerCase())
    ) {
      onFollowChange?.(true, parsed);
      void refreshView();
      return true;
    }

    if (!shouldShow()) {
      void refreshView();
      return true;
    }

    dialog.open(parsed);
    void refreshView();
    return true;
  }

  return {
    handleHubMessage,
    open: (invite) => dialog.open(invite),
    close: () => dialog.close(),
    destroy: () => dialog.destroy(),
    refresh: refreshView,
    /**
     * @param {Partial<import('./conferenceStrings.js').CastConferenceStrings> | null | undefined} next
     */
    setStrings(next) {
      dialog.setStrings?.(next);
    },
    dialog,
  };
}
