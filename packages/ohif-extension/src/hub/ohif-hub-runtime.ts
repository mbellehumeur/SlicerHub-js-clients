/** Runtime hooks registered by HubService (e.g. dynamic DICOMweb root). */
export type OhifHubExtensionManagerLike = {
  updateDataSourceConfiguration?: (name: string, config: unknown) => void;
  getDataSources?: (name: string) => unknown[] | undefined;
  setActiveDataSource?: (name: string) => void;
};

type OhifHubRuntime = {
  extensionManager?: OhifHubExtensionManagerLike;
};

let runtime: OhifHubRuntime = {};

export function setOhifHubRuntime(partial: OhifHubRuntime): void {
  runtime = { ...runtime, ...partial };
}

export function getOhifHubRuntime(): OhifHubRuntime {
  return runtime;
}
