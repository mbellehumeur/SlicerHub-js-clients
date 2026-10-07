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

type LungScreeningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubService: HubService;
  wsConnected: boolean;
};

function LungScreeningDialog({
  open,
  onOpenChange,
  hubService,
  wsConnected,
}: LungScreeningDialogProps) {
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
    void hubService.requestLungScreeningStatus().finally(() => {
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
  }, [headerStatus.lungScreeningJobStatus, open, sending]);

  const lungScreeningAvailable = headerStatus.lungScreeningAvailable;

  const canSend =
    wsConnected &&
    lungScreeningAvailable &&
    !availabilityChecking &&
    !sending;

  const availabilityMessage = (() => {
    if (!wsConnected) {
      return 'Connect to the Slicer Hub';
    }
    if (availabilityChecking) {
      return 'Checking lung screening availability…';
    }
    if (!lungScreeningAvailable) {
      return 'Lung screening is not available right now.';
    }
    return '';
  })();

  const sendTooltip = sending
    ? 'Sending study URLs to lung screening…'
    : availabilityChecking
      ? 'Checking lung screening availability…'
      : !wsConnected
        ? 'Connect to the Slicer Hub'
        : !lungScreeningAvailable
          ? 'Lung screening is not available right now.'
          : 'Send active series URLs to lung screening (DICOM or NIfTI)';

  const jobStatusText = useMemo(() => {
    const log = headerStatus.lungScreeningJobStatus;
    if (sending) {
      return log ? `${log}\nSending study URLs…` : 'Sending study URLs…';
    }
    return log;
  }, [headerStatus.lungScreeningJobStatus, sending]);

  async function onSend() {
    if (!canSend) {
      return;
    }
    setSending(true);
    setSendError('');
    hubService.clearLungScreeningJobStatus();

    try {
      const response = await hubService.publishLungScreeningSend();
      if (!response) {
        setSendError('Failed to send to lung screening');
        return;
      }
      if (!response.ok) {
        setSendError(`Publish failed (HTTP ${response.status})`);
        return;
      }
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'Failed to send to lung screening'
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
          if (sending || headerStatus.lungScreeningJobStatus) {
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
          <DialogTitle>Lung screening</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {availabilityMessage ? (
            <p
              className={`text-sm ${
                availabilityChecking
                  ? 'text-muted-foreground'
                  : lungScreeningAvailable
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
            {sending ? 'Sending study URLs…' : 'Send'}
          </Button>

          {sendError ? (
            <p className="text-destructive text-sm" role="alert">
              {sendError}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label htmlFor="ls-job-status">Job Status</Label>
            <textarea
              id="ls-job-status"
              ref={jobStatusRef}
              readOnly
              rows={8}
              value={jobStatusText}
              className="border-input bg-muted text-foreground min-h-[10rem] w-full resize-y rounded-md border px-3 py-2 font-mono text-xs leading-relaxed"
            />
          </div>

          <p className="text-muted-foreground text-xs leading-snug">
            McConnell, N., Vasudev, P., Yamada, D. et al. A computationally frugal,
            open-source chest CT foundation model for thoracic disease detection in lung
            cancer screening programmes. Commun Med 6, 83 (2026).{' '}
            <a
              href="https://doi.org/10.1038/s43856-025-01328-1"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              https://doi.org/10.1038/s43856-025-01328-1
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LungScreeningDialog;
