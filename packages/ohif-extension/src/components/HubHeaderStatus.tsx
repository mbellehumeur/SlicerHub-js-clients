import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import HubService from '../services/HubService';
import EvidenceCreatorsDialog from './EvidenceCreatorsDialog';
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
 * Conferencing mark — same paths as @slicer-hub/client HUB_CONFERENCE_ICON_SVG.
 * Rendered as React SVG (like MagicWand) so OHIF theme fill rules don't paint black interiors.
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

function ConferencingButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center border-0 bg-transparent p-0 text-muted-foreground opacity-50"
          aria-label="Conferencing"
        >
          <ConferencingIcon className="h-5 w-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Conferencing (unavailable)</TooltipContent>
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

  return (
    <>
      <div className="mr-1 inline-flex items-center gap-2">
        <EvidenceCreatorsButton
          wsState={status.wsState}
          anyOnline={anyOnline}
          onClick={() => setDialogOpen(true)}
        />
        <ConferencingButton />
      </div>
      <EvidenceCreatorsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hubService={hubService}
        wsConnected={wsConnected}
        hasOpenStudy={hasOpenStudy}
      />
    </>
  );
}

export default HubHeaderStatus;
