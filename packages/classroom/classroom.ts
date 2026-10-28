import {
  createHubConferenceDialog,
  createHubConferenceInviteController,
  deleteHubConference,
  HUB_CONFERENCE_ICON_SVG,
  shouldShowConferenceInvite,
  showHubInfoToast,
} from '@slicer-hub/client';
import {
  applyHeaderChrome,
  applyReportingChrome,
  conferenceStringsFor,
  persistLocale,
  applyDocumentLocale,
  resolveStoredLocale,
  wireLanguagePicker,
  type AppLocale,
} from '@slicer-hub/i18n';
import {
  addSnapshotAndRequestPng,
  autoConnect,
  createInitialState,
  downloadSnapshotLocally,
  hubEndpoint,
  illustrateTerm,
  openCourseScene,
  openSnapshotFullView,
  refreshReportContextFromStatus,
  removeSnapshot,
  rebindSessionUserName,
  requestStatusFromHostWorklist,
  selectCourseTerm,
  selectSegment,
  setCourse,
  sendConferenceChat,
  setConferenceFollowHost,
  setConferenceHubHandler,
  setConferenceLogListener,
  setConferenceView,
  setSegOpacity,
  setSegmentOpacity,
  setStatusListener,
  setStudyListener,
  setVolumeCropEnabled,
  setVolumeOpacity,
  setVolumePreset,
  setVolumeRoiVisible,
  setVolumeShift,
  toggleAllSegmentVisibility,
  toggleLabelsVisibility,
  toggleSegmentVisibility,
  toggleVolumeVisibility,
  type AppState,
} from './hub';
import { renderCoursePanel } from './course/course-ui';
import { postMviewCommand } from './course/mview-embed-controls';
import {
  COURSES,
  coursePanelVisibility,
  getCourse,
  pickLocale,
} from './course/registry';
import { sharedChromeFor } from './course/strings';
import {
  getStoredTableColumnOrder,
  getStoredTheme,
  REPORTING_ACTOR,
  setStoredTableColumnOrder,
  setStoredTheme,
  THEME_OHIF,
  THEME_SLICERLIVE,
} from './config';
import {
  mountSegOpacityChip,
  mountSegmentOpacityChips,
  mountVolOpacityChip,
  mountVolPresetButton,
  mountVolShiftSlider,
  renderReportDisplay,
  renderConferenceRoster,
  setSessionStatusControl,
  updateConnectionStatusUi,
} from './classroom-ui';
import {
  ensureSlicerLiveViewer,
  openHubViewer,
  setViewerButtonsEnabled,
  wireViewerButtons,
} from './viewers';
import { classroomAboutFor } from './about-content';

function applyTheme(theme: string): void {
  const next = theme === THEME_OHIF ? THEME_OHIF : THEME_SLICERLIVE;
  document.documentElement.dataset.theme = next;
  setStoredTheme(next);
}

function remountDisplay(state: AppState, reportDisplay: HTMLElement): void {
  renderReportDisplay(reportDisplay, state);
  mountVolOpacityChip(
    reportDisplay,
    () => state.volumeOpacity,
    (o) => {
      setVolumeOpacity(state, o);
      // Keep shift/preset enabled state in sync with opacity without full remount.
      const slider = reportDisplay.querySelector(
        '#rpVolShiftSlider'
      ) as HTMLInputElement | null;
      if (slider) slider.disabled = o <= 0.02;
      const preset = reportDisplay.querySelector(
        '#rpVolPresetBtn'
      ) as HTMLButtonElement | null;
      if (preset) preset.disabled = o <= 0.02;
      for (const id of ['rpVolCropSwitch', 'rpVolRoiBoxSwitch'] as const) {
        const sw = reportDisplay.querySelector(
          `#${id}`
        ) as HTMLButtonElement | null;
        if (sw) sw.disabled = o <= 0.02;
      }
    }
  );
  mountVolShiftSlider(
    reportDisplay,
    () => state.volumeShift,
    (hu) => setVolumeShift(state, hu),
    () => state.volumeOpacity
  );
  mountVolPresetButton(
    reportDisplay,
    () => state.volumePreset,
    (preset) => setVolumePreset(state, preset),
    () => state.volumeOpacity
  );
  mountSegOpacityChip(
    reportDisplay,
    () => state.segOpacity,
    (o) => setSegOpacity(state, o)
  );
  mountSegmentOpacityChips(
    reportDisplay,
    (n) => state.segmentOpacity[n] ?? 1,
    (n, o) => setSegmentOpacity(state, n, o)
  );
}

function wireReportDisplay(state: AppState, reportDisplay: HTMLElement): void {
  reportDisplay.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement | null;
    if (t?.closest('#rpRefreshIdBtn')) {
      void refreshReportContextFromStatus(state);
      return;
    }
    if (t?.closest('[data-add-snapshot]')) {
      ev.preventDefault();
      ev.stopPropagation();
      void addSnapshotAndRequestPng(state);
      return;
    }
    const viewSnap = t?.closest(
      '[data-view-snapshot]'
    ) as HTMLElement | null;
    if (viewSnap?.dataset.viewSnapshot) {
      ev.stopPropagation();
      openSnapshotFullView(state, viewSnap.dataset.viewSnapshot);
      return;
    }
    const downloadSnap = t?.closest(
      '[data-download-snapshot]'
    ) as HTMLElement | null;
    if (downloadSnap?.dataset.downloadSnapshot) {
      ev.stopPropagation();
      downloadSnapshotLocally(state, downloadSnap.dataset.downloadSnapshot);
      return;
    }
    const deleteSnap = t?.closest(
      '[data-delete-snapshot]'
    ) as HTMLElement | null;
    if (deleteSnap?.dataset.deleteSnapshot) {
      ev.stopPropagation();
      removeSnapshot(state, deleteSnap.dataset.deleteSnapshot);
      return;
    }
    if (t?.closest('#rpVolVisBtn')) {
      toggleVolumeVisibility(state);
      return;
    }
    if (t?.closest('[data-column-order-switch]')) {
      const next =
        getStoredTableColumnOrder() === 'controls-first'
          ? 'identity-first'
          : 'controls-first';
      setStoredTableColumnOrder(next);
      remountDisplay(state, reportDisplay);
      return;
    }
    const cropSw = t?.closest('#rpVolCropSwitch') as HTMLButtonElement | null;
    if (cropSw && !cropSw.disabled) {
      setVolumeCropEnabled(
        state,
        cropSw.getAttribute('aria-checked') !== 'true'
      );
      return;
    }
    const boxSw = t?.closest('#rpVolRoiBoxSwitch') as HTMLButtonElement | null;
    if (boxSw && !boxSw.disabled) {
      setVolumeRoiVisible(
        state,
        boxSw.getAttribute('aria-checked') !== 'true'
      );
      return;
    }
    if (
      t?.closest('#rpVolOpacityChip') ||
      t?.closest('#rpSegOpacityChip') ||
      t?.closest('[data-seg-opacity]') ||
      t?.closest('#rpVolShiftSlider') ||
      t?.closest('#rpVolPresetBtn')
    ) {
      return;
    }
    if (t?.closest('#rpSegAllVisBtn')) {
      void toggleAllSegmentVisibility(state);
      return;
    }
    if (t?.closest('#rpLabelsVisSwitch')) {
      void toggleLabelsVisibility(state);
      return;
    }
    if (t?.closest('[data-seg-stl]')) {
      ev.stopPropagation();
      return;
    }
    const eye = t?.closest('[data-seg-vis]') as HTMLElement | null;
    if (eye?.dataset.segVis != null) {
      ev.stopPropagation();
      void toggleSegmentVisibility(state, Number(eye.dataset.segVis));
      return;
    }
    const segRow = t?.closest('[data-seg-number]') as HTMLElement | null;
    if (segRow?.dataset.segNumber != null) {
      const num = Number(segRow.dataset.segNumber);
      if (Number.isFinite(num)) {
        selectSegment(state, num, segRow.dataset.segSop || '');
      }
    }
  });
}

function fillClassroomAbout(
  content: HTMLElement,
  titleEl: HTMLElement | null
): void {
  const about = classroomAboutFor(resolveStoredLocale());
  if (titleEl) titleEl.textContent = about.title;
  content.innerHTML = `<div class="rp-help-intro">${about.bodyHtml}</div>`;
}

function wireAbout(): void {
  const aboutBtn = document.getElementById(
    'castAboutBtn'
  ) as HTMLButtonElement | null;
  const aboutModal = document.getElementById('aboutModal') as HTMLElement | null;
  const aboutContent = document.getElementById(
    'aboutModalContent'
  ) as HTMLElement | null;
  const aboutTitle = document.getElementById(
    'aboutTitle'
  ) as HTMLElement | null;
  if (!aboutBtn || !aboutModal || !aboutContent) return;

  aboutBtn.addEventListener('click', () => {
    aboutModal.hidden = false;
    fillClassroomAbout(aboutContent, aboutTitle);
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      aboutModal.hidden = true;
    });
  });

  aboutModal.addEventListener('click', (ev) => {
    if (ev.target === aboutModal) aboutModal.hidden = true;
  });
}

function boot(): void {
  const locale = resolveStoredLocale();
  applyDocumentLocale(locale);
  applyHeaderChrome(document, locale);
  applyReportingChrome(document, locale);
  const conf = conferenceStringsFor(locale);
  const startBtn = document.getElementById(
    'startConferenceBtn'
  ) as HTMLButtonElement | null;
  if (startBtn) {
    startBtn.innerHTML = HUB_CONFERENCE_ICON_SVG;
    startBtn.setAttribute('aria-label', conf.conferencing);
    if (!startBtn.disabled) startBtn.title = conf.conferencing;
    else startBtn.title = conf.subscribeHubFirst;
  }
  const endBtn0 = document.getElementById(
    'endConferenceBtn'
  ) as HTMLButtonElement | null;
  if (endBtn0) {
    endBtn0.textContent = conf.leaveConference;
    endBtn0.setAttribute('aria-label', conf.leaveConference);
    endBtn0.title = conf.leaveConference;
  }
  applyTheme(getStoredTheme());

  const state = createInitialState();
  let statusWrap: HTMLElement | null = null;
  const reportDisplay = document.getElementById('reportDisplay') as HTMLElement;
  const glossaryPanel = document.getElementById('glossaryPanel') as HTMLElement;
  const courseSelect = document.getElementById(
    'courseSelect'
  ) as HTMLSelectElement | null;
  const confStrings = () => conferenceStringsFor(resolveStoredLocale());

  const fillCourseSelect = (localeCode?: AppLocale): void => {
    if (!courseSelect) return;
    const loc = localeCode || resolveStoredLocale();
    const shared = sharedChromeFor(loc);
    courseSelect.setAttribute('aria-label', shared.courseSelectAria);
    courseSelect.title = shared.courseSelectAria;
    courseSelect.innerHTML = COURSES.map(
      (c) =>
        `<option value="${c.id}">${pickLocale(c.title, loc)}</option>`
    ).join('');
    courseSelect.value = state.courseId;
  };

  const syncHeaderTitle = (localeCode?: AppLocale): void => {
    const loc = localeCode || resolveStoredLocale();
    const shared = sharedChromeFor(loc);
    const content = getCourse(state.courseId).contentFor(loc);
    const brandEl = document.querySelector('.rp-brand');
    if (brandEl) brandEl.textContent = shared.brand;
    document.title = content.headerTitle;
    fillCourseSelect(loc);
    const panel = document.querySelector('.rp-course-panel');
    if (panel) panel.setAttribute('aria-label', content.course);
  };
  syncHeaderTitle(locale);

  const syncConferenceChatChrome = (s: AppState): void => {
    const chrome = sharedChromeFor(resolveStoredLocale());
    const title = document.getElementById('conferenceLogTitle');
    if (title) title.textContent = chrome.conferenceLog;
    const input = document.getElementById(
      'conferenceChatInput'
    ) as HTMLInputElement | null;
    const send = document.getElementById(
      'conferenceChatSend'
    ) as HTMLButtonElement | null;
    const inConf =
      Boolean(s.conference) && s.connection === 'connected';
    if (input) {
      input.placeholder = chrome.chatPlaceholder;
      input.disabled = !inConf;
      if (!inConf) input.title = chrome.chatNeedConference;
      else input.removeAttribute('title');
    }
    if (send) {
      send.textContent = chrome.chatSend;
      send.disabled = !inConf;
    }
  };

  const syncCourseLayoutPanels = (s: AppState): void => {
    const { showScenePanel, showChatPanel } = coursePanelVisibility(
      getCourse(s.courseId)
    );
    const scenePanel = document.querySelector(
      '.rp-main-classroom > .rp-scene-panel'
    ) as HTMLElement | null;
    const chatPanel = document.querySelector(
      '.rp-main-classroom > .rp-chat-panel'
    ) as HTMLElement | null;
    if (scenePanel) scenePanel.hidden = !showScenePanel;
    if (chatPanel) chatPanel.hidden = !showChatPanel;
    document.documentElement.classList.toggle(
      'rp-course-hide-scene',
      !showScenePanel
    );
    document.documentElement.classList.toggle(
      'rp-course-hide-chat',
      !showChatPanel
    );
  };

  const remountCourse = (s: AppState): void => {
    syncCourseLayoutPanels(s);
    renderCoursePanel(glossaryPanel, s);
  };

  courseSelect?.addEventListener('change', () => {
    setCourse(state, courseSelect.value);
    syncHeaderTitle();
    remountCourse(state);
  });

  const syncConferenceLogUi = (s: AppState): void => {
    const log = document.getElementById(
      'conferenceLog'
    ) as HTMLTextAreaElement | null;
    if (!log) return;
    log.value = s.conferenceLogLines.join('\n');
    log.scrollTop = log.scrollHeight;
    syncConferenceChatChrome(s);
  };

  setStatusListener((s) => {
    updateConnectionStatusUi(statusWrap, s);
    setViewerButtonsEnabled(s.connection === 'connected', s);
    syncConferenceChatChrome(s);
    remountCourse(s);
  });
  setStudyListener((s) => {
    remountDisplay(s, reportDisplay);
    remountCourse(s);
  });
  setConferenceLogListener((s) => {
    syncConferenceLogUi(s);
  });

  let conferenceDialog: ReturnType<typeof createHubConferenceDialog> | null =
    null;
  let inviteController: ReturnType<
    typeof createHubConferenceInviteController
  > | null = null;
  let openConferenceDialog = (
    _anchor?: HTMLElement | null
  ): void => {
    console.warn('[@slicer-hub/classroom] conference dialog not available');
  };
  try {
    conferenceDialog = createHubConferenceDialog({
      classPrefix: 'hub-conference',
      strings: confStrings(),
      getSession: () => ({
        hubEndpoint: hubEndpoint(state),
        topic: state.topic,
        subscriberName: state.subscriberName,
        userName: state.userName,
        connected: state.connection === 'connected',
      }),
      onConferenceChange: (view) => {
        setConferenceView(state, view);
        syncConferenceChatChrome(state);
      },
      onFollowChange: (followHost) => {
        setConferenceFollowHost(state, followHost);
      },
      onUserNameChange: async (userName) => {
        await rebindSessionUserName(state, userName);
      },
    });
    setSessionStatusControl(conferenceDialog.getSessionControl());
    statusWrap = conferenceDialog.getSessionControl().label;
    openConferenceDialog = (anchor) => conferenceDialog!.open(anchor ?? null);
  } catch (err) {
    console.error('[@slicer-hub/classroom] conference dialog init failed', err);
  }

  try {
    inviteController = createHubConferenceInviteController({
      classPrefix: 'hub-conference-invite',
      strings: confStrings(),
      getSession: () => ({
        hubEndpoint: hubEndpoint(state),
        topic: state.topic,
        subscriberName: state.subscriberName,
        userName: state.userName,
        connected: state.connection === 'connected',
      }),
      shouldShow: () =>
        shouldShowConferenceInvite({
          selfActors: [REPORTING_ACTOR],
          connectedActors: [],
        }),
      onConferenceChange: (view) => {
        setConferenceView(state, view);
        syncConferenceChatChrome(state);
      },
      onFollowChange: (followHost, invite) => {
        setConferenceFollowHost(state, followHost);
        if (followHost) {
          // Open IRA under the invite click gesture so later ImagingStudy-open
          // can focus the tab instead of hitting a popup blocker.
          ensureSlicerLiveViewer(state, { reason: 'conference-join-follow' });
        }
        const hostTopic = String(invite?.hostTopic || '').trim();
        if (followHost && hostTopic) {
          void requestStatusFromHostWorklist(state, hostTopic);
        }
      },
      onLeadChange: (info) => {
        const label =
          String(info?.leaderLabel || info?.leaderUserName || '').trim() ||
          'Someone';
        showHubInfoToast(`${label} took over`);
      },
    });
    setConferenceHubHandler((message) =>
      inviteController!.handleHubMessage(message)
    );
  } catch (err) {
    console.error('[@slicer-hub/classroom] conference invite init failed', err);
  }

  wireLanguagePicker({
    getLocale: resolveStoredLocale,
    setLocale: (code: AppLocale) => {
      persistLocale(code);
      applyHeaderChrome(document, code);
      applyReportingChrome(document, code);
      const strings = conferenceStringsFor(code);
      conferenceDialog?.setStrings?.(strings);
      inviteController?.setStrings?.(strings);
      const startBtn = document.getElementById(
        'startConferenceBtn'
      ) as HTMLButtonElement | null;
      if (startBtn) {
        if (!startBtn.querySelector('svg')) {
          startBtn.innerHTML = HUB_CONFERENCE_ICON_SVG;
        }
        startBtn.setAttribute('aria-label', strings.conferencing);
        if (!startBtn.disabled) startBtn.title = strings.conferencing;
        else startBtn.title = strings.subscribeHubFirst;
      }
      const endBtn = document.getElementById(
        'endConferenceBtn'
      ) as HTMLButtonElement | null;
      if (endBtn) {
        endBtn.textContent = strings.leaveConference;
        endBtn.setAttribute('aria-label', strings.leaveConference);
        endBtn.title = strings.leaveConference;
      }
      renderConferenceRoster(state);
      remountCourse(state);
      syncConferenceChatChrome(state);
      syncHeaderTitle(code);
      const aboutModal = document.getElementById('aboutModal');
      const aboutContent = document.getElementById('aboutModalContent');
      const aboutTitle = document.getElementById('aboutTitle');
      if (
        aboutModal &&
        !aboutModal.hidden &&
        aboutContent instanceof HTMLElement
      ) {
        fillClassroomAbout(
          aboutContent,
          aboutTitle instanceof HTMLElement ? aboutTitle : null
        );
      }
    },
  });

  document
    .getElementById('startConferenceBtn')
    ?.addEventListener('click', (ev) => {
      const btn =
        ev.currentTarget instanceof HTMLElement ? ev.currentTarget : null;
      openConferenceDialog(btn);
    });

  document.getElementById('endConferenceBtn')?.addEventListener('click', () => {
    const view = state.conference;
    if (!view || state.connection !== 'connected') return;
    const endBtn = document.getElementById(
      'endConferenceBtn'
    ) as HTMLButtonElement | null;
    const hostAction = Boolean(view.isConferenceOwner);
    if (endBtn) {
      endBtn.disabled = true;
      const s = conferenceStringsFor(resolveStoredLocale());
      endBtn.textContent = hostAction ? s.ending : s.leaving;
    }
    void deleteHubConference(
      hubEndpoint(state),
      view.hostTopic,
      hostAction ? undefined : state.topic
    )
      .then(() => {
        setConferenceView(state, null);
      })
      .catch((err) => {
        console.error('[@slicer-hub/classroom] end conference failed', err);
      })
      .finally(() => {
        updateConnectionStatusUi(statusWrap, state);
        syncConferenceChatChrome(state);
      });
  });

  wireAbout();
  wireReportDisplay(state, reportDisplay);

  const onCourseClick = (ev: MouseEvent): void => {
    const t = ev.target as HTMLElement | null;
    const mviewAction = t?.closest(
      '[data-mview-action]'
    ) as HTMLElement | null;
    if (mviewAction?.dataset.mviewAction) {
      const card = mviewAction.closest(
        '.rp-mview-card'
      ) as HTMLElement | null;
      const iframe = card?.querySelector(
        'iframe.rp-mview-frame'
      ) as HTMLIFrameElement | null;
      postMviewCommand(iframe, mviewAction.dataset.mviewAction);
      return;
    }
    const openScene = t?.closest('[data-open-scene]') as HTMLElement | null;
    if (openScene?.dataset.openScene) {
      const key = openScene.dataset.openScene;
      if (
        key === 'kits-00038' ||
        key === 'totalsegmentator-ct' ||
        key === 'ctaabdomen-panoramix'
      ) {
        openScene.setAttribute('disabled', '');
        void openCourseScene(state, key).finally(() => {
          if (state.connection === 'connected') {
            openScene.removeAttribute('disabled');
          }
          remountCourse(state);
        });
      }
      return;
    }
    const illustrate = t?.closest(
      '[data-illustrate-term]'
    ) as HTMLElement | null;
    if (illustrate?.dataset.illustrateTerm) {
      const termId = illustrate.dataset.illustrateTerm;
      selectCourseTerm(state, termId);
      openHubViewer(state, 'ira');
      void illustrateTerm(state, termId).then(() => remountCourse(state));
      return;
    }
    const row = t?.closest('[data-term-id]') as HTMLElement | null;
    if (row?.dataset.termId && !t?.closest('[data-illustrate-term]')) {
      selectCourseTerm(state, row.dataset.termId);
      remountCourse(state);
    }
  };
  glossaryPanel?.addEventListener('click', onCourseClick);

  document
    .getElementById('conferenceChatForm')
    ?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const input = document.getElementById(
        'conferenceChatInput'
      ) as HTMLInputElement | null;
      if (!input) return;
      const text = input.value;
      input.value = '';
      void sendConferenceChat(state, text);
    });

  updateConnectionStatusUi(statusWrap, state);
  wireViewerButtons(state);
  remountDisplay(state, reportDisplay);
  remountCourse(state);
  syncConferenceLogUi(state);

  console.info(
    '[@slicer-hub/classroom] boot hub=',
    state.hubKey,
    hubEndpoint(state),
    'topic=',
    state.topic || '(from token)'
  );

  autoConnect(state).catch((err) => {
    console.error('[@slicer-hub/classroom] auto-connect error', err);
  });
}

boot();
