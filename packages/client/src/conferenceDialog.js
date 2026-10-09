import {
  HUB_CONFERENCE_EXIT_ACK_MS,
  HUB_CONFERENCE_TITLE_PRESETS,
  buildCastConferenceView,
  conferenceHostTopic,
  createHubConference,
  deleteHubConference,
  fetchHubConferences,
  fetchHubConferenceTopics,
  findActiveHubConference,
  isHubConferenceHost,
  joinHubConference,
} from './conference.js';
import {
  mergeCastConferenceStrings,
} from './conferenceStrings.js';
import {
  clearHubDialogNearAnchor,
  placeHubDialogNearAnchor,
} from './dialogAnchor.js';

/**
 * @typedef {object} CastConferencePlace
 * @property {string} placeId
 * @property {string} label
 * @property {boolean} isSelf
 * @property {boolean} isLeading
 * @property {boolean} isFollowing
 * @property {string} statusLabel
 */

/**
 * @typedef {object} CastConferenceView
 * @property {string} title
 * @property {CastConferencePlace[]} places
 * @property {string} selfPlaceId
 * @property {string} leadingPlaceId
 * @property {'leading' | 'following'} selfRole
 * @property {string} hostTopic
 * @property {string[]} attendeeTopics
 * @property {string[]} participants
 */

/**
 * @typedef {object} CastConferenceDialogSession
 * @property {string} [hubEndpoint]
 * @property {string} [topic]
 * @property {string} [subscriberName]
 * @property {string} [userName]
 * @property {boolean} [connected]
 */

/**
 * @typedef {object} CastConferenceDialogOptions
 * @property {ParentNode} [root]
 * @property {string} [classPrefix]
 * @property {() => CastConferenceDialogSession} getSession
 * @property {(view: CastConferenceView | null) => void} [onConferenceChange]
 * @property {(followHost: boolean) => void} [onFollowChange]
 * @property {Partial<import('./conferenceStrings.js').CastConferenceStrings>} [strings]
 */

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
 * True when session topic is already host or attendee of the conference.
 * @param {string} selfTopic
 * @param {Record<string, unknown>} conference
 */
function isSelfInConference(selfTopic, conference) {
  const self = String(selfTopic || '').trim();
  if (!self) return false;
  const host = conferenceHostTopic(conference);
  if (host && (host === self || host.toLowerCase() === self.toLowerCase())) {
    return true;
  }
  const topics = Array.isArray(conference?.topics) ? conference.topics : [];
  return topics.some((t) => {
    const topic = String(t || '').trim();
    return topic === self || topic.toLowerCase() === self.toLowerCase();
  });
}

/**
 * Mountable Hub conference dialog (vanilla DOM).
 * @param {CastConferenceDialogOptions} options
 */
export function createHubConferenceDialog(options) {
  const getSession =
    typeof options?.getSession === 'function' ? options.getSession : () => ({});
  const onConferenceChange =
    typeof options?.onConferenceChange === 'function'
      ? options.onConferenceChange
      : null;
  const onFollowChange =
    typeof options?.onFollowChange === 'function'
      ? options.onFollowChange
      : null;
  const prefix = String(options?.classPrefix || 'hub-conference').trim();
  /** @type {'start' | 'end'} */
  const anchorAlign = options?.anchorAlign === 'end' ? 'end' : 'start';
  const root = options?.root || (typeof document !== 'undefined' ? document.body : null);
  if (!root) {
    throw new Error('createHubConferenceDialog requires a DOM root');
  }

  /** @type {ReturnType<typeof mergeCastConferenceStrings>} */
  let s = mergeCastConferenceStrings(options?.strings);

  /** @type {CastConferenceView | null} */
  let currentView = null;
  let busy = false;
  /** @type {HTMLElement | null} */
  let lastAnchor = null;

  const overlay = document.createElement('div');
  overlay.className = cls(prefix, 'overlay');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="${cls(prefix, 'dialog')}" role="dialog" aria-modal="true" aria-labelledby="${cls(prefix, 'title')}" tabindex="-1">
      <div class="${cls(prefix, 'header')}">
        <h2 id="${cls(prefix, 'title')}" class="${cls(prefix, 'title')}" data-hub-conference-dialog-title></h2>
        <button type="button" class="${cls(prefix, 'close')}" data-hub-conference-close aria-label="">×</button>
      </div>
      <div class="${cls(prefix, 'body')}">
        <p class="${cls(prefix, 'status')}" data-hub-conference-status role="alert" hidden></p>
        <div data-hub-conference-create>
          <div class="${cls(prefix, 'section')}" data-hub-conference-create-form>
            <div class="${cls(prefix, 'section-title')}" data-hub-conference-create-section></div>
            <div class="${cls(prefix, 'field')}">
              <label class="${cls(prefix, 'label')}" for="${cls(prefix, 'title-select')}" data-hub-conference-title-label></label>
              <select id="${cls(prefix, 'title-select')}" class="${cls(prefix, 'select')}" data-hub-conference-title-select>
              </select>
            </div>
            <div class="${cls(prefix, 'field')}" data-hub-conference-custom-group hidden>
              <label class="${cls(prefix, 'label')}" for="${cls(prefix, 'custom-title')}" data-hub-conference-custom-label></label>
              <input id="${cls(prefix, 'custom-title')}" class="${cls(prefix, 'input')}" type="text" data-hub-conference-custom-title />
            </div>
            <div class="${cls(prefix, 'field')}">
              <span class="${cls(prefix, 'label')}" data-hub-conference-users-label></span>
              <div class="${cls(prefix, 'topics')}" data-hub-conference-topics>
                <p class="${cls(prefix, 'muted')}" data-hub-conference-loading-users></p>
              </div>
            </div>
            <button type="button" class="${cls(prefix, 'primary')}" data-hub-conference-create-btn></button>
          </div>
          <div class="${cls(prefix, 'section')}" data-hub-conference-join-section>
            <div class="${cls(prefix, 'section-title')}" data-hub-conference-join-section-title></div>
            <div class="${cls(prefix, 'field')}">
              <label class="${cls(prefix, 'label')}" for="${cls(prefix, 'join-select')}" data-hub-conference-active-label></label>
              <select id="${cls(prefix, 'join-select')}" class="${cls(prefix, 'select')}" data-hub-conference-join-select>
              </select>
            </div>
            <button type="button" class="${cls(prefix, 'primary')}" data-hub-conference-join-btn disabled></button>
          </div>
        </div>
        <div data-hub-conference-manage hidden>
          <div class="${cls(prefix, 'label')}" data-hub-conference-manage-label></div>
          <div class="${cls(prefix, 'info')}" data-hub-conference-info></div>
          <button type="button" class="${cls(prefix, 'primary')}" data-hub-conference-exit-btn></button>
        </div>
      </div>
      <div class="${cls(prefix, 'section')} ${cls(prefix, 'section-session')}" data-hub-conference-session>
        <div class="${cls(prefix, 'user-row')}">
          <label class="${cls(prefix, 'label')}" for="sessionUserNameInput">Change user name:</label>
          <input
            type="text"
            id="sessionUserNameInput"
            class="${cls(prefix, 'input')} ${cls(prefix, 'user-input')}"
            autocomplete="username"
          />
          <button type="button" id="sessionChangeUserBtn" class="${cls(prefix, 'secondary')}">
            OK
          </button>
        </div>
        <p id="sessionChangeUserNote" class="${cls(prefix, 'muted')}" hidden>
          Saved. Reload the page to apply.
        </p>
        <div class="${cls(prefix, 'session-row')}">
          <button
            type="button"
            id="openConferenceTestWorklistBtn"
            class="${cls(prefix, 'secondary')} ${cls(prefix, 'open-another-user')}"
            data-hub-conference-open-another-user
            title="Open another user session to test conferencing"
          >
            Open another user
          </button>
          <button
            type="button"
            class="${cls(prefix, 'secondary')} ${cls(prefix, 'session-close')}"
            data-hub-conference-close
            data-hub-conference-close-label
          ></button>
        </div>
      </div>
    </div>
  `;

  root.appendChild(overlay);

  const dialogEl = overlay.querySelector(`.${cls(prefix, 'dialog')}`);
  const statusEl = overlay.querySelector('[data-hub-conference-status]');
  const openAnotherUserBtn = overlay.querySelector(
    '[data-hub-conference-open-another-user]'
  );
  const createSection = overlay.querySelector('[data-hub-conference-create]');
  const createFormSection = overlay.querySelector(
    '[data-hub-conference-create-form]'
  );
  const manageSection = overlay.querySelector('[data-hub-conference-manage]');
  const joinSection = overlay.querySelector('[data-hub-conference-join-section]');
  const titleSelect = overlay.querySelector('[data-hub-conference-title-select]');
  const customGroup = overlay.querySelector('[data-hub-conference-custom-group]');
  const customTitle = overlay.querySelector('[data-hub-conference-custom-title]');
  const topicsPanel = overlay.querySelector('[data-hub-conference-topics]');
  const joinSelect = overlay.querySelector('[data-hub-conference-join-select]');
  const infoEl = overlay.querySelector('[data-hub-conference-info]');
  const createBtn = overlay.querySelector('[data-hub-conference-create-btn]');
  const joinBtn = overlay.querySelector('[data-hub-conference-join-btn]');
  const exitBtn = overlay.querySelector('[data-hub-conference-exit-btn]');

  /**
   * Put Join above Create when joinable conferences exist; otherwise Create first.
   * @param {boolean} hasJoinable
   */
  function orderCreateJoinSections(hasJoinable) {
    if (!createSection || !createFormSection || !joinSection) return;
    if (hasJoinable) {
      createSection.insertBefore(joinSection, createFormSection);
    } else {
      createSection.insertBefore(createFormSection, joinSection);
    }
  }

  function fillTitlePresets() {
    if (!(titleSelect instanceof HTMLSelectElement)) return;
    const previous = String(titleSelect.value || '');
    titleSelect.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = s.selectConferenceTitle;
    titleSelect.appendChild(placeholder);
    for (const preset of HUB_CONFERENCE_TITLE_PRESETS) {
      const option = document.createElement('option');
      option.value = preset;
      option.textContent = preset;
      if (preset === 'ST-444 · Anatomie humaine') option.selected = true;
      titleSelect.appendChild(option);
    }
    const other = document.createElement('option');
    other.value = 'other';
    other.textContent = s.otherTitle;
    titleSelect.appendChild(other);
    if (previous && [...titleSelect.options].some((o) => o.value === previous)) {
      titleSelect.value = previous;
    }
  }

  function applyStaticLabels() {
    const setText = (sel, text) => {
      const el = overlay.querySelector(sel);
      if (el) el.textContent = text;
    };
    setText('[data-hub-conference-dialog-title]', s.dialogTitle);
    setText('[data-hub-conference-create-section]', s.createSection);
    setText('[data-hub-conference-title-label]', s.conferenceTitle);
    setText('[data-hub-conference-custom-label]', s.customTitle);
    setText('[data-hub-conference-users-label]', s.users);
    setText('[data-hub-conference-loading-users]', s.loadingUsers);
    setText('[data-hub-conference-join-section-title]', s.joinSection);
    setText('[data-hub-conference-active-label]', s.activeConferences);
    setText('[data-hub-conference-manage-label]', s.manageSection);
    if (createBtn) createBtn.textContent = s.createConference;
    if (joinBtn) joinBtn.textContent = s.joinConference;
    if (exitBtn) {
      exitBtn.textContent = currentView?.isConferenceOwner
        ? s.endConference
        : s.leaveConference;
    }
    overlay.querySelectorAll('[data-hub-conference-close]').forEach((node) => {
      if (node instanceof HTMLElement) {
        node.setAttribute('aria-label', s.closeAria);
        if (node.hasAttribute('data-hub-conference-close-label')) {
          node.textContent = s.close;
        }
      }
    });
    if (customTitle instanceof HTMLInputElement) {
      customTitle.placeholder = s.customTitlePlaceholder;
    }
    fillTitlePresets();
  }

  function syncSessionControl() {
    /* Topic/session control removed; keep for API compatibility. */
  }

  function openAnotherUserSession() {
    const url = new URL(window.location.href);
    url.searchParams.set('freshUser', '1');
    url.searchParams.delete('topic');
    window.open(url.href, '_blank', 'noopener,noreferrer');
  }

  applyStaticLabels();

  function setStatus(kind, message) {
    if (!statusEl) {
      return;
    }
    const text = String(message || '').trim();
    statusEl.classList.remove(
      cls(prefix, 'status-success'),
      cls(prefix, 'status-error')
    );
    if (!text) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = text;
    if (kind === 'success') {
      statusEl.classList.add(cls(prefix, 'status-success'));
    } else if (kind === 'error') {
      statusEl.classList.add(cls(prefix, 'status-error'));
    }
  }

  function emitView(view) {
    currentView = view;
    if (onConferenceChange) {
      onConferenceChange(view);
    }
  }

  function sessionSnapshot() {
    const session = getSession() || {};
    return {
      hubEndpoint: String(session.hubEndpoint ?? '').trim(),
      topic: String(session.topic ?? '').trim(),
      subscriberName: String(session.subscriberName ?? '').trim(),
      userName: String(session.userName ?? '').trim(),
      connected: Boolean(session.connected),
    };
  }

  function resolvedTitle() {
    const preset = String(titleSelect?.value || '').trim();
    if (preset === 'other') {
      return String(customTitle?.value || '').trim();
    }
    return preset;
  }

  function selectedTopics() {
    if (!topicsPanel) {
      return [];
    }
    return Array.from(
      topicsPanel.querySelectorAll(
        'input[type="checkbox"][data-hub-conference-topic]:checked'
      )
    )
      .map((input) => String(input.value || '').trim())
      .filter(Boolean);
  }

  /**
   * @param {string} timezone
   * @returns {string}
   */
  function formatTimezoneLabel(timezone) {
    const tz = String(timezone || '').trim();
    if (!tz) return '';
    try {
      const parts = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      }).formatToParts(new Date());
      const offset = parts.find((p) => p.type === 'timeZoneName')?.value;
      return offset ? `${tz} (${offset})` : tz;
    } catch {
      return tz;
    }
  }

  /**
   * @param {{ topic: string, timezone?: string }[]} topics
   */
  function renderTopics(topics) {
    if (!topicsPanel) {
      return;
    }
    topicsPanel.replaceChildren();
    if (!topics.length) {
      const empty = document.createElement('p');
      empty.className = cls(prefix, 'muted');
      empty.textContent = s.noUsers;
      topicsPanel.appendChild(empty);
      return;
    }
    for (const entry of topics) {
      const topic =
        typeof entry === 'string'
          ? String(entry).trim()
          : String(entry?.topic ?? '').trim();
      if (!topic) continue;
      const timezone =
        typeof entry === 'string'
          ? ''
          : String(entry?.timezone ?? '').trim();
      const row = document.createElement('label');
      row.className = cls(prefix, 'topic-row');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.hubConferenceTopic = '1';
      input.value = topic;
      input.checked = true;
      const text = document.createElement('span');
      text.className = cls(prefix, 'topic-label');
      text.textContent = topic;
      row.appendChild(input);
      row.appendChild(text);
      const tzLabel = formatTimezoneLabel(timezone);
      if (tzLabel) {
        const meta = document.createElement('span');
        meta.className = cls(prefix, 'topic-timezone');
        meta.textContent = tzLabel;
        row.appendChild(meta);
      }
      topicsPanel.appendChild(row);
    }
  }

  /**
   * @param {unknown[]} conferences
   * @param {string} selfTopic
   */
  function renderJoinOptions(conferences, selfTopic) {
    if (!joinSelect || !joinBtn) return;
    const joinable = (Array.isArray(conferences) ? conferences : []).filter(
      (conf) =>
        conf &&
        typeof conf === 'object' &&
        !isSelfInConference(selfTopic, /** @type {Record<string, unknown>} */ (conf))
    );
    const previous = String(joinSelect.value || '');
    joinSelect.replaceChildren();
    if (!joinable.length) {
      joinSelect.replaceChildren();
      joinSelect.disabled = true;
      joinBtn.disabled = true;
      if (joinSection instanceof HTMLElement) {
        joinSection.hidden = true;
      }
      orderCreateJoinSections(false);
      return;
    }
    if (joinSection instanceof HTMLElement) {
      joinSection.hidden = false;
    }
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = s.selectConference;
    joinSelect.appendChild(placeholder);
    /** @type {string[]} */
    const hosts = [];
    for (const conf of joinable) {
      const record = /** @type {Record<string, unknown>} */ (conf);
      const host = conferenceHostTopic(record);
      if (!host) continue;
      hosts.push(host);
      const title = String(record.title || '').trim() || s.untitled;
      const option = document.createElement('option');
      option.value = host;
      option.textContent = `${title} — ${host}`;
      joinSelect.appendChild(option);
    }
    joinSelect.disabled = false;
    if (previous && hosts.includes(previous)) {
      joinSelect.value = previous;
    } else if (hosts.length) {
      joinSelect.value = hosts[0];
    }
    joinBtn.disabled = !String(joinSelect.value || '').trim();
    orderCreateJoinSections(true);
  }

  function updateSections(view) {
    syncSessionControl();
    if (createSection) {
      createSection.hidden = Boolean(view);
    }
    if (manageSection) {
      manageSection.hidden = !view;
    }
    if (view && infoEl) {
      const placesHtml = view.places.length
        ? `<div class="${cls(prefix, 'places')}">${view.places
            .map((place) => {
              const classes = [cls(prefix, 'place')];
              if (place.isSelf) classes.push(cls(prefix, 'place-self'));
              if (place.isLeading) classes.push(cls(prefix, 'place-leading'));
              if (place.isFollowing) {
                classes.push(cls(prefix, 'place-following'));
              }
              const status = place.statusLabel
                ? `<span class="${cls(prefix, 'place-status')}">${escapeText(
                    place.statusLabel
                  )}</span>`
                : '';
              return `<span class="${classes.join(
                ' '
              )}" title="${escapeText(place.placeId)}"><span class="${cls(
                prefix,
                'place-name'
              )}">${escapeText(place.label)}</span>${status}</span>`;
            })
            .join('')}</div>`
        : `<div class="${cls(prefix, 'muted')}">${escapeText(s.noPlaces)}</div>`;
      infoEl.innerHTML = `<div><strong>${escapeText(s.titleLabel)}</strong> ${escapeText(
        view.title || s.na
      )}</div><div class="${cls(prefix, 'places-label')}">${escapeText(
        s.participants
      )}</div>${placesHtml}`;
    }
    if (exitBtn) {
      exitBtn.textContent = view?.isConferenceOwner
        ? s.endConference
        : s.leaveConference;
    }
  }

  async function refresh() {
    const session = sessionSnapshot();
    if (!session.hubEndpoint || !session.connected) {
      renderTopics([]);
      renderJoinOptions([], session.topic);
      updateSections(null);
      emitView(null);
      return null;
    }
    const [topics, conferences] = await Promise.all([
      fetchHubConferenceTopics(session.hubEndpoint),
      fetchHubConferences(session.hubEndpoint),
    ]);
    const match = findActiveHubConference(
      session.topic,
      session.subscriberName,
      conferences
    );
    const view = buildCastConferenceView(session, match);
    if (!match) {
      renderTopics(topics);
      renderJoinOptions(conferences, session.topic);
    }
    updateSections(view);
    emitView(view);
    return view;
  }

  async function handleCreate() {
    if (busy) {
      return;
    }
    const session = sessionSnapshot();
    const title = resolvedTitle();
    const topics = selectedTopics();

    if (!session.connected) {
      setStatus('error', s.connectHubFirst);
      return;
    }
    if (!session.topic) {
      setStatus('error', s.topicRequiredHost);
      return;
    }
    if (!title) {
      setStatus('error', s.titleRequired);
      return;
    }
    if (!topics.length) {
      setStatus('error', s.selectAttendee);
      return;
    }

    busy = true;
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.textContent = s.creating;
    }
    setStatus('', '');
    try {
      await createHubConference(
        session.hubEndpoint,
        session.topic,
        title,
        topics,
        session.userName
      );
      await refresh();
      close();
    } catch (error) {
      setStatus(
        'error',
        error instanceof Error ? error.message : s.failedCreate
      );
    } finally {
      busy = false;
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.textContent = s.createConference;
      }
    }
  }

  async function handleJoin() {
    if (busy) return;
    const session = sessionSnapshot();
    const hostTopic = String(joinSelect?.value || '').trim();
    if (!session.connected) {
      setStatus('error', s.connectHubFirst);
      return;
    }
    if (!session.topic) {
      setStatus('error', s.topicRequiredJoin);
      return;
    }
    if (!hostTopic) {
      setStatus('error', s.selectConferenceToJoin);
      return;
    }

    busy = true;
    if (joinBtn) {
      joinBtn.disabled = true;
      joinBtn.textContent = s.joining;
    }
    setStatus('', '');
    try {
      await joinHubConference(
        session.hubEndpoint,
        hostTopic,
        session.topic,
        session.userName
      );
      onFollowChange?.(true);
      await refresh();
      close();
    } catch (error) {
      setStatus(
        'error',
        error instanceof Error ? error.message : s.failedJoin
      );
    } finally {
      busy = false;
      if (joinBtn) {
        joinBtn.textContent = s.joinConference;
        joinBtn.disabled = !String(joinSelect?.value || '').trim();
      }
    }
  }

  async function handleExit() {
    if (busy) {
      return;
    }
    const session = sessionSnapshot();
    const conferences = await fetchHubConferences(session.hubEndpoint);
    const match = findActiveHubConference(
      session.topic,
      session.subscriberName,
      conferences
    );
    if (!match) {
      await refresh();
      return;
    }
    const hostTopic = conferenceHostTopic(match);
    const hostAction = isHubConferenceHost(session.topic, match);

    busy = true;
    if (exitBtn) {
      exitBtn.disabled = true;
      exitBtn.textContent = hostAction ? s.ending : s.leaving;
    }
    setStatus('', '');
    try {
      await deleteHubConference(
        session.hubEndpoint,
        hostTopic,
        hostAction ? undefined : session.topic
      );
      emitView(null);
      setStatus(
        'success',
        hostAction ? s.conferenceEnded : s.leftConference
      );
      await new Promise((resolve) => {
        setTimeout(resolve, HUB_CONFERENCE_EXIT_ACK_MS);
      });
      close();
    } catch (error) {
      setStatus(
        'error',
        error instanceof Error ? error.message : s.failedUpdate
      );
    } finally {
      busy = false;
      if (exitBtn) {
        exitBtn.disabled = false;
        exitBtn.textContent = hostAction ? s.endConference : s.leaveConference;
      }
    }
  }

  function clearAnchorPosition() {
    clearHubDialogNearAnchor(
      overlay,
      dialogEl instanceof HTMLElement ? dialogEl : null,
      cls(prefix, 'overlay-anchored')
    );
  }

  /**
   * Place the dialog near an anchor control (e.g. Conferencing button).
   * @param {HTMLElement | null | undefined} anchor
   */
  function positionNearAnchor(anchor) {
    placeHubDialogNearAnchor({
      overlay,
      dialog: dialogEl instanceof HTMLElement ? dialogEl : null,
      anchor,
      anchoredClass: cls(prefix, 'overlay-anchored'),
      align: anchorAlign,
    });
  }

  /**
   * @param {HTMLElement | EventTarget | null} [anchor]
   */
  function open(anchor) {
    setStatus('', '');
    syncSessionControl();
    if (titleSelect) {
      titleSelect.value = 'ST-444 · Anatomie humaine';
    }
    if (customTitle) {
      customTitle.value = '';
    }
    if (customGroup) {
      customGroup.hidden = true;
    }
    const userInput = overlay.querySelector('#sessionUserNameInput');
    if (userInput instanceof HTMLInputElement) {
      userInput.value = String(sessionSnapshot().userName || '').trim();
    }
    const userNote = overlay.querySelector('#sessionChangeUserNote');
    if (userNote instanceof HTMLElement) {
      userNote.hidden = true;
    }
    lastAnchor =
      anchor instanceof HTMLElement
        ? anchor
        : null;
    overlay.hidden = false;
    positionNearAnchor(lastAnchor);
    if (dialogEl instanceof HTMLElement) {
      dialogEl.focus({ preventScroll: true });
    }
    refresh()
      .then(() => positionNearAnchor(lastAnchor))
      .catch(() => {});
  }

  function close() {
    overlay.hidden = true;
    setStatus('', '');
    clearAnchorPosition();
    lastAnchor = null;
  }

  function destroy() {
    close();
    overlay.remove();
  }

  /**
   * @param {Partial<import('./conferenceStrings.js').CastConferenceStrings> | null | undefined} next
   */
  function setStrings(next) {
    s = mergeCastConferenceStrings(next);
    applyStaticLabels();
    if (currentView) updateSections(currentView);
  }

  titleSelect?.addEventListener('change', () => {
    if (customGroup) {
      customGroup.hidden = String(titleSelect.value || '') !== 'other';
    }
  });
  joinSelect?.addEventListener('change', () => {
    if (joinBtn) {
      joinBtn.disabled = !String(joinSelect.value || '').trim() || busy;
    }
  });
  createBtn?.addEventListener('click', () => {
    handleCreate().catch(() => {});
  });
  joinBtn?.addEventListener('click', () => {
    handleJoin().catch(() => {});
  });
  exitBtn?.addEventListener('click', () => {
    handleExit().catch(() => {});
  });
  openAnotherUserBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    openAnotherUserSession();
  });
  overlay.querySelectorAll('[data-hub-conference-close]').forEach((node) => {
    node.addEventListener('click', () => close());
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });
  window.addEventListener('resize', () => {
    if (!overlay.hidden) positionNearAnchor(lastAnchor);
  });

  return {
    open,
    close,
    destroy,
    refresh,
    setStrings,
    syncSessionControl,
    getSessionControl: () => ({
      button: null,
      label: null,
    }),
    getView: () => currentView,
    get element() {
      return overlay;
    },
  };
}
