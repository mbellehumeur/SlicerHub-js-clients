export interface HubHeaderStatusState {
  topic: string;
  hubLabel: string;
  subscriberName: string;
  statusText: string;
  wsState: string;
  totalSegmentatorAvailable: boolean;
  totalSegmentatorJobStatus: string;
  lungScreeningAvailable: boolean;
  lungScreeningJobStatus: string;
  neuroSegAvailable: boolean;
  neuroSegJobStatus: string;
  conferenceActive: boolean;
  conferenceTitle: string;
  conferenceParticipants: string[];
}

export function hubStatusTextForWsState(wsState?: string): string {
  return wsState === 'connected'
    ? 'connected'
    : wsState === 'connecting'
      ? 'Websocket connecting'
      : wsState === 'error'
        ? 'Websocket error'
        : wsState === 'disconnected'
          ? 'Websocket disconnected'
          : 'Ready';
}

export function buildHubHeaderStatus(
  topic: string,
  hubLabel: string,
  subscriberName: string,
  wsState: string,
  totalSegmentatorAvailable = false,
  totalSegmentatorJobStatus = '',
  lungScreeningAvailable = false,
  lungScreeningJobStatus = '',
  neuroSegAvailable = false,
  neuroSegJobStatus = '',
  conferenceActive = false,
  conferenceTitle = '',
  conferenceParticipants: string[] = []
): HubHeaderStatusState {
  const trimmedTopic = topic.trim();
  const label = hubLabel.trim() || 'Hub';
  const subscriber = subscriberName.trim();
  const statusText =
    wsState === 'connected' ? subscriber : hubStatusTextForWsState(wsState);

  return {
    topic: trimmedTopic,
    hubLabel: label,
    subscriberName: subscriber,
    statusText,
    wsState,
    totalSegmentatorAvailable,
    totalSegmentatorJobStatus,
    lungScreeningAvailable,
    lungScreeningJobStatus,
    neuroSegAvailable,
    neuroSegJobStatus,
    conferenceActive,
    conferenceTitle: conferenceActive ? conferenceTitle.trim() : '',
    conferenceParticipants: conferenceActive
      ? conferenceParticipants.map((name) => String(name).trim()).filter(Boolean)
      : [],
  };
}

export function hubSessionInfoLines(status: HubHeaderStatusState): string[] {
  const lines: string[] = [];
  if (status.topic.trim()) {
    lines.push(`Topic: ${status.topic.trim()}`);
  }
  lines.push(status.hubLabel.trim() || 'Hub');
  if (status.statusText.trim()) {
    lines.push(status.statusText.trim());
  }
  if (status.conferenceActive) {
    lines.push(
      status.conferenceTitle.trim()
        ? `Conference: ${status.conferenceTitle.trim()}`
        : 'Conference active'
    );
    if (status.conferenceParticipants.length) {
      lines.push(`Participants: ${status.conferenceParticipants.join(', ')}`);
    }
  }
  return lines;
}

export function hubHeaderStatusEqual(
  a: HubHeaderStatusState,
  b: HubHeaderStatusState
): boolean {
  return (
    a.topic === b.topic &&
    a.hubLabel === b.hubLabel &&
    a.subscriberName === b.subscriberName &&
    a.statusText === b.statusText &&
    a.wsState === b.wsState &&
    a.totalSegmentatorAvailable === b.totalSegmentatorAvailable &&
    a.totalSegmentatorJobStatus === b.totalSegmentatorJobStatus &&
    a.lungScreeningAvailable === b.lungScreeningAvailable &&
    a.lungScreeningJobStatus === b.lungScreeningJobStatus &&
    a.neuroSegAvailable === b.neuroSegAvailable &&
    a.neuroSegJobStatus === b.neuroSegJobStatus &&
    a.conferenceActive === b.conferenceActive &&
    a.conferenceTitle === b.conferenceTitle &&
    a.conferenceParticipants.join('\0') === b.conferenceParticipants.join('\0')
  );
}
