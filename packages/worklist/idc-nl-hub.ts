/**
 * Slicer hub Anthropic NL → SearchQuery API (status + query generation).
 * Client executes the returned query against IDC REST.
 */
import type { AppState } from './hub';
import { hubEndpoint } from './hub';
import { hubOriginFromEndpoint } from './config';
import type { NlSearchQuery } from './idc-nl-execute';

export type IdcNlHubStatus = {
  anthropic: boolean;
};

export type IdcNlSearchResult = {
  text: string;
  query: NlSearchQuery;
  toolName: string;
};

function hubAuthHeaders(state: AppState): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = state.client?.getConnectionState?.()?.token?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function resolveHubIdcNlApiBase(state: AppState): string | null {
  const origin = hubOriginFromEndpoint(hubEndpoint(state));
  if (!origin) return null;
  return `${origin}/api/hub/idc-nl`;
}

export async function fetchIdcNlHubStatus(
  state: AppState
): Promise<IdcNlHubStatus> {
  const base = resolveHubIdcNlApiBase(state);
  if (!base) return { anthropic: false };
  try {
    const res = await fetch(`${base}/status`, {
      headers: hubAuthHeaders(state),
    });
    if (!res.ok) return { anthropic: false };
    const body = (await res.json()) as IdcNlHubStatus;
    return {
      anthropic: Boolean(body?.anthropic),
    };
  } catch {
    return { anthropic: false };
  }
}

export async function searchIdcViaAnthropic(
  state: AppState,
  prompt: string,
  options: { maxRows?: number } = {}
): Promise<IdcNlSearchResult> {
  const base = resolveHubIdcNlApiBase(state);
  if (!base) {
    throw new Error('Slicer hub endpoint is not configured');
  }
  const maxRows = options.maxRows || 20;
  const res = await fetch(`${base}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...hubAuthHeaders(state),
    },
    body: JSON.stringify({ prompt, max_rows: maxRows }),
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  if (!res.ok) {
    const detail = body.detail || body.message || res.statusText;
    throw new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    );
  }
  const queryRaw =
    body.query && typeof body.query === 'object'
      ? (body.query as NlSearchQuery)
      : (body as unknown as NlSearchQuery);
  if (!queryRaw || typeof queryRaw !== 'object') {
    throw new Error('Hub response missing SearchQuery');
  }
  return {
    text: String(body.text || ''),
    query: queryRaw,
    toolName: String(body.toolName || 'anthropic'),
  };
}
