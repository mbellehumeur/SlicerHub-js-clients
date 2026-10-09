import {
  createHubConferenceDialog,
  createHubConferenceInviteController,
  deleteHubConference,
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
  addMeasurementForSegment,
  addMeasurementForSelectedOrFirst,
  addSnapshotAndRequestPng,
  autoConnect,
  createInitialState,
  downloadSnapshotLocally,
  handleReportingClose,
  hubEndpoint,
  openSnapshotFullView,
  refreshReportContextFromStatus,
  removeMeasurement,
  removeSnapshot,
  requestStatusFromHostWorklist,
  selectMeasurement,
  selectSegment,
  setConferenceFollowHost,
  setConferenceHubHandler,
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
import {
  getStoredTheme,
  REPORTING_ACTOR,
  setStoredTheme,
  setStoredUserName,
  THEME_OHIF,
  THEME_SLICERLIVE,
} from './config';
import {
  closeMenus,
  mountSegOpacityChip,
  mountSegmentOpacityChips,
  mountVolOpacityChip,
  mountVolPresetButton,
  mountVolShiftSlider,
  renderReportContext,
  renderReportDisplay,
  renderConferenceRoster,
  setSessionStatusControl,
  updateConnectionStatusUi,
} from './classroom-ui';
import {
  setViewerButtonsEnabled,
  updateViewerPresenceButtons,
  wireViewerButtons,
} from './viewers';

function applyTheme(theme: string): void {
  const next = theme === THEME_OHIF ? THEME_OHIF : THEME_SLICERLIVE;
  document.documentElement.dataset.theme = next;
  setStoredTheme(next);
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-option]')
    .forEach((btn) => {
      const active = btn.dataset.themeOption === next;
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
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
    const removeBtn = t?.closest(
      '[data-remove-measurement]'
    ) as HTMLElement | null;
    if (removeBtn?.dataset.removeMeasurement) {
      ev.stopPropagation();
      removeMeasurement(state, removeBtn.dataset.removeMeasurement);
      return;
    }
    const addBtn = t?.closest('[data-add-measurement]') as HTMLElement | null;
    if (addBtn) {
      ev.stopPropagation();
      const segNum = Number(addBtn.dataset.segNumber);
      if (Number.isFinite(segNum)) {
        addMeasurementForSegment(
          state,
          segNum,
          addBtn.dataset.segSop || undefined
        );
      } else {
        addMeasurementForSelectedOrFirst(state);
      }
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
    const measRow = t?.closest('[data-measurement-id]') as HTMLElement | null;
    if (measRow?.dataset.measurementId) {
      selectMeasurement(state, measRow.dataset.measurementId);
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

function wireMenus(_state: AppState): void {
  const settingsBtn = document.getElementById(
    'castSettingsBtn'
  ) as HTMLButtonElement;
  const settingsMenu = document.getElementById(
    'castSettingsMenu'
  ) as HTMLElement;
  const aboutModal = document.getElementById('aboutModal') as HTMLElement;

  const closeAllMenus = () => {
    closeMenus(settingsMenu);
  };

  settingsBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const open = settingsMenu.hidden;
    closeAllMenus();
    settingsMenu.hidden = !open;
    settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', () => {
    closeAllMenus();
    settingsBtn.setAttribute('aria-expanded', 'false');
  });

  settingsMenu.addEventListener('click', (ev) => ev.stopPropagation());

  const saveSessionUserName = () => {
    const input = document.getElementById(
      'sessionUserNameInput'
    ) as HTMLInputElement | null;
    if (!input) return;
    setStoredUserName(input.value.trim());
    const note = document.getElementById('sessionChangeUserNote');
    if (note) note.hidden = false;
  };

  document
    .getElementById('sessionChangeUserBtn')
    ?.addEventListener('click', saveSessionUserName);

  document
    .getElementById('sessionUserNameInput')
    ?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        saveSessionUserName();
      }
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-option]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.themeOption || THEME_SLICERLIVE);
        closeAllMenus();
      });
    });

  document.getElementById('castAboutBtn')?.addEventListener('click', () => {
    aboutModal.hidden = false;
    closeAllMenus();
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      aboutModal.hidden = true;
    });
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
    startBtn.textContent = conf.conferencing;
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
  const confStrings = () => conferenceStringsFor(resolveStoredLocale());

  setStatusListener((s) => {
    updateConnectionStatusUi(statusWrap, s);
    setViewerButtonsEnabled(s.connection === 'connected', s);
  });
  setStudyListener((s) => {
    renderReportContext(s);
    remountDisplay(s, reportDisplay);
    updateViewerPresenceButtons(s);
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
      },
      onFollowChange: (followHost) => {
        setConferenceFollowHost(state, followHost);
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
      },
      onFollowChange: (followHost, invite) => {
        setConferenceFollowHost(state, followHost);
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
        startBtn.textContent = strings.conferencing;
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
      renderReportContext(state);
    },
  });

  document.getElementById('closeContextBtn')?.addEventListener('click', () => {
    void handleReportingClose(state).catch((err) => {
      console.error('[@slicer-hub/classroom] close context failed', err);
    });
  });

  for (const id of [
    'reportSaveBtn',
    'reportCompleteBtn',
    'reportCancelBtn',
  ] as const) {
    document.getElementById(id)?.addEventListener('click', () => {
      window.close();
    });
  }

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
      });
  });

  wireMenus(state);
  wireViewerButtons(state);
  wireReportDisplay(state, reportDisplay);
  updateConnectionStatusUi(statusWrap, state);
  setViewerButtonsEnabled(state.connection === 'connected', state);
  renderReportContext(state);
  remountDisplay(state, reportDisplay);

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
