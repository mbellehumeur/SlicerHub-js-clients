import {
  ensureCastSubscribeEvents,
  isHubEndpointInCloud,
  isRunningInCloud,
} from '@slicer-hub/client';
import type { HubConfig } from '@slicer-hub/client';

export { ensureCastSubscribeEvents };

export type ConfigHubEntry = HubConfig & {
  events?: string[];
  lease?: number;
  productName?: string;
};

export type HubExtensionConfig = {
  defaultHubName?: string;
  hubs?: ConfigHubEntry[];
  productName?: string;
  productVersion?: string;
  autoReconnect?: boolean;
  autoSelectHub?: boolean;
  subscriberName?: string;
  topic?: string;
  actors?: string[];
};

function hubNameFromConfig(hub: ConfigHubEntry): string {
  return typeof hub?.name === 'string' ? hub.name.trim() : '';
}

function hubEndpointFromConfig(hub: ConfigHubEntry): string {
  return typeof hub?.hub_endpoint === 'string' ? hub.hub_endpoint.trim() : '';
}

export function selectHubFromHubExtensionConfig(
  hubs: ConfigHubEntry[],
  defaultHubName: string,
  autoSelectHub: boolean
): ConfigHubEntry | undefined {
  if (!hubs.length) {
    return undefined;
  }

  const defaultHub = hubs.find(hub => hubNameFromConfig(hub) === defaultHubName);

  if (!autoSelectHub) {
    return defaultHub;
  }

  const pageInCloud = isRunningInCloud();
  const deploymentMatched = hubs.find(hub => {
    const endpoint = hubEndpointFromConfig(hub);
    return endpoint && isHubEndpointInCloud(endpoint) === pageInCloud;
  });

  return deploymentMatched ?? defaultHub;
}

export function resolveHubFromConfig(hubExtensionConfig: HubExtensionConfig): ConfigHubEntry {
  const defaultHubName = hubExtensionConfig.defaultHubName?.trim();
  if (!defaultHubName) {
    throw new Error('HubService: cast.defaultHubName is required');
  }

  const hubs = hubExtensionConfig.hubs ?? [];
  const selectedHub = selectHubFromHubExtensionConfig(
    hubs,
    defaultHubName,
    hubExtensionConfig.autoSelectHub ?? false
  );

  if (!selectedHub) {
    throw new Error(`HubService: default hub "${defaultHubName}" not found in cast.hubs`);
  }

  return selectedHub;
}
