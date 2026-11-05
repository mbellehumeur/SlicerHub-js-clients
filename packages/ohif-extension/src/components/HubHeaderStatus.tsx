import React, { useEffect, useState } from 'react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import HubService from '../services/HubService';
import EvidenceCreatorsDialog from './EvidenceCreatorsDialog';
import ConferenceDialog from './ConferenceDialog';
import ConferenceActions from './ConferenceActions';
import {
  hubHeaderStatusEqual,
  type HubHeaderStatusState,
} from '../hub/hub-header-status';

/** Magic-wand icon (lucide-style) for Evidence Creators. */
function MagicWandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
}

/**
 * Conferencing mark — lucide-style users glyph (same paths as
 * `@slicer-hub/conference-ui` HUB_CONFERENCE_ICON_SVG). Local React SVG so OHIF
 * theme fill rules don't paint black interiors.
 */
function ConferencingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path fill="none" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle fill="none" cx="9" cy="7" r="4" />
      <path fill="none" d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path fill="none" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EvidenceCreatorsButton({
  wsState,
  anyOnline,
  onClick,
}: {
  wsState: string;
  anyOnline: boolean;
  onClick: () => void;
}) {
  const connected = wsState === 'connected';
  const connecting = wsState === 'connecting';
  const colorClass = connected
    ? anyOnline
      ? 'text-green-400'
      : 'text-foreground'
    : connecting
      ? 'text-yellow-400'
      : 'text-muted-foreground opacity-80';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center border-0 bg-transparent p-0 ${colorClass} ${
            connecting ? 'animate-pulse' : ''
          }`}
          aria-label="Evidence Creators"
          onClick={onClick}
        >
          <MagicWandIcon className="h-5 w-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Evidence Creators</TooltipContent>
    </Tooltip>
  );
}

function conferenceTooltip(
  connected: boolean,
  conferenceActive: boolean,
  conferenceTitle: string,
  participantCount: number
): string {
  if (!connected) {
    return 'Conferencing (connect to Hub first)';
  }
  if (conferenceActive) {
    const title = conferenceTitle.trim() || 'Conference';
    const people =
      participantCount > 0
        ? ` · ${participantCount} participant${participantCount === 1 ? '' : 's'}`
        : '';
    return `${title}${people}`;
  }
  return 'Conferencing';
}

function ConferencingButton({
  wsState,
  conferenceActive,
  conferenceTitle,
  conferenceParticipants,
  onClick,
}: {
  wsState: string;
  conferenceActive: boolean;
  conferenceTitle: string;
  conferenceParticipants: string[];
  onClick: () => void;
}) {
  const connected = wsState === 'connected';
  const connecting = wsState === 'connecting';
  const colorClass = !connected
    ? connecting
      ? 'text-yellow-400'
      : 'text-muted-foreground opacity-80'
    : conferenceActive
      ? 'text-green-400'
      : 'text-foreground';
  const tooltip = conferenceTooltip(
    connected,
    conferenceActive,
    conferenceTitle,
    conferenceParticipants.length
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* span keeps tooltip hover when the ghost Button is disabled */}
        <span className="inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!connected}
            className={`hover:bg-muted ${colorClass} ${
              connecting ? 'animate-pulse' : ''
            }`}
            aria-label="Conferencing"
            aria-pressed={conferenceActive}
            onClick={onClick}
          >
            <ConferencingIcon className="h-5 w-5" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function HubHeaderStatus() {
  const { servicesManager } = useSystem();
  const hubService = servicesManager.services.hubService as HubService | undefined;
  const [status, setStatus] = useState<HubHeaderStatusState | null>(() =>
    hubService ? hubService.getHubHeaderStatus() : null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conferenceOpen, setConferenceOpen] = useState(false);

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
  const anyOnline =
    status.totalSegmentatorAvailable ||
    status.lungScreeningAvailable ||
    status.neuroSegAvailable;

  const conferenceView = hubService.getConferenceView();
  const followHost = hubService.getConferenceFollowHost();

  return (
    <>
      <div className="mr-1 inline-flex max-w-[min(100vw,42rem)] flex-wrap items-center gap-1">
        <EvidenceCreatorsButton
          wsState={status.wsState}
          anyOnline={anyOnline}
          onClick={() => setDialogOpen(true)}
        />
        <ConferencingButton
          wsState={status.wsState}
          conferenceActive={status.conferenceActive}
          conferenceTitle={status.conferenceTitle}
          conferenceParticipants={status.conferenceParticipants}
          onClick={() => setConferenceOpen(true)}
        />
        {status.conferenceActive ? (
          <ConferenceActions
            hubService={hubService}
            view={conferenceView}
            followHost={followHost}
            wsConnected={wsConnected}
            layout="header"
          />
        ) : null}
      </div>
      <EvidenceCreatorsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hubService={hubService}
        wsConnected={wsConnected}
        hasOpenStudy={hasOpenStudy}
      />
      <ConferenceDialog
        open={conferenceOpen}
        onOpenChange={setConferenceOpen}
        hubService={hubService}
        wsConnected={wsConnected}
      />
    </>
  );
}

export default HubHeaderStatus;
