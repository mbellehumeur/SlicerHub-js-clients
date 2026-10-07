import React, { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icons,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import HubService from '../services/HubService';
import TotalSegmentatorDialog from './TotalSegmentatorDialog';
import LungScreeningDialog from './LungScreeningDialog';
import NeuroSegDialog from './NeuroSegDialog';
import ConferenceDialog from './ConferenceDialog';
import SessionInfoDialog from './SessionInfoDialog';
import {
  hubHeaderStatusEqual,
  type HubHeaderStatusState,
} from '../hub/hub-header-status';
import { openCastHubPopup, resolveHubAdminUrl } from '@slicer-hub/client';
import { loadLocalDicomFromFiles } from '../hub/load-local-dicom-picker';

const HUB_HEADER_LABEL = 'Slicer Hub';

function hubConnectionIconStyle(
  wsState: string,
  conferenceActive: boolean
): {
  colorClass: string;
  iconClass: string;
  showDisconnectedMark: boolean;
  pulse: boolean;
  conferencePulse: boolean;
} {
  if (wsState === 'connected') {
    return {
      colorClass: 'text-green-400',
      iconClass: 'h-5 w-5',
      showDisconnectedMark: false,
      pulse: false,
      conferencePulse: conferenceActive,
    };
  }
  if (wsState === 'connecting') {
    return {
      colorClass: 'text-yellow-400',
      iconClass: 'h-5 w-5',
      showDisconnectedMark: false,
      pulse: true,
      conferencePulse: false,
    };
  }
  if (wsState === 'error' || wsState === 'disconnected') {
    return {
      colorClass: 'text-red-400',
      iconClass: 'h-5 w-5 opacity-70',
      showDisconnectedMark: true,
      pulse: false,
      conferencePulse: false,
    };
  }
  return {
    colorClass: 'text-muted-foreground',
    iconClass: 'h-5 w-5 opacity-50',
    showDisconnectedMark: true,
    pulse: false,
    conferencePulse: false,
  };
}

function HubHeaderStatus() {
  const { servicesManager } = useSystem();
  const hubService = servicesManager.services.hubService as HubService | undefined;
  const [status, setStatus] = useState<HubHeaderStatusState | null>(() =>
    hubService ? hubService.getHubHeaderStatus() : null
  );
  const [totalSegmentatorDialogOpen, setTotalSegmentatorDialogOpen] = useState(false);
  const [lungScreeningDialogOpen, setLungScreeningDialogOpen] = useState(false);
  const [neuroSegDialogOpen, setNeuroSegDialogOpen] = useState(false);
  const [conferenceDialogOpen, setConferenceDialogOpen] = useState(false);
  const [sessionInfoDialogOpen, setSessionInfoDialogOpen] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeDisplaySets =
    servicesManager.services.displaySetService?.activeDisplaySets ?? [];
  const hasOpenStudy = activeDisplaySets.some(
    (displaySet: { StudyInstanceUID?: string }) => !!displaySet.StudyInstanceUID?.trim()
  );

  useEffect(() => {
    if (!hubService) {
      return;
    }
    const sync = (next?: HubHeaderStatusState) => {
      const resolved = next ?? hubService.getHubHeaderStatus();
      setStatus(prev => (prev && hubHeaderStatusEqual(prev, resolved) ? prev : resolved));
    };
    sync();
    const { unsubscribe } = hubService.subscribe(HubService.EVENTS.STATUS_CHANGED, sync);
    return unsubscribe;
  }, [hubService]);

  if (!status || !hubService) {
    return null;
  }

  const wsConnected = status.wsState === 'connected';
  const canOpenResourceServerMenu = wsConnected;

  const resourceServerMenuSubtitle = (() => {
    if (!wsConnected) {
      return undefined;
    }
    if (!hasOpenStudy) {
      return 'Open a study first';
    }
    return undefined;
  })();

  const { colorClass, iconClass, showDisconnectedMark, pulse, conferencePulse } =
    hubConnectionIconStyle(status.wsState, status.conferenceActive);

  const openHubAdminPortal = () => {
    const hubEndpoint = hubService.getHub().hub_endpoint ?? '';
    openCastHubPopup(resolveHubAdminUrl(hubEndpoint), 'hubAdminPortalWindow');
  };

  const openConferenceClient = () => {
    setConferenceDialogOpen(true);
  };

  const openTotalSegmentatorDialog = () => {
    if (!canOpenResourceServerMenu) {
      return;
    }
    setTotalSegmentatorDialogOpen(true);
  };

  const openLungScreeningDialog = () => {
    if (!canOpenResourceServerMenu) {
      return;
    }
    setLungScreeningDialogOpen(true);
  };

  const openNeuroSegDialog = () => {
    if (!canOpenResourceServerMenu) {
      return;
    }
    setNeuroSegDialogOpen(true);
  };

  const openSessionInfoDialog = () => {
    setSessionInfoDialogOpen(true);
  };

  const openFilesPicker = (event: Event) => {
    event.preventDefault();
    const input = filesInputRef.current;
    if (!input || loadingLocal) {
      return;
    }
    input.value = '';
    input.click();
  };

  const openFolderPicker = (event: Event) => {
    event.preventDefault();
    const input = folderInputRef.current;
    if (!input || loadingLocal) {
      return;
    }
    input.value = '';
    input.click();
  };

  const handleLocalFilesSelected = async (fileList: FileList | null) => {
    if (!fileList?.length || loadingLocal) {
      return;
    }
    setLoadingLocal(true);
    try {
      await loadLocalDicomFromFiles(Array.from(fileList));
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cast-conference-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .cast-conference-pulse {
          animation: cast-conference-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
      <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mr-1 inline-flex items-center border-0 bg-transparent p-0"
              aria-label={HUB_HEADER_LABEL}
              aria-haspopup="menu"
            >
              <span
                className={`relative inline-flex items-center ${colorClass} ${pulse ? 'animate-pulse' : ''} ${conferencePulse ? 'cast-conference-pulse' : ''}`}
              >
                <Icons.Radio className={iconClass} />
                {showDisconnectedMark ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current opacity-90"
                  />
                ) : null}
              </span>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{HUB_HEADER_LABEL}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!canOpenResourceServerMenu || !hasOpenStudy}
          onSelect={openNeuroSegDialog}
          className="flex flex-col items-start gap-0.5"
        >
          <span>Neuro segmentation</span>
          {resourceServerMenuSubtitle ? (
            <span className="text-muted-foreground text-xs">{resourceServerMenuSubtitle}</span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canOpenResourceServerMenu || !hasOpenStudy}
          onSelect={openLungScreeningDialog}
          className="flex flex-col items-start gap-0.5"
        >
          <span>Lung screening</span>
          {resourceServerMenuSubtitle ? (
            <span className="text-muted-foreground text-xs">{resourceServerMenuSubtitle}</span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canOpenResourceServerMenu || !hasOpenStudy}
          onSelect={openTotalSegmentatorDialog}
          className="flex flex-col items-start gap-0.5"
        >
          <span>Total Segmentator</span>
          {resourceServerMenuSubtitle ? (
            <span className="text-muted-foreground text-xs">{resourceServerMenuSubtitle}</span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={loadingLocal} onSelect={openFolderPicker}>
          Upload folder
        </DropdownMenuItem>
        <DropdownMenuItem disabled={loadingLocal} onSelect={openFilesPicker}>
          Upload files
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={openConferenceClient}>Conferencing</DropdownMenuItem>
        <DropdownMenuItem onSelect={openHubAdminPortal}>Hub</DropdownMenuItem>
        <DropdownMenuItem onSelect={openSessionInfoDialog}>Session info</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <SessionInfoDialog
      open={sessionInfoDialogOpen}
      onOpenChange={setSessionInfoDialogOpen}
      status={status}
    />
    <TotalSegmentatorDialog
      open={totalSegmentatorDialogOpen}
      onOpenChange={setTotalSegmentatorDialogOpen}
      hubService={hubService}
      wsConnected={wsConnected}
    />
    <LungScreeningDialog
      open={lungScreeningDialogOpen}
      onOpenChange={setLungScreeningDialogOpen}
      hubService={hubService}
      wsConnected={wsConnected}
    />
    <NeuroSegDialog
      open={neuroSegDialogOpen}
      onOpenChange={setNeuroSegDialogOpen}
      hubService={hubService}
      wsConnected={wsConnected}
    />
    <ConferenceDialog
      open={conferenceDialogOpen}
      onOpenChange={setConferenceDialogOpen}
      hubService={hubService}
      wsConnected={wsConnected}
    />
    <input
      ref={filesInputRef}
      type="file"
      multiple
      accept="*/*"
      className="hidden"
      onChange={event => {
        void handleLocalFilesSelected(event.target.files);
        event.target.value = '';
      }}
    />
    <input
      ref={folderInputRef}
      type="file"
      multiple
      webkitdirectory="true"
      mozdirectory="true"
      className="hidden"
      onChange={event => {
        void handleLocalFilesSelected(event.target.files);
        event.target.value = '';
      }}
    />
    </>
  );
}

export default HubHeaderStatus;
