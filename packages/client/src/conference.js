import { httpUrlFromHubEndpoint } from './hubLinks';

export const HUB_CONFERENCE_POLL_MS = 30_000;

export const HUB_CONFERENCE_EXIT_ACK_MS = 1200;

export const HUB_CONFERENCE_TITLE_PRESETS = [
  'Anatomy class',
  'Tumor Board',
  'Case discussion',
  'Pedicle screw',
];

function conferenceApiUrl(hubEndpoint, path) {
  const url = httpUrlFromHubEndpoint(hubEndpoint);
  if (!url) {
    return null;
  }
  return new URL(path, url.origin).href;
}

/**
 * @param {string} [accessToken]
 * @param {boolean} [jsonBody]
 */
export function conferenceAuthHeaders(accessToken, jsonBody = false) {
  /** @type {Record<string, string>} */
  const headers = {};
  if (jsonBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = String(accessToken ?? '').trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function normalizeConferenceParticipants(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set();
  return raw
    .map((entry) => String(entry ?? '').trim())
    .filter((name) => {
      if (!name || seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    });
}

export function conferenceHostTopic(conference) {
  return String(conference?.hostTopic ?? conference?.user ?? '').trim();
}

/** Topic that currently leads scene-updates (falls back to conference owner). */
export function conferenceSceneLeaderTopic(conference) {
  const host = conferenceHostTopic(conference);
  const lead = String(conference?.sceneLeaderTopic ?? '').trim();
  return lead || host;
}

export function isHubConferenceHost(topic, conference) {
  const host = conferenceHostTopic(conference);
  const normalizedTopic = String(topic ?? '').trim();
  if (!normalizedTopic || !host) {
    return false;
  }
  return (
    normalizedTopic === host ||
    normalizedTopic.toLowerCase() === host.toLowerCase()
  );
}

export function isHubConferenceSceneLeader(topic, conference) {
  const lead = conferenceSceneLeaderTopic(conference);
  const normalizedTopic = String(topic ?? '').trim();
  if (!normalizedTopic || !lead) {
    return false;
  }
  return (
    normalizedTopic === lead ||
    normalizedTopic.toLowerCase() === lead.toLowerCase()
  );
}

export function isHubConferenceParticipant(topic, subscriberName, conference) {
  const normalizedTopic = String(topic ?? '').trim();
  const normalizedSubscriber = String(subscriberName ?? '').trim();
  const host = conferenceHostTopic(conference);
  const attendeeTopics = Array.isArray(conference?.topics)
    ? conference.topics.map((value) => String(value).trim()).filter(Boolean)
    : [];

  if (normalizedTopic) {
    if (normalizedTopic === host) {
      return true;
    }
    if (attendeeTopics.includes(normalizedTopic)) {
      return true;
    }
  }
  if (normalizedSubscriber && normalizedSubscriber === host) {
    return true;
  }
  return false;
}

export function findActiveHubConference(topic, subscriberName, conferences) {
  return (
    conferences.find((conference) =>
      isHubConferenceParticipant(topic, subscriberName, conference)
    ) || null
  );
}

export async function fetchHubConferenceTopics(hubEndpoint, accessToken) {
  const apiUrl = conferenceApiUrl(hubEndpoint, '/api/hub/conference-topics');
  if (!apiUrl) {
    return [];
  }
  try {
    const response = await fetch(apiUrl, {
      headers: conferenceAuthHeaders(accessToken),
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    /** @type {{ topic: string, timezone: string }[]} */
    const out = [];
    for (const entry of data) {
      if (entry && typeof entry === 'object') {
        const topic = String(entry.topic ?? '').trim();
        if (!topic || topic === '*') continue;
        out.push({
          topic,
          timezone: String(entry.timezone ?? '').trim(),
        });
        continue;
      }
      const topic = String(entry ?? '').trim();
      if (!topic || topic === '*') continue;
      out.push({ topic, timezone: '' });
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchHubConferences(hubEndpoint, accessToken) {
  const url = httpUrlFromHubEndpoint(hubEndpoint);
  if (!url) {
    return [];
  }
  const apiUrl = new URL('/api/hub/conference', url.origin).href;
  try {
    const response = await fetch(apiUrl, {
      headers: conferenceAuthHeaders(accessToken),
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createHubConference(
  hubEndpoint,
  hostTopic,
  title,
  topics,
  hostUserName,
  accessToken
) {
  const apiUrl = conferenceApiUrl(hubEndpoint, '/api/hub/conference');
  if (!apiUrl) {
    throw new Error('Invalid hub endpoint');
  }
  const body = {
    hostTopic: String(hostTopic).trim(),
    title: String(title).trim(),
    topics,
  };
  const name = String(hostUserName ?? '').trim();
  if (name) {
    body.hostUserName = name;
  }
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: conferenceAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

/**
 * Join an existing conference as an attendee (adds joinTopic to the roster).
 * @param {string} hubEndpoint
 * @param {string} hostTopic
 * @param {string} joinTopic
 * @param {string} [joinUserName]
 * @param {string} [accessToken]
 */
export async function joinHubConference(
  hubEndpoint,
  hostTopic,
  joinTopic,
  joinUserName,
  accessToken
) {
  const apiUrl = conferenceApiUrl(hubEndpoint, '/api/hub/conference/join');
  if (!apiUrl) {
    throw new Error('Invalid hub endpoint');
  }
  const body = {
    hostTopic: String(hostTopic).trim(),
    joinTopic: String(joinTopic).trim(),
  };
  const name = String(joinUserName ?? '').trim();
  if (name) {
    body.joinUserName = name;
  }
  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: conferenceAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

export async function deleteHubConference(
  hubEndpoint,
  hostTopic,
  leaveTopic,
  accessToken
) {
  const apiUrl = conferenceApiUrl(hubEndpoint, '/api/hub/conference');
  if (!apiUrl) {
    throw new Error('Invalid hub endpoint');
  }
  const body = { hostTopic: String(hostTopic).trim() };
  const leave = leaveTopic?.trim();
  if (leave) {
    body.leaveTopic = leave;
  }
  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: conferenceAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

/**
 * Transfer scene-update leadership. Conference owner (hostTopic) is unchanged.
 * @param {string} hubEndpoint
 * @param {string} hostTopic
 * @param {string} sceneLeaderTopic
 * @param {string} [leaderUserName]
 * @param {string} [accessToken]
 */
export async function transferHubConferenceLead(
  hubEndpoint,
  hostTopic,
  sceneLeaderTopic,
  leaderUserName,
  accessToken
) {
  const apiUrl = conferenceApiUrl(hubEndpoint, '/api/hub/conference/lead');
  if (!apiUrl) {
    throw new Error('Invalid hub endpoint');
  }
  const body = {
    hostTopic: String(hostTopic).trim(),
    sceneLeaderTopic: String(sceneLeaderTopic).trim(),
  };
  const name = String(leaderUserName ?? '').trim();
  if (name) {
    body.leaderUserName = name;
  }
  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: conferenceAuthHeaders(accessToken, true),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  try {
    return await response.json();
  } catch {
    return { status: 'updated' };
  }
}

export async function resolveHubConferenceState(
  hubEndpoint,
  topic,
  subscriberName,
  accessToken
) {
  const conferences = await fetchHubConferences(hubEndpoint, accessToken);
  const match = findActiveHubConference(topic, subscriberName, conferences);
  return {
    active: Boolean(match),
    title: String(match?.title ?? '').trim(),
    participants: normalizeConferenceParticipants(match?.participants),
  };
}

/**
 * LiveScene-aligned roster view for Hub conferences.
 * placeId = hub topic; leading = sceneLeaderTopic (display / scene-update lead).
 * Conference owner remains hostTopic (End conference).
 * Display labels prefer hub userName (self) then placeId; never subscriberName.
 *
 * @param {{ topic?: string, subscriberName?: string, userName?: string }} session
 * @param {object | null | undefined} conference
 */
export function buildCastConferenceView(session, conference) {
  if (!conference) {
    return null;
  }
  const selfPlaceId = String(session?.topic ?? '').trim();
  const subscriberName = String(session?.subscriberName ?? '').trim();
  const userName = String(session?.userName ?? '').trim();
  const hostTopic = conferenceHostTopic(conference);
  if (!hostTopic) {
    return null;
  }
  if (
    !isHubConferenceParticipant(selfPlaceId, subscriberName, conference)
  ) {
    return null;
  }

  const attendeeTopics = Array.isArray(conference.topics)
    ? conference.topics.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const participants = normalizeConferenceParticipants(conference.participants);
  const placeIds = [];
  const seen = new Set();
  // Self first so roster badges always lead with the current user.
  for (const id of [selfPlaceId, hostTopic, ...attendeeTopics]) {
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    placeIds.push(id);
  }

  const leadingPlaceId = conferenceSceneLeaderTopic(conference);
  const isConferenceOwner = isHubConferenceHost(selfPlaceId, conference);
  const selfRole = isHubConferenceSceneLeader(selfPlaceId, conference)
    ? 'leading'
    : 'following';

  const places = placeIds.map((placeId) => {
    const isSelf =
      Boolean(selfPlaceId) &&
      (placeId === selfPlaceId ||
        placeId.toLowerCase() === selfPlaceId.toLowerCase());
    const isLeading =
      placeId === leadingPlaceId ||
      placeId.toLowerCase() === leadingPlaceId.toLowerCase();
    const isFollowing = isLeading && selfRole === 'following';
    let statusLabel = '';
    if (isSelf) {
      statusLabel = selfRole === 'leading' ? '(You) · leading' : '(You)';
    } else if (isFollowing) {
      statusLabel = 'Following';
    } else if (selfRole === 'leading') {
      statusLabel = 'Following you';
    }
    return {
      placeId,
      label: isSelf && userName ? userName : placeId,
      isSelf,
      isLeading,
      isFollowing,
      statusLabel,
    };
  });

  return {
    title: String(conference.title ?? '').trim(),
    places,
    selfPlaceId,
    leadingPlaceId,
    selfRole,
    isConferenceOwner,
    hostTopic,
    sceneLeaderTopic: leadingPlaceId,
    attendeeTopics,
    participants,
  };
}

export async function resolveHubConferenceView(
  hubEndpoint,
  topic,
  subscriberName,
  userName,
  accessToken
) {
  const conferences = await fetchHubConferences(hubEndpoint, accessToken);
  const match = findActiveHubConference(topic, subscriberName, conferences);
  return buildCastConferenceView({ topic, subscriberName, userName }, match);
}
