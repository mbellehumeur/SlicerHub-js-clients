import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
} from '@ohif/ui-next';
import HubService from '../services/HubService';
import {
  hubHeaderStatusEqual,
  type HubHeaderStatusState,
} from '../hub/hub-header-status';

type NeuroSegDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubService: HubService;
  wsConnected: boolean;
};

function NeuroSegDialog({
  open,
  onOpenChange,
  hubService,
  wsConnected,
}: NeuroSegDialogProps) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [headerStatus, setHeaderStatus] = useState<HubHeaderStatusState>(() =>
    hubService.getHubHeaderStatus()
  );
  const jobStatusRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSending(false);
    setSendError('');
    setHeaderStatus(hubService.getHubHeaderStatus());
    let cancelled = false;
    setAvailabilityChecking(true);
    void hubService.requestNeuroSegStatus().finally(() => {
      if (!cancelled) {
        setAvailabilityChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, hubService]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const sync = (next?: HubHeaderStatusState) => {
      const resolved = next ?? hubService.getHubHeaderStatus();
      setHeaderStatus(prev =>
        hubHeaderStatusEqual(prev, resolved) ? prev : resolved
      );
    };
    sync();
    const { unsubscribe } = hubService.subscribe(HubService.EVENTS.STATUS_CHANGED, sync);
    return unsubscribe;
  }, [open, hubService]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const textarea = jobStatusRef.current;
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [headerStatus.neuroSegJobStatus, open, sending]);

  const neuroSegAvailable = headerStatus.neuroSegAvailable;

  const canSend =
    wsConnected &&
    neuroSegAvailable &&
    !availabilityChecking &&
    !sending;

  const availabilityMessage = (() => {
    if (!wsConnected) {
      return 'Connect to the Slicer Hub';
    }
    if (availabilityChecking) {
      return 'Checking neurosegmentation availability…';
    }
    if (!neuroSegAvailable) {
      return 'Neurosegmentation is not available right now.';
    }
    return '';
  })();

  const sendTooltip = sending
    ? 'Sending volume to neurosegmentation…'
    : availabilityChecking
      ? 'Checking neurosegmentation availability…'
      : !wsConnected
        ? 'Connect to the Slicer Hub'
        : !neuroSegAvailable
          ? 'Neurosegmentation is not available right now.'
          : 'Send active series to neurosegmentation (NIfTI when available)';

  const jobStatusText = useMemo(() => {
    const log = headerStatus.neuroSegJobStatus;
    if (sending) {
      return log ? `${log}\nSending volume…` : 'Sending volume…';
    }
    return log;
  }, [headerStatus.neuroSegJobStatus, sending]);

  async function onSend() {
    if (!canSend) {
      return;
    }
    setSending(true);
    setSendError('');
    hubService.clearNeuroSegJobStatus();

    try {
      const response = await hubService.publishNeuroSegSend();
      if (!response) {
        setSendError('Failed to send to neurosegmentation');
        return;
      }
      if (!response.ok) {
        setSendError(`Publish failed (HTTP ${response.status})`);
        return;
      }
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Failed to send to neurosegmentation'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[538px]"
        onPointerDownOutside={event => {
          if (sending || headerStatus.neuroSegJobStatus) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={event => {
          if (sending) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Neuro segmentation</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {availabilityMessage ? (
            <p
              className={`text-sm ${
                availabilityChecking
                  ? 'text-muted-foreground'
                  : neuroSegAvailable
                    ? 'text-green-600'
                    : 'text-yellow-600'
              }`}
              role="status"
            >
              {availabilityMessage}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={!canSend}
            onClick={() => void onSend()}
            title={sendTooltip}
          >
            {sending ? 'Sending volume…' : 'Send'}
          </Button>

          {sendError ? (
            <p className="text-destructive text-sm" role="alert">
              {sendError}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label htmlFor="neuroseg-job-status">Job Status</Label>
            <textarea
              id="neuroseg-job-status"
              ref={jobStatusRef}
              readOnly
              rows={8}
              value={jobStatusText}
              className="border-input bg-muted text-foreground min-h-[10rem] w-full resize-y rounded-md border px-3 py-2 font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NeuroSegDialog;
