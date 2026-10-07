import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ohif/ui-next';
import { hubSessionInfoLines, type HubHeaderStatusState } from '../hub/hub-header-status';

type SessionInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: HubHeaderStatusState;
};

function SessionInfoDialog({ open, onOpenChange, status }: SessionInfoDialogProps) {
  const lines = hubSessionInfoLines(status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground max-w-[min(92vw,24rem)] gap-3 p-[18px]">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-highlight text-xl font-bold leading-tight">
            Session info
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm leading-relaxed">
          {lines.map(line => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SessionInfoDialog;
