import {
  clearHubDialogNearAnchor,
  createHubConferenceDialog,
  createHubConferenceInviteController,
  confirmHubConferenceTakeover,
  HUB_WORKLIST_WINDOW_NAME,
  deleteHubConference,
  placeHubDialogNearAnchor,
  shouldShowConferenceInvite,
  showHubInfoToast,
  transferHubConferenceLead,
} from '@slicer-hub/client';
import { refreshHelpIfOpen, showHelp } from './help';
import {
  applyChromeLabels,
  conferenceStrings,
  getLocale,
  initI18n,
  onLanguageChanged,
  setLocale,
} from './i18n';
import { wireLanguagePicker } from '@slicer-hub/i18n';
import {
  addSegrouletteToWorklist,
  autoConnect,
  connectedActorsFromState,
  createInitialState,
  dismissOpenStartHint,
  ensureCbctDentalLoaded,
  ensureTxrvLoaded,
  ensureFlexrayLoaded,
  ensureIdcSegmentationsLoaded,
  ensureIdcWsiLoaded,
  ensureSlicerLiveViewer,
  ensureSlicerScenesLoaded,
  handleWorklistClose,
  hubEndpoint,
  openHubViewer,
  openHubMirrorViewer,
  publishSegrouletteOpen,
  requestStatusFromHostWorklist,
  setConferenceFollowHost,
  setConferenceHubHandler,
  setConferenceView,
  selectDefaultWorklistOrg,
  setStatusListener,
  setViewerButtonsEnabled,
  setWorklistListener,
  type AppState,
} from './hub';
import {
  LOG_PREFIX,
  WORKLIST_ACTOR,
  WORKLIST_ORG_MINE,
  WORKLIST_ORG_TXRV,
  WORKLIST_ORG_FLEXRAY,
  getStoredUserName,
  isIdcCategoryFilterValue,
  setStoredUserName,
} from './config';
import {
  setStoredTheme,
  THEME_SLICERLIVE,
  type ViewerKind,
} from './config';
import { openSegrouletteDialog } from './segroulette-dialog';
import { openIdcNlDialog } from './idc-nl-dialog';
import { openIdcSearchDialog } from './idc-search-dialog';
import {
  closeInferenceInfoDialog,
  wireInferenceInfoButtons,
} from './inference-info-dialog';
import { wireOmiFhirDialog } from './omi-fhir-dialog';
import {
  loadIdcCustomWorklistsFromSession,
  refreshOrgSelectWithCustomWorklists,
} from './idc-nl-worklists';
import {
  loadMyWorklistFromStorage,
  mergeMyWorklistStudies,
  myWorklistStudies,
  parseMyWorklistFile,
} from './samples';
import {
  renderConferenceRoster,
  renderWorklistContext,
  renderWorklistTable,
  setSessionStatusControl,
  syncSizeSortHeader,
  toggleSizeSortDir,
  updateConnectionStatusUi,
} from './worklist-ui';

function applyTheme(): void {
  document.documentElement.dataset.theme = THEME_SLICERLIVE;
  setStoredTheme(THEME_SLICERLIVE);
}

const MODAL_ANCHORED = 'wl-modal-backdrop-anchored';

function wireMenus(state: AppState): void {
  const helpBtn = document.getElementById(
    'castHelpBtn'
  ) as HTMLButtonElement | null;
  const helpModal = document.getElementById('helpModal') as HTMLElement;
  const helpDialog = helpModal.querySelector('.wl-modal') as HTMLElement | null;

  const closeHelpModal = () => {
    helpModal.hidden = true;
    clearHubDialogNearAnchor(helpModal, helpDialog, MODAL_ANCHORED);
  };

  const openHelpModal = () => {
    showHelp(helpModal);
    placeHubDialogNearAnchor({
      overlay: helpModal,
      dialog: helpDialog,
      anchor: helpBtn,
      anchoredClass: MODAL_ANCHORED,
      align: 'end',
    });
  };

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

  helpBtn?.addEventListener('click', () => {
    openHelpModal();
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      closeHelpModal();
    });
  });

  helpModal.addEventListener('click', (ev) => {
    if (ev.target === helpModal) closeHelpModal();
  });

  document.querySelectorAll('[data-close-inference-info]').forEach((el) => {
    el.addEventListener('click', () => closeInferenceInfoDialog());
  });
  document
    .getElementById('inferenceInfoModal')
    ?.addEventListener('click', (ev) => {
      if (ev.target === ev.currentTarget) closeInferenceInfoDialog();
    });
}

function wireViewerButtons(state: AppState, onWorklistChanged: () => void): void {
  const map: Array<{ id: string; kind: ViewerKind }> = [
    { id: 'openReportingBtn', kind: 'reporting' },
    { id: 'openSt444Btn', kind: 'classroom' },
    { id: 'openIraBtn', kind: 'ira' },
    { id: 'openOhifBtn', kind: 'ohif' },
    { id: 'openSlimBtn', kind: 'slim' },
  ];
  for (const { id, kind } of map) {
    document.getElementById(id)?.addEventListener('click', () => {
      openHubViewer(state, kind);
    });
  }
  document.getElementById('openHubMirrorBtn')?.addEventListener('click', () => {
    openHubMirrorViewer(state);
  });
  document.getElementById('openSegrouletteBtn')?.addEventListener('click', () => {
    openSegrouletteDialog({
      onOpen: (entry) =>
        publishSegrouletteOpen(state, entry).catch((err) => {
          console.error(`${LOG_PREFIX} SegRoulette open failed`, err);
        }),
      onAddToWorklist: (entry) =>
        addSegrouletteToWorklist(state, entry)
          .then(() => {
            const orgSelect = document.getElementById(
              'worklistOrgSelect'
            ) as HTMLSelectElement | null;
            if (orgSelect) orgSelect.value = WORKLIST_ORG_MINE;
            onWorklistChanged();
          })
          .catch((err) => {
            console.error(`${LOG_PREFIX} SegRoulette add failed`, err);
          }),
    });
  });
}

async function boot(): Promise<void> {
  // Claim shared name so IRA/reporting can focus this tab via window.open(url, name).
  try {
    window.name = HUB_WORKLIST_WINDOW_NAME;
  } catch {
    /* ignore */
  }
  await initI18n();
  applyTheme();

  const state = createInitialState();
  state.allStudies = mergeMyWorklistStudies(
    state.allStudies,
    loadMyWorklistFromStorage()
  );
  let statusWrap: HTMLElement | null = null;
  const tableBody = document.getElementById('worklistBody') as HTMLElement;
  const emptyRow = document.getElementById('worklistEmpty') as HTMLElement;
  const orgSelect = document.getElementById(
    'worklistOrgSelect'
  ) as HTMLSelectElement;
  loadIdcCustomWorklistsFromSession();
  refreshOrgSelectWithCustomWorklists(orgSelect);
  selectDefaultWorklistOrg();

  const refreshTable = () =>
    renderWorklistTable(tableBody, emptyRow, state, orgSelect.value);

  const sizeSortBtn = document.getElementById(
    'worklistSizeSortBtn'
  ) as HTMLButtonElement | null;
  sizeSortBtn?.addEventListener('click', () => {
    toggleSizeSortDir();
    syncSizeSortHeader();
    refreshTable();
  });
  syncSizeSortHeader();

  const setFooter = (_msg: string) => {
    /* footer status removed */
  };

  setStatusListener((s) => {
    updateConnectionStatusUi(statusWrap, s);
    setViewerButtonsEnabled(s.connection === 'connected', s);
  });
  setWorklistListener(() => refreshTable());

  let conferenceDialog: ReturnType<typeof createHubConferenceDialog> | null =
    null;
  let inviteController: ReturnType<
    typeof createHubConferenceInviteController
  > | null = null;
  let openConferenceDialog = (
    _anchor?: HTMLElement | null
  ): void => {
    console.warn('[@slicer-hub/worklist] conference dialog not available');
  };
  try {
    conferenceDialog = createHubConferenceDialog({
      classPrefix: 'hub-conference',
      strings: conferenceStrings(),
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
    console.error('[@slicer-hub/worklist] conference dialog init failed', err);
  }

  try {
    inviteController = createHubConferenceInviteController({
      classPrefix: 'hub-conference-invite',
      strings: conferenceStrings(),
      getSession: () => ({
        hubEndpoint: hubEndpoint(state),
        topic: state.topic,
        subscriberName: state.subscriberName,
        userName: state.userName,
        connected: state.connection === 'connected',
      }),
      shouldShow: () =>
        shouldShowConferenceInvite({
          selfActors: [WORKLIST_ACTOR],
          connectedActors: connectedActorsFromState(state),
        }),
      onConferenceChange: (view) => {
        setConferenceView(state, view);
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
    console.error('[@slicer-hub/worklist] conference invite init failed', err);
  }

  const helpModalEl = document.getElementById('helpModal') as HTMLElement | null;
  onLanguageChanged(() => {
    applyChromeLabels();
    renderWorklistContext(state);
    renderConferenceRoster(state);
    refreshHelpIfOpen(helpModalEl);
    conferenceDialog?.setStrings?.(conferenceStrings());
    inviteController?.setStrings?.(conferenceStrings());
    const refreshTableOnLang = () =>
      renderWorklistTable(tableBody, emptyRow, state, orgSelect.value);
    refreshTableOnLang();
  });

  document.getElementById('closeContextBtn')?.addEventListener('click', () => {
    void handleWorklistClose(state).catch((err) => {
      console.error(`${LOG_PREFIX} close context failed`, err);
    });
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
      endBtn.textContent = hostAction ? 'Ending…' : 'Leaving…';
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
        console.error('[@slicer-hub/worklist] end conference failed', err);
      })
      .finally(() => {
        updateConnectionStatusUi(statusWrap, state);
      });
  });

  document.getElementById('stopFollowingBtn')?.addEventListener('click', () => {
    if (!state.conference || !state.conferenceFollowHost) return;
    setConferenceFollowHost(state, false);
  });

  document.getElementById('resumeFollowingBtn')?.addEventListener('click', () => {
    if (!state.conference || state.conferenceFollowHost) return;
    if (state.conference.selfRole === 'leading') return;
    setConferenceFollowHost(state, true);
  });

  document
    .getElementById('takeOverConferenceBtn')
    ?.addEventListener('click', () => {
      void (async () => {
        const view = state.conference;
        if (!view || state.connection !== 'connected' || !state.topic) return;
        if (view.selfRole === 'leading' || state.conferenceFollowHost) return;
        const ok = await confirmHubConferenceTakeover({
          strings: conferenceStrings(),
        });
        if (!ok) return;
        try {
          await transferHubConferenceLead(
            hubEndpoint(state),
            view.hostTopic,
            state.topic,
            state.userName || undefined
          );
        } catch (err) {
          console.error('[@slicer-hub/worklist] take over failed', err);
          showHubInfoToast(
            err instanceof Error ? err.message : 'Failed to take over'
          );
        }
      })();
    });

  document.getElementById('downloadWorklistBtn')?.addEventListener('click', () => {
    const payload = {
      version: 1,
      studies: myWorklistStudies(state.allStudies),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-worklist.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  const uploadModal = document.getElementById(
    'uploadWorklistModal'
  ) as HTMLElement | null;
  const uploadFileInput = document.getElementById(
    'uploadWorklistFile'
  ) as HTMLInputElement | null;
  const uploadStatus = document.getElementById(
    'uploadWorklistStatus'
  ) as HTMLElement | null;
  const uploadConfirmBtn = document.getElementById(
    'uploadWorklistConfirmBtn'
  ) as HTMLButtonElement | null;

  const closeUploadModal = () => {
    if (!uploadModal) return;
    uploadModal.hidden = true;
    if (uploadFileInput) uploadFileInput.value = '';
    if (uploadStatus) uploadStatus.textContent = '';
    if (uploadConfirmBtn) uploadConfirmBtn.disabled = true;
  };

  document.getElementById('uploadWorklistBtn')?.addEventListener('click', () => {
    if (uploadFileInput) uploadFileInput.value = '';
    if (uploadStatus) uploadStatus.textContent = '';
    if (uploadConfirmBtn) uploadConfirmBtn.disabled = true;
    if (uploadModal) uploadModal.hidden = false;
  });

  document.querySelectorAll('[data-close-upload-worklist]').forEach((el) => {
    el.addEventListener('click', () => closeUploadModal());
  });
  uploadModal?.addEventListener('click', (ev) => {
    if (ev.target === uploadModal) closeUploadModal();
  });

  uploadFileInput?.addEventListener('change', () => {
    if (uploadStatus) uploadStatus.textContent = '';
    if (uploadConfirmBtn) {
      uploadConfirmBtn.disabled = !uploadFileInput.files?.length;
    }
  });

  uploadConfirmBtn?.addEventListener('click', () => {
    const file = uploadFileInput?.files?.[0];
    if (!file) {
      if (uploadStatus) uploadStatus.textContent = 'Choose a JSON file first.';
      return;
    }
    uploadConfirmBtn.disabled = true;
    if (uploadStatus) uploadStatus.textContent = 'Reading…';
    void file
      .text()
      .then((text) => {
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('File is not valid JSON');
        }
        const incoming = parseMyWorklistFile(data);
        if (!incoming.length) {
          throw new Error('No studies found in that file');
        }
        state.allStudies = mergeMyWorklistStudies(state.allStudies, incoming);
        orgSelect.value = WORKLIST_ORG_MINE;
        dismissOpenStartHint();
        refreshTable();
        closeUploadModal();
      })
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Failed to upload worklist';
        if (uploadStatus) uploadStatus.textContent = msg;
        if (uploadConfirmBtn) uploadConfirmBtn.disabled = false;
        console.error('[@slicer-hub/worklist] upload worklist failed', err);
      });
  });

  document.getElementById('openIdcNlBtn')?.addEventListener('click', () => {
    openIdcNlDialog({
      getState: () => state,
      onStudiesChanged: () => refreshTable(),
      setOrgFilter: (organization) => {
        dismissOpenStartHint();
        orgSelect.value = organization;
        refreshOrgSelectWithCustomWorklists(orgSelect);
        orgSelect.value = organization;
        refreshTable();
      },
    });
  });

  document.getElementById('openIdcAgentBtn')?.addEventListener('click', () => {
    openIdcSearchDialog({
      getState: () => state,
      onStudiesChanged: () => refreshTable(),
      setOrgFilter: (organization) => {
        dismissOpenStartHint();
        orgSelect.value = organization;
        refreshOrgSelectWithCustomWorklists(orgSelect);
        orgSelect.value = organization;
        refreshTable();
      },
    });
  });

  orgSelect.addEventListener('change', () => {
    dismissOpenStartHint();
    refreshTable();
    if (orgSelect.value === 'cbct-dental') {
      void ensureCbctDentalLoaded(state, setFooter)
        .then(() => {
          refreshTable();
        })
        .catch(() => {
          refreshTable();
        });
    }
    if (orgSelect.value === WORKLIST_ORG_TXRV) {
      void ensureTxrvLoaded(state, setFooter)
        .then(() => {
          refreshTable();
        })
        .catch(() => {
          refreshTable();
        });
    }
    if (orgSelect.value === WORKLIST_ORG_FLEXRAY) {
      void ensureFlexrayLoaded(state, setFooter)
        .then(() => {
          refreshTable();
        })
        .catch(() => {
          refreshTable();
        });
    }
    if (isIdcCategoryFilterValue(orgSelect.value)) {
      void ensureIdcSegmentationsLoaded(state, setFooter)
        .then(() => {
          refreshTable();
          if (state.connection === 'connected') {
            updateConnectionStatusUi(statusWrap, state);
          }
        })
        .catch(() => {
          refreshTable();
        });
    }
  });

  wireLanguagePicker({
    getLocale,
    setLocale,
  });
  applyChromeLabels();
  wireMenus(state);
  wireViewerButtons(state, refreshTable);
  wireInferenceInfoButtons(state);
  wireOmiFhirDialog();
  updateConnectionStatusUi(statusWrap, state);
  setViewerButtonsEnabled(state.connection === 'connected', state);
  refreshTable();

  void ensureIdcWsiLoaded(state, setFooter)
    .then(() => {
      refreshTable();
    })
    .catch(() => {
      refreshTable();
    });

  void ensureSlicerScenesLoaded(state, setFooter)
    .then(() => {
      refreshTable();
    })
    .catch(() => {
      refreshTable();
    });

  void ensureCbctDentalLoaded(state, setFooter)
    .then(() => {
      refreshTable();
    })
    .catch(() => {
      refreshTable();
    });

  void ensureFlexrayLoaded(state, setFooter)
    .then(() => {
      refreshTable();
    })
    .catch(() => {
      refreshTable();
    });

  if (isIdcCategoryFilterValue(orgSelect.value)) {
    void ensureIdcSegmentationsLoaded(state, setFooter)
      .then(() => {
        refreshTable();
        if (state.connection === 'connected') {
          updateConnectionStatusUi(statusWrap, state);
        }
      })
      .catch(() => {
        refreshTable();
      });
  }

  console.info(
    '[@slicer-hub/worklist] boot hub=',
    state.hubKey,
    hubEndpoint(state),
    'topic=',
    state.topic || '(from token)'
  );

  autoConnect(state).catch((err) => {
    console.error('[@slicer-hub/worklist] auto-connect error', err);
  });
}

void boot();
