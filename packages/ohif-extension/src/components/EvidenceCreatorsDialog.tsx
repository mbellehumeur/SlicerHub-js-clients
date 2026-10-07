import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from '@ohif/ui-next';
import {
  HUB_INFERENCE_SERVERS,
  inferenceProbeAvailabilityLabel,
  isLocalCapableInferenceServer,
  orderInferenceServerProbeRows,
  renderInferenceServerInfoCardHtml,
  type CastProductStatusProbe,
  type HubInferenceServerDef,
} from '@slicer-hub/client';
import { useSystem } from '@ohif/core';
import HubService from '../services/HubService';
import {
  fetchFlexrayManifest,
  formatFlexrayDownloadSize,
  listFlexrayQualityChoices,
  type FlexrayQualityChoice,
} from '@slicer-hub/flexray-web';
import {
  resolveOhifOrtBaseUrl,
  runFlexrayLocalOnActiveViewport,
} from '../hub/run-flexray-local';
import {
  DEFAULT_TOTAL_SEGMENTATOR_OPTIONS,
  normalizeTotalSegmentatorOptions,
  type TotalSegmentatorOptions,
} from '../hub/total-segmentator-options';
import {
  getSupportedQualityModesForTask,
  taskSelectItems,
  type TotalSegmentatorQuality,
} from '../hub/total-segmentator-tasks';

type ProbeRow = {
  server: HubInferenceServerDef;
  probe: CastProductStatusProbe | null;
  probing: boolean;
};

type EvidenceCreatorsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubService: HubService;
  wsConnected: boolean;
  hasOpenStudy: boolean;
};

/** Scoped styles mirroring IRA Evidence Creators layout. */
const EC_STYLES = `
.hub-ec-layout {
  display: grid;
  grid-template-columns: minmax(10rem, 0.85fr) minmax(14rem, 1.2fr);
  gap: 10px;
  min-height: 20rem;
}
.hub-ec-toolbar { margin-bottom: 8px; }
.hub-ec-refresh {
  border: 1px solid hsl(var(--input));
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.hub-ec-refresh:hover:not(:disabled) { filter: brightness(1.1); }
.hub-ec-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
.hub-ec-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: min(65vh, 28rem);
  overflow: auto;
}
.hub-ec-row {
  display: block;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border: 1px solid hsl(var(--input));
  border-radius: 6px;
  background: hsl(var(--muted) / 0.35);
  color: hsl(var(--foreground));
  padding: 8px 10px;
}
.hub-ec-row:hover { background: hsl(var(--muted) / 0.65); }
.hub-ec-row.is-selected {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.14);
}
.hub-ec-row-title { font-weight: 700; font-size: 13px; }
.hub-ec-desc {
  margin-top: 2px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  line-height: 1.35;
}
.hub-ec-row-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
}
.hub-ec-avail { color: hsl(var(--muted-foreground)); }
.hub-ec-avail.is-online { color: #4ade80; }
.hub-ec-avail.is-offline { color: #f87171; }
.hub-ec-location { color: hsl(var(--muted-foreground)); }
.hub-ec-detail, .hub-ec-log {
  margin: 0;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--muted) / 0.35);
  color: hsl(var(--foreground));
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.hub-ec-detail {
  min-height: 6rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.hub-ec-detail.has-card {
  font: 13px/1.45 -apple-system, system-ui, sans-serif;
  white-space: normal;
}
.hub-ec-log {
  margin-top: 10px;
  max-height: 16rem;
  min-height: 7rem;
  overflow: auto;
  color: hsl(var(--muted-foreground));
  white-space: pre;
  word-break: normal;
}
.hub-ec-run-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}
.hub-ec-run-row .hub-ec-model-select {
  flex: 1 1 auto;
  min-width: 0;
}
.hub-ec-run-row .hub-ec-model-select [data-slot='select-trigger'],
.hub-ec-run-row button.hub-ec-model-select {
  width: 100%;
  min-height: 36px;
  height: 36px;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--input));
}
.hub-ec-run-row .hub-ec-model-select span {
  color: hsl(var(--foreground));
  opacity: 1;
}
.hub-ec-run {
  margin-top: 0;
  min-height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid hsl(var(--primary));
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  flex: 0 0 auto;
}
.hub-ec-run:hover:not(:disabled) { filter: brightness(1.08); }
.hub-ec-run:disabled { opacity: 0.45; cursor: not-allowed; }
.hub-ec-note {
  margin: 8px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
.hub-ec-note:empty { display: none; }
.hub-ec-error { margin: 6px 0 0; font-size: 12px; color: #f87171; }
.hub-ec-totalseg {
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hub-inference-info-card { display: flex; flex-direction: column; gap: 8px; }
.hub-inference-info-heading { display: flex; align-items: center; gap: 10px; }
.hub-inference-info-icon {
  width: 28px; height: 28px; border-radius: 6px; object-fit: cover; flex-shrink: 0;
}
.hub-inference-info-title { font-weight: 700; font-size: 14px; }
.hub-inference-info-summary { margin: 0; color: hsl(var(--muted-foreground)); }
.hub-inference-info-citation { margin: 0; font-size: 12px; color: hsl(var(--muted-foreground)); }
.hub-inference-info-license { margin: 0; font-size: 12px; color: hsl(var(--muted-foreground)); }
.hub-inference-info-restriction { font-weight: 700; color: hsl(var(--foreground)); }
.hub-inference-info-license-link { color: hsl(var(--primary)); }
.hub-inference-info-links {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
}
.hub-inference-info-link, .hub-inference-info-coffee {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 8px; border-radius: 5px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--muted));
  color: hsl(var(--primary));
  text-decoration: none; font-size: 12px; font-weight: 600;
}
@media (max-width: 640px) {
  .hub-ec-layout { grid-template-columns: 1fr; }
}
.hub-ec-dialog {
  width: min(760px, calc(100vw - 24px)) !important;
  max-width: min(760px, calc(100vw - 24px)) !important;
}
.hub-ec-dialog .drag-handle {
  cursor: grab;
  user-select: none;
}
`;

function stampLogLine(line: string): string {
  const text = String(line || '').replace(/\s+$/, '');
  if (!text) return '';
  if (/^\[[^\]]+\]\s/.test(text)) return text;
  return `[${new Date().toLocaleTimeString()}] ${text}`;
}

function EvidenceCreatorsDialog({
  open,
  onOpenChange,
  hubService,
  wsConnected,
  hasOpenStudy,
}: EvidenceCreatorsDialogProps) {
  const { servicesManager } = useSystem();
  const taskItems = useMemo(() => taskSelectItems(), []);
  const logRef = useRef<HTMLPreElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rows, setRows] = useState<ProbeRow[]>(() =>
    HUB_INFERENCE_SERVERS.map(server => ({
      server,
      probe: null,
      probing: false,
    }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [log, setLog] = useState('');
  const [totalSegForm, setTotalSegForm] = useState<TotalSegmentatorOptions>({
    ...DEFAULT_TOTAL_SEGMENTATOR_OPTIONS,
  });
  const [flexrayChoices, setFlexrayChoices] = useState<FlexrayQualityChoice[]>(
    []
  );
  const [flexrayModelId, setFlexrayModelId] = useState('low');
  const [flexrayManifestError, setFlexrayManifestError] = useState('');

  const orderedRows = useMemo(
    () => orderInferenceServerProbeRows(rows),
    [rows]
  );
  const selectedRow =
    orderedRows.find(row => row.server.id === selectedId) ?? null;
  const selectedServer = selectedRow?.server ?? null;
  const isTotalSeg = selectedServer?.id === 'totalseg';
  const selectedLocalCapable = isLocalCapableInferenceServer(selectedServer);

  const rowAvailability = (row: ProbeRow) => {
    if (isLocalCapableInferenceServer(row.server)) {
      return { label: 'Available', online: true, offlineKnown: false };
    }
    const label = inferenceProbeAvailabilityLabel(
      row.probe,
      row.probing || probing
    );
    const online = Boolean(row.probe?.online);
    const offlineKnown = Boolean(row.probe) && !row.probing && !probing;
    return { label, online, offlineKnown };
  };

  const supportedQualityModes = useMemo(
    () => getSupportedQualityModesForTask(totalSegForm.task),
    [totalSegForm.task]
  );

  const appendLog = (line: string) => {
    const stamped = stampLogLine(line);
    if (!stamped) return;
    setLog(prev => (prev ? `${prev}\n${stamped}` : stamped));
  };

  const scheduleCloseAfterSegmentation = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onOpenChange(false);
    }, 700);
  };

  useEffect(() => {
    if (supportedQualityModes.includes(totalSegForm.quality)) {
      return;
    }
    setTotalSegForm(prev => ({ ...prev, quality: supportedQualityModes[0] }));
  }, [totalSegForm.quality, supportedQualityModes]);

  useEffect(() => {
    const el = logRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [log]);

  const refreshStatus = async () => {
    if (!wsConnected) {
      setRows(
        HUB_INFERENCE_SERVERS.map(server => ({
          server,
          probe: isLocalCapableInferenceServer(server)
            ? { online: true, items: [] }
            : { online: false, items: [], error: 'Not connected' },
          probing: false,
        }))
      );
      appendLog('Not connected — cannot probe remote inference servers.');
      return;
    }
    setProbing(true);
    setRows(prev =>
      prev.map(row =>
        isLocalCapableInferenceServer(row.server)
          ? { ...row, probe: { online: true, items: [] }, probing: false }
          : { ...row, probing: true }
      )
    );
    appendLog('Probing inference servers…');
    try {
      const probed = await hubService.probeInferenceServers();
      setRows(
        probed.map(({ server, probe }) => ({
          server,
          probe: isLocalCapableInferenceServer(server)
            ? { online: true, items: probe?.items || [] }
            : probe,
          probing: false,
        }))
      );
      const online = probed.filter(
        p =>
          isLocalCapableInferenceServer(p.server) || p.probe.online
      ).length;
      appendLog(
        online
          ? `${online}/${probed.length} Evidence Creator(s) available.`
          : 'No inference servers responded online.'
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setRows(
        HUB_INFERENCE_SERVERS.map(server => ({
          server,
          probe: isLocalCapableInferenceServer(server)
            ? { online: true, items: [] }
            : { online: false, items: [], error: detail },
          probing: false,
        }))
      );
      setSendError(detail);
      appendLog(`Probe error: ${detail}`);
    } finally {
      setProbing(false);
    }
  };

  const selectedOnline =
    selectedLocalCapable || Boolean(selectedRow?.probe?.online);
  const isFlexray = selectedServer?.id === 'flexray';
  const selectedFlexrayChoice =
    flexrayChoices.find(c => c.id === flexrayModelId) ??
    flexrayChoices[0] ??
    null;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSending(false);
    setSendError('');
    setLog('');
    setTotalSegForm({ ...DEFAULT_TOTAL_SEGMENTATOR_OPTIONS });
    void refreshStatus();
    // Refresh only when the dialog opens / connection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional open/ws gate
  }, [open, wsConnected, hubService]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const available = orderedRows.filter(
      row =>
        isLocalCapableInferenceServer(row.server) || Boolean(row.probe?.online)
    );
    if (!available.length) {
      return;
    }
    if (selectedId && available.some(row => row.server.id === selectedId)) {
      return;
    }
    setSelectedId(available[0].server.id);
  }, [open, orderedRows, selectedId]);

  useEffect(() => {
    if (!open || !isFlexray) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await fetchFlexrayManifest();
        if (cancelled) return;
        const choices = listFlexrayQualityChoices(loaded);
        setFlexrayChoices(choices);
        setFlexrayManifestError('');
        setFlexrayModelId(prev =>
          prev === 'high' || prev === 'low' ? prev : 'low'
        );
      } catch (err) {
        if (cancelled) return;
        setFlexrayManifestError(
          err instanceof Error ? err.message : String(err)
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isFlexray]);

  const canRun =
    hasOpenStudy &&
    !sending &&
    Boolean(selectedServer) &&
    (isFlexray
      ? true
      : wsConnected && selectedOnline && !probing);

  const noteText = (() => {
    if (!selectedServer) return '';
    if (!hasOpenStudy) return 'Open a study to run inference.';
    if (isFlexray) {
      const size = selectedFlexrayChoice
        ? ` First run downloads ${formatFlexrayDownloadSize(selectedFlexrayChoice.size_bytes || 0)}.`
        : '';
      return `FleXray runs locally in the browser (WebGPU / WASM).${size}`;
    }
    if (!wsConnected) return 'Connect to the Slicer Hub to run inference.';
    if (probing) return 'Checking server status…';
    if (!selectedOnline) return 'Selected server is offline.';
    if (selectedLocalCapable) {
      return 'Local-capable Evidence Creator — Available (local or remote).';
    }
    return 'Ready to run on the open study.';
  })();

  const runTooltip = (() => {
    if (sending) return isFlexray ? 'Running FleXray locally…' : 'Sending study URLs…';
    if (!hasOpenStudy) return 'Open a study first';
    if (isFlexray) return 'Run FleXray locally on the active image';
    if (!wsConnected) return 'Connect to the Slicer Hub';
    if (probing) return 'Checking server status…';
    if (!selectedServer) return 'Select an Evidence Creator';
    if (!selectedOnline) return 'Selected server is offline';
    return `Run ${selectedServer.title}`;
  })();

  async function onRun() {
    if (!canRun || !selectedServer) {
      return;
    }
    setSending(true);
    setSendError('');
    try {
      if (selectedServer.id === 'flexray') {
        appendLog('FleXray local run…');
        let downloadTicks = 0;
        let lastDownloadPct = -1;
        const outcome = await runFlexrayLocalOnActiveViewport(
          servicesManager as never,
          {
            ortWasmPaths: resolveOhifOrtBaseUrl(),
            quality: flexrayModelId === 'high' ? 'high' : 'low',
            onProgress: p => {
              if (p.phase === 'download' && p.total) {
                downloadTicks += 1;
                const loaded = p.loaded || 0;
                const pct = Math.min(100, Math.round((loaded / p.total) * 100));
                const done = pct >= 100 || loaded >= p.total;
                if (!done && downloadTicks % 300 !== 1) {
                  return;
                }
                if (pct === lastDownloadPct) {
                  return;
                }
                lastDownloadPct = pct;
                appendLog(`Downloading model… ${pct}%`);
                return;
              }
              if (p.detail) {
                appendLog(p.detail);
              } else if (p.phase !== 'download') {
                appendLog(p.phase);
              }
            },
          }
        );
        appendLog(
          `Done via ${outcome.executionProvider}: ${outcome.usedLabels.length} structure(s) → segmentation ${outcome.segmentationId.slice(0, 8)}…`
        );
        for (const u of outcome.usedLabels.slice(0, 12)) {
          appendLog(`  ${u.name}: ${u.voxelCount} px`);
        }
        if (outcome.usedLabels.length > 12) {
          appendLog(`  …and ${outcome.usedLabels.length - 12} more`);
        }
        scheduleCloseAfterSegmentation();
        return;
      }

      appendLog(`Running ${selectedServer.title} (${selectedServer.product})…`);
      const response = await hubService.publishInferenceServerSend(
        selectedServer,
        isTotalSeg ? { totalSegmentator: totalSegForm } : {}
      );
      if (!response) {
        setSendError('Failed to publish job');
        appendLog('Publish failed: no response');
        return;
      }
      if (!response.ok) {
        const detail = `Publish failed (HTTP ${response.status})`;
        setSendError(detail);
        appendLog(detail);
        return;
      }
      appendLog(`Published → ${selectedServer.product}`);
      appendLog('Watch this log for status-update lines from the server.');
    } catch (err) {
      const detail =
        err instanceof Error
          ? err.message
          : err != null
            ? String(err)
            : selectedServer.id === 'flexray'
              ? 'FleXray local run failed'
              : 'Failed to publish job';
      setSendError(detail);
      appendLog(`Run error: ${detail}`);
    } finally {
      setSending(false);
    }
  }

  const updateTotalSeg = <K extends keyof TotalSegmentatorOptions>(
    key: K,
    value: TotalSegmentatorOptions[K]
  ) => {
    setTotalSegForm(prev =>
      normalizeTotalSegmentatorOptions({ ...prev, [key]: value })
    );
  };

  const detailHtml = selectedServer
    ? renderInferenceServerInfoCardHtml(selectedServer)
    : '';

  return (
    <Dialog isDraggable open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="hub-ec-dialog"
        onPointerDownOutside={event => {
          if (sending) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={event => {
          if (sending) {
            event.preventDefault();
          }
        }}
      >
        <style>{EC_STYLES}</style>
        <DialogHeader>
          <DialogTitle>Evidence Creators</DialogTitle>
        </DialogHeader>

        <div className="hub-ec-layout">
          <div className="hub-ec-left">
            <div className="hub-ec-toolbar">
              <button
                type="button"
                className="hub-ec-refresh"
                disabled={!wsConnected || probing}
                onClick={() => void refreshStatus()}
              >
                {probing ? 'Checking…' : 'Refresh status'}
              </button>
            </div>
            <div
              className="hub-ec-list"
              role="listbox"
              aria-label="Inference servers"
            >
              {orderedRows.map(row => {
                const selected = row.server.id === selectedId;
                const { label, online, offlineKnown } = rowAvailability(row);
                return (
                  <button
                    key={row.server.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`hub-ec-row${selected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedId(row.server.id)}
                  >
                    <div className="hub-ec-row-title">{row.server.title}</div>
                    {row.server.summary || row.server.capabilities ? (
                      <div className="hub-ec-desc">
                        {row.server.summary || row.server.capabilities}
                      </div>
                    ) : null}
                    <div className="hub-ec-row-meta">
                      <span
                        className={`hub-ec-avail${
                          online
                            ? ' is-online'
                            : offlineKnown
                              ? ' is-offline'
                              : ''
                        }`}
                      >
                        {label}
                      </span>
                      {row.server.location ? (
                        <span className="hub-ec-location">
                          {row.server.location}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
              {!orderedRows.length ? (
                <p className="hub-ec-note">No Evidence Creators enabled.</p>
              ) : null}
            </div>
          </div>

          <div className="hub-ec-right">
            {selectedServer ? (
              <div
                className="hub-ec-detail has-card"
                dangerouslySetInnerHTML={{ __html: detailHtml }}
              />
            ) : (
              <pre className="hub-ec-detail">Select an inference server.</pre>
            )}

            <p className="hub-ec-note">{noteText}</p>

            {isTotalSeg ? (
              <div className="hub-ec-totalseg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="ec-ts-task">Segmentation task</Label>
                  <Select
                    value={totalSegForm.task}
                    onValueChange={value => updateTotalSeg('task', value)}
                  >
                    <SelectTrigger id="ec-ts-task">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {taskItems.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          <span>{item.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Speed</Label>
                  <ToggleGroup
                    type="single"
                    value={totalSegForm.quality}
                    onValueChange={value => {
                      if (value) {
                        updateTotalSeg(
                          'quality',
                          value as TotalSegmentatorQuality
                        );
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="normal" aria-label="Normal quality">
                      Normal
                    </ToggleGroupItem>
                    {supportedQualityModes.includes('fast') ? (
                      <ToggleGroupItem value="fast" aria-label="Fast quality">
                        Fast
                      </ToggleGroupItem>
                    ) : null}
                    {supportedQualityModes.includes('faster') ? (
                      <ToggleGroupItem
                        value="faster"
                        aria-label="Faster quality"
                      >
                        Faster
                      </ToggleGroupItem>
                    ) : null}
                  </ToggleGroup>
                </div>
              </div>
            ) : null}

            <div className="hub-ec-run-row">
              {isFlexray ? (
                flexrayChoices.length ? (
                  <div className="hub-ec-model-select">
                    <Select
                      value={flexrayModelId === 'high' ? 'high' : 'low'}
                      onValueChange={value => setFlexrayModelId(value)}
                    >
                      <SelectTrigger aria-label="FleXray quality">
                        <SelectValue
                          placeholder={
                            selectedFlexrayChoice?.optionLabel || 'Low'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {flexrayChoices.map(choice => (
                          <SelectItem key={choice.id} value={choice.id}>
                            {choice.optionLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="hub-ec-model-select hub-ec-note">
                    {flexrayManifestError || 'Loading models…'}
                  </div>
                )
              ) : null}
              <button
                type="button"
                className="hub-ec-run"
                disabled={!canRun}
                onClick={() => void onRun()}
                title={runTooltip}
              >
                {sending ? 'Running…' : 'Run'}
              </button>
            </div>
            {flexrayManifestError && isFlexray ? (
              <p className="hub-ec-error" role="alert">
                {flexrayManifestError}
              </p>
            ) : null}
            {sendError ? (
              <p className="hub-ec-error" role="alert">
                {sendError}
              </p>
            ) : null}
            <pre
              ref={logRef}
              className="hub-ec-log"
              aria-live="polite"
            >
              {log}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EvidenceCreatorsDialog;
