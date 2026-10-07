import { HUB_DICOMWEB_DATA_SOURCE, LOG_PREFIX } from './constants';
import { getOhifHubRuntime } from './ohif-hub-runtime';

function buildHubDicomwebConfiguration(root: string) {
  const normalized = root.trim().replace(/\/$/, '');
  return {
    friendlyName: 'Hub DICOMweb',
    name: HUB_DICOMWEB_DATA_SOURCE,
    wadoUriRoot: normalized,
    qidoRoot: normalized,
    wadoRoot: normalized,
    qidoSupportsIncludeField: false,
    imageRendering: 'wadors',
    thumbnailRendering: 'wadors',
    enableStudyLazyLoad: true,
    supportsFuzzyMatching: true,
    supportsWildcard: false,
    staticWado: false,
    singlepart: 'bulkdata,video',
    bulkDataURI: {
      enabled: true,
      relativeResolution: 'studies',
    },
    omitQuotationForMultipartRequest: true,
  };
}

function syncHubDicomwebAppConfig(
  configuration: ReturnType<typeof buildHubDicomwebConfiguration>
): void {
  const win = window as {
    config?: {
      dataSources?: Array<{
        sourceName?: string;
        configuration?: Record<string, unknown>;
      }>;
    };
  };
  const entry = win.config?.dataSources?.find(
    ds => ds.sourceName === HUB_DICOMWEB_DATA_SOURCE
  );
  if (entry) {
    entry.configuration = { ...entry.configuration, ...configuration };
  }
}

/**
 * Point OHIF's cast-dicomweb data source at the root from imagingstudy-open
 * (urn:cast:dicomweb-root). Registered by HubService via ohif-hub-runtime.
 */
export async function applyHubDicomwebRoot(root: string): Promise<void> {
  const trimmed = root.trim();
  if (!trimmed) {
    return;
  }

  const extensionManager = getOhifHubRuntime().extensionManager;
  if (!extensionManager?.updateDataSourceConfiguration) {
    console.warn(
      `${LOG_PREFIX} imagingstudy-open: dicomweb root provided but extensionManager is not registered`,
      trimmed
    );
    return;
  }

  const existing = extensionManager.getDataSources?.(HUB_DICOMWEB_DATA_SOURCE);
  if (!existing?.[0]) {
    console.warn(
      `${LOG_PREFIX} imagingstudy-open: ${HUB_DICOMWEB_DATA_SOURCE} data source is not configured`
    );
    return;
  }

  console.info(`${LOG_PREFIX} imagingstudy-open applying dicomweb root`, trimmed);
  const configuration = buildHubDicomwebConfiguration(trimmed);
  extensionManager.updateDataSourceConfiguration(
    HUB_DICOMWEB_DATA_SOURCE,
    configuration
  );
  syncHubDicomwebAppConfig(configuration);
  extensionManager.setActiveDataSource?.(HUB_DICOMWEB_DATA_SOURCE);
}
