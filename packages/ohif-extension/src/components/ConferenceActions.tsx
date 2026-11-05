import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ohif/ui-next';
import { resolveHubConferenceHeaderActions } from '@slicer-hub/conference-ui';
import type { CastConferenceView } from '@slicer-hub/client';
import HubService from '../services/HubService';

type ConferenceActionsProps = {
  hubService: HubService;
  view: CastConferenceView | null;
  followHost: boolean;
  wsConnected: boolean;
  /** Compact header chips vs stacked dialog buttons. */
  layout?: 'header' | 'stack';
  busy?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onError?: (message: string) => void;
  onStatus?: (message: string) => void;
};

function ConferenceActions({
  hubService,
  view,
  followHost,
  wsConnected,
  layout = 'header',
  busy = false,
  onBusyChange,
  onError,
  onStatus,
}: ConferenceActionsProps) {
  const [takeOverOpen, setTakeOverOpen] = useState(false);
  const [localBusy, setLocalBusy] = useState(false);
  const isBusy = busy || localBusy;

  const actions = resolveHubConferenceHeaderActions({
    view,
    followHost,
    connected: wsConnected,
  });

  const setBusy = (next: boolean) => {
    setLocalBusy(next);
    onBusyChange?.(next);
  };

  const run = async (
    work: () => Promise<void>,
    successMessage?: string
  ) => {
    setBusy(true);
    try {
      await work();
      if (successMessage) {
        onStatus?.(successMessage);
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Conference action failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const buttonClass =
    layout === 'stack' ? 'mb-1 w-full' : 'h-7 px-2 text-xs whitespace-nowrap';

  return (
    <>
      <div
        className={
          layout === 'stack'
            ? 'flex flex-col gap-1'
            : 'inline-flex flex-wrap items-center gap-1'
        }
      >
        {!actions.leave.hidden ? (
          <Button
            type="button"
            variant={layout === 'stack' ? 'default' : 'ghost'}
            className={buttonClass}
            disabled={Boolean(actions.leave.disabled) || isBusy || !wsConnected}
            title={actions.leave.title}
            aria-label={actions.leave.ariaLabel}
            onClick={() =>
              void run(async () => {
                const result = await hubService.endOrLeaveConference();
                onStatus?.(
                  result === 'ended' ? 'Conference ended.' : 'Left conference.'
                );
              })
            }
          >
            {actions.leave.label}
          </Button>
        ) : null}
        {!actions.stopFollowing.hidden ? (
          <Button
            type="button"
            variant="ghost"
            className={buttonClass}
            disabled={isBusy}
            title={actions.stopFollowing.title}
            aria-label={actions.stopFollowing.ariaLabel}
            onClick={() => hubService.setConferenceFollowHost(false)}
          >
            {actions.stopFollowing.label}
          </Button>
        ) : null}
        {!actions.resumeFollowing.hidden ? (
          <Button
            type="button"
            variant="ghost"
            className={buttonClass}
            disabled={isBusy}
            title={actions.resumeFollowing.title}
            aria-label={actions.resumeFollowing.ariaLabel}
            onClick={() => hubService.setConferenceFollowHost(true)}
          >
            {actions.resumeFollowing.label}
          </Button>
        ) : null}
        {!actions.takeOver.hidden ? (
          <Button
            type="button"
            variant={layout === 'stack' ? 'default' : 'ghost'}
            className={buttonClass}
            disabled={Boolean(actions.takeOver.disabled) || isBusy || !wsConnected}
            title={actions.takeOver.title}
            aria-label={actions.takeOver.ariaLabel}
            onClick={() => setTakeOverOpen(true)}
          >
            {actions.takeOver.label}
          </Button>
        ) : null}
      </div>

      <Dialog open={takeOverOpen} onOpenChange={setTakeOverOpen}>
        <DialogContent className="hub-conference-takeover-dialog max-w-sm">
          <style>{`
.hub-conference-takeover-dialog {
  width: min(360px, calc(100vw - 24px)) !important;
  max-width: min(360px, calc(100vw - 24px)) !important;
}
`}</style>
          <DialogHeader>
            <DialogTitle>Take over conference lead?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            You will become the scene leader. Other participants will follow your
            display updates.
          </p>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() => setTakeOverOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isBusy || !wsConnected}
              onClick={() => {
                setTakeOverOpen(false);
                void run(
                  () => hubService.takeOverConferenceLead(),
                  'Took over conference lead.'
                );
              }}
            >
              Take over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConferenceActions;
