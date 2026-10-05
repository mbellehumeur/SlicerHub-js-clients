/**
 * Default English strings for Hub conference UI.
 * Apps (worklist, reporting, IRA) may pass a partial override built from i18next.
 *
 * Placeholders: {{host}}, {{title}}
 *
 * @typedef {typeof HUB_CONFERENCE_STRINGS_EN} CastConferenceStrings
 */

export const HUB_CONFERENCE_STRINGS_EN = Object.freeze({
  // Dialog shell
  dialogTitle: 'Conferencing',
  close: 'Close',
  closeAria: 'Close',

  // Session (user / topic)
  sessionSection: 'User / topic',
  sessionInfo: 'Session info',
  participantsAria: 'Participants',

  // Create
  createSection: 'Create a conference',
  conferenceTitle: 'Conference title',
  selectConferenceTitle: 'Select a conference title',
  otherTitle: 'Other…',
  customTitle: 'Custom title',
  customTitlePlaceholder: 'Enter conference title',
  users: 'Users',
  loadingUsers: 'Loading users…',
  noUsers: 'No users available',
  createConference: 'Create conference',
  creating: 'Creating…',

  // Join
  joinSection: 'Join a conference',
  activeConferences: 'Active conferences',
  noConferences: 'No conferences available',
  selectConference: 'Select a conference',
  untitled: 'Untitled',
  joinConference: 'Join conference',
  joining: 'Joining…',

  // Manage
  manageSection: 'Manage conference',
  titleLabel: 'Title:',
  na: 'N/A',
  participants: 'Participants',
  noPlaces: 'No places',
  leaveConference: 'Leave conference',
  endConference: 'End conference',
  ending: 'Ending…',
  leaving: 'Leaving…',
  conferenceEnded: 'Conference ended.',
  leftConference: 'Left conference.',

  // Errors / status
  connectHubFirst: 'Connect to the Slicer hub first.',
  topicRequiredHost: 'Hub topic is required to host a conference.',
  topicRequiredJoin: 'Hub topic is required to join a conference.',
  titleRequired: 'Conference title is required.',
  selectAttendee: 'Select at least one attendee topic.',
  selectConferenceToJoin: 'Select a conference to join.',
  failedCreate: 'Failed to create conference.',
  failedJoin: 'Failed to join conference.',
  failedUpdate: 'Failed to update conference.',

  // Invite
  inviteTitle: 'Conference invitation',
  joinAndFollow: 'Join and follow',
  joinNoFollow: 'Join but do not follow',
  doNotJoin: 'Do not join',
  hostFallback: 'host',
  /** {{title}} — join and follow {{host}}? */
  inviteLeadWithTitle: '{{title}} — join and follow {{host}}?',
  /** Join conference and follow {{host}}? */
  inviteLeadNoTitle: 'Join conference and follow {{host}}?',
  /** Join and follow {{host}} */
  joinAndFollowHost: 'Join and follow {{host}}',

  // Takeover
  takeoverTitle: 'Take over?',
  takeoverBody:
    'The host and all participants will be notified that you are taking over. You will lead scene updates for this conference.',
  cancel: 'Cancel',
  takeOver: 'Take over',

  // Header
  conferencing: 'Conferencing',
  subscribeHubFirst: 'Subscribe to the hub first',
  stopFollowing: 'Stop following',
  resumeFollowing: 'Resume following',
});

/**
 * @param {string} template
 * @param {Record<string, string>} vars
 */
export function interpolateCastConferenceString(template, vars = {}) {
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ''
  );
}

/**
 * @param {Partial<CastConferenceStrings> | null | undefined} overrides
 * @returns {CastConferenceStrings}
 */
export function mergeCastConferenceStrings(overrides) {
  if (!overrides || typeof overrides !== 'object') {
    return { ...HUB_CONFERENCE_STRINGS_EN };
  }
  return { ...HUB_CONFERENCE_STRINGS_EN, ...overrides };
}
