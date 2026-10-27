import {
  HUB_CONFERENCE_TITLE_PRESETS,
  buildCastConferenceView,
  conferenceHostTopic,
  createHubConference,
  fetchHubConferences,
  fetchHubConferenceTopics,
  findActiveHubConference,
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
 * @property {(userName: string) => void | Promise<void>} [onUserNameChange]
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
              <p class="${cls(prefix, 'muted')}" data-hub-conference-user-note hidden></p>
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
          <div class="${cls(prefix, 'info')}" data-hub-conference-info></div>
        </div>
        <button
          type="button"
          id="openConferenceTestWorklistBtn"
          class="${cls(prefix, 'secondary')} ${cls(prefix, 'open-another-user')}"
          data-hub-conference-open-another-user
        ></button>
      </div>
    </div>
    <div
      class="${cls(prefix, 'change-user-overlay')}"
      data-hub-conference-change-user-overlay
      hidden
    >
      <div
        class="${cls(prefix, 'change-user-dialog')}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${cls(prefix, 'change-user-title')}"
        tabindex="-1"
      >
        <div class="${cls(prefix, 'change-user-header')}">
          <h3
            id="${cls(prefix, 'change-user-title')}"
            class="${cls(prefix, 'change-user-title')}"
            data-hub-conference-change-user-title
          ></h3>
          <button
            type="button"
            class="${cls(prefix, 'close')}"
            data-hub-conference-change-user-close
            aria-label=""
          >×</button>
        </div>
        <div class="${cls(prefix, 'field')}">
          <label
            class="${cls(prefix, 'label')}"
            for="sessionUserNameInput"
            data-hub-conference-user-label
          ></label>
          <input
            type="text"
            id="sessionUserNameInput"
            class="${cls(prefix, 'input')} ${cls(prefix, 'user-input')}"
            autocomplete="username"
            data-hub-conference-user-input
          />
        </div>
        <div class="${cls(prefix, 'change-user-actions')}">
          <button
            type="button"
            class="${cls(prefix, 'primary')}"
            data-hub-conference-change-user-done
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
  const changeUserOverlay = overlay.querySelector(
    '[data-hub-conference-change-user-overlay]'
  );
  const changeUserDoneBtn = overlay.querySelector(
    '[data-hub-conference-change-user-done]'
  );
  const changeUserCloseBtn = overlay.querySelector(
    '[data-hub-conference-change-user-close]'
  );
  const userNameInput = overlay.querySelector('#sessionUserNameInput');
  const userNote = overlay.querySelector('[data-hub-conference-user-note]');
  const onUserNameChange =
    typeof options?.onUserNameChange === 'function'
      ? options.onUserNameChange
      : null;
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
  const closeBtn = overlay.querySelector('[data-hub-conference-close]');

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
      if (preset === 'Tumor Board') option.selected = true;
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
    if (createBtn) createBtn.textContent = s.createConference;
    if (joinBtn) joinBtn.textContent = s.joinConference;
    overlay.querySelectorAll('[data-hub-conference-user-label]').forEach((node) => {
      if (node instanceof HTMLElement) node.textContent = s.userLabel;
    });
    setText('[data-hub-conference-change-user-title]', s.changeUserNameTitle);
    if (openAnotherUserBtn instanceof HTMLElement) {
      openAnotherUserBtn.textContent = s.openAnotherUser;
      openAnotherUserBtn.title = s.openAnotherUserTitle;
    }
    if (changeUserDoneBtn instanceof HTMLElement) {
      changeUserDoneBtn.textContent = s.done;
    }
    if (userNote instanceof HTMLElement) {
      userNote.textContent = s.userNameSavedNote;
    }
    if (userNameInput instanceof HTMLInputElement) {
      userNameInput.placeholder = s.userNamePlaceholder;
    }
    if (customTitle instanceof HTMLInputElement) {
      customTitle.placeholder = s.customTitlePlaceholder;
    }
    if (closeBtn instanceof HTMLElement) {
      closeBtn.setAttribute('aria-label', s.closeAria);
    }
    if (changeUserCloseBtn instanceof HTMLElement) {
      changeUserCloseBtn.setAttribute('aria-label', s.closeAria);
    }
    fillTitlePresets();
    syncUserNameDisplay();
  }

  function syncSessionControl() {
    /* Topic/session control removed; keep for API compatibility. */
  }

  function getUserNameBtn() {
    return overlay.querySelector('[data-hub-conference-user-name-btn]');
  }

  function syncUserNameDisplay() {
    const btn = getUserNameBtn();
    if (!(btn instanceof HTMLElement)) return;
    const name = String(sessionSnapshot().userName || '').trim() || '—';
    btn.textContent = name;
    btn.title = s.changeUserNameTitle;
    btn.setAttribute('aria-label', s.changeUserName);
  }

  function createSelfUserNameButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${cls(prefix, 'secondary')} ${cls(prefix, 'user-name-btn')}`;
    btn.dataset.hubConferenceUserNameBtn = '';
    const name = String(sessionSnapshot().userName || '').trim() || '—';
    btn.textContent = name;
    btn.title = s.changeUserNameTitle;
    btn.setAttribute('aria-label', s.changeUserName);
    return btn;
  }

  /**
   * Self row: checkbox (participant) + name button (opens change-user dialog).
   * @param {string} [timezone]
   */
  function createSelfTopicRow(timezone = '') {
    const row = document.createElement('div');
    row.className = `${cls(prefix, 'topic-row')} ${cls(prefix, 'topic-row-self')}`;
    const selfTopic = String(sessionSnapshot().topic || '').trim();
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.hubConferenceTopic = '1';
    input.value = selfTopic;
    input.checked = true;
    row.appendChild(input);
    row.appendChild(createSelfUserNameButton());
    const tzLabel = formatTimezoneLabel(timezone);
    if (tzLabel) {
      const meta = document.createElement('span');
      meta.className = cls(prefix, 'topic-timezone');
      meta.textContent = tzLabel;
      row.appendChild(meta);
    }
    return row;
  }

  function setUserNote(message, { error = false } = {}) {
    if (!(userNote instanceof HTMLElement)) return;
    const text = String(message || '').trim();
    if (!text) {
      userNote.hidden = true;
      userNote.textContent = '';
      return;
    }
    userNote.hidden = false;
    userNote.textContent = text;
    userNote.classList.toggle(cls(prefix, 'status-error'), error);
  }

  /**
   * @param {string} candidateName
   * @param {{ excludeSelf?: boolean }} [opts]
   */
  async function topicNameAlreadyExists(candidateName, opts = {}) {
    const name = String(candidateName || '').trim();
    if (!name) return false;
    const session = sessionSnapshot();
    const selfTopic = String(session.topic || '').trim();
    const selfName = String(session.userName || '').trim();
    if (opts.excludeSelf !== false) {
      if (name === selfTopic || name === selfName) return false;
    }
    if (!session.hubEndpoint) return false;
    const topics = await fetchHubConferenceTopics(session.hubEndpoint);
    return topics.some((entry) => String(entry?.topic || '').trim() === name);
  }

  async function openAnotherUserSession() {
    const promptLabel =
      s.openAnotherUserPrompt || 'User name for new session';
    const typed = window.prompt(promptLabel, 'STUDENT-1');
    if (typed === null) return;
    const next = String(typed).trim();
    if (!next) return;
    if (await topicNameAlreadyExists(next, { excludeSelf: false })) {
      setUserNote(s.userNameAlreadyExists, { error: true });
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('userName', next);
    url.searchParams.set('topic', next);
    url.searchParams.delete('freshUser');
    window.open(url.href, '_blank', 'noopener,noreferrer');
    closeChangeUserDialog();
    close();
  }

  function openChangeUserDialog() {
    if (!(changeUserOverlay instanceof HTMLElement)) return;
    if (userNameInput instanceof HTMLInputElement) {
      userNameInput.value = String(sessionSnapshot().userName || '').trim();
    }
    setUserNote('', {});
    changeUserOverlay.hidden = false;
    if (userNameInput instanceof HTMLInputElement) {
      userNameInput.focus();
      userNameInput.select();
    }
  }

  function closeChangeUserDialog() {
    if (changeUserOverlay instanceof HTMLElement) {
      changeUserOverlay.hidden = true;
    }
  }

  async function saveUserNameFromDialog() {
    if (!(userNameInput instanceof HTMLInputElement)) return;
    const next = userNameInput.value.trim();
    if (!next) return;
    const session = sessionSnapshot();
    const current = String(session.userName || '').trim();
    if (next === current) {
      closeChangeUserDialog();
      return;
    }
    if (await topicNameAlreadyExists(next, { excludeSelf: true })) {
      setUserNote(s.userNameAlreadyExists, { error: true });
      return;
    }
    if (changeUserDoneBtn instanceof HTMLButtonElement) {
      changeUserDoneBtn.disabled = true;
    }
    setUserNote(s.userNameSwitchingNote || 'Switching user…');
    try {
      if (onUserNameChange) await onUserNameChange(next);
      const btn = getUserNameBtn();
      if (btn instanceof HTMLElement) {
        btn.textContent = next || '—';
      }
      setUserNote(s.userNameSavedNote);
      closeChangeUserDialog();
      void refresh();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : s.userNameAlreadyExists;
      setUserNote(message, { error: true });
    } finally {
      if (changeUserDoneBtn instanceof HTMLButtonElement) {
        changeUserDoneBtn.disabled = false;
      }
    }
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
    const selfTopic = String(sessionSnapshot().topic || '').trim();
    let renderedSelf = false;
    let rowCount = 0;
    const list = Array.isArray(topics) ? topics : [];

    for (const entry of list) {
      const topic =
        typeof entry === 'string'
          ? String(entry).trim()
          : String(entry?.topic ?? '').trim();
      if (!topic) continue;
      const timezone =
        typeof entry === 'string'
          ? ''
          : String(entry?.timezone ?? '').trim();
      if (selfTopic && topic === selfTopic) {
        topicsPanel.appendChild(createSelfTopicRow(timezone));
        renderedSelf = true;
        rowCount += 1;
        continue;
      }
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
      rowCount += 1;
    }

    if (selfTopic && !renderedSelf) {
      topicsPanel.insertBefore(
        createSelfTopicRow(''),
        topicsPanel.firstChild
      );
      rowCount += 1;
    }

    if (!rowCount) {
      const empty = document.createElement('p');
      empty.className = cls(prefix, 'muted');
      empty.textContent = s.noUsers;
      topicsPanel.appendChild(empty);
    }
    syncUserNameDisplay();
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
      titleSelect.value = 'Tumor Board';
    }
    if (customTitle) {
      customTitle.value = '';
    }
    if (customGroup) {
      customGroup.hidden = true;
    }
    closeChangeUserDialog();
    if (userNote instanceof HTMLElement) {
      userNote.hidden = true;
    }
    syncUserNameDisplay();
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
    closeChangeUserDialog();
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
  closeBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    close();
  });
  topicsPanel?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest('[data-hub-conference-user-name-btn]');
    if (!(btn instanceof HTMLElement) || !topicsPanel.contains(btn)) return;
    event.stopPropagation();
    openChangeUserDialog();
  });
  changeUserDoneBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    void saveUserNameFromDialog();
  });
  changeUserCloseBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    closeChangeUserDialog();
  });
  openAnotherUserBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    void openAnotherUserSession();
  });
  userNameInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void saveUserNameFromDialog();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeChangeUserDialog();
    }
  });
  changeUserOverlay?.addEventListener('click', (event) => {
    if (event.target === changeUserOverlay) {
      closeChangeUserDialog();
    }
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
