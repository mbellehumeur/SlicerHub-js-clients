/**
 * Offline asserts for @slicer-hub/client event-name helpers (no hub required).
 * Parity with HubInterface/Testing/Python/python_client/test_event_names.py
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFERENCE_END,
  CONFERENCE_START,
  IMAGINGSTUDY_OPEN,
  STATUS_UPDATE,
  ensureHubSubscribeEvents,
  isRequestEvent,
  normalizeDataType,
  requestEventFor,
  responseEventFor,
} from '../../packages/client/src/eventNames.js';
import { getHubEventLower } from '../../packages/client/src/messageContext.js';
import { hasPendingPayload } from '../../packages/client/src/sendNormalize.js';

describe('eventNames helpers', () => {
  it('normalizes data types and request/response wire names', () => {
    assert.equal(normalizeDataType(' STATUS '), 'status');
    assert.equal(requestEventFor('STATUS'), 'status-request');
    assert.equal(responseEventFor('STATUS'), 'status-response');
    assert.equal(requestEventFor('status'), 'status-request');
    assert.equal(isRequestEvent('status-request'), true);
    assert.equal(isRequestEvent('status-update'), false);
  });

  it('exports conference start/end wire constants (Python parity)', () => {
    assert.equal(CONFERENCE_START, 'conference-start');
    assert.equal(CONFERENCE_END, 'conference-end');
  });

  it('reads hub.event from message.event', () => {
    const name = getHubEventLower({
      'hub.event': IMAGINGSTUDY_OPEN,
    });
    assert.equal(name, IMAGINGSTUDY_OPEN);
  });

  it('builds a STATUS *-request event shape (JS client style)', () => {
    const dataType = normalizeDataType('STATUS');
    const built = {
      'hub.event': requestEventFor(dataType),
      'hub.topic': 'USER-1',
      context: { dataType },
    };
    assert.equal(built['hub.event'], 'status-request');
    assert.equal(built.context.dataType, 'status');
  });

  it('ensureHubSubscribeEvents adds status-request and status-update', () => {
    assert.deepEqual(ensureHubSubscribeEvents([]), ['*']);
    assert.deepEqual(ensureHubSubscribeEvents(['*']), ['*']);
    const ensured = ensureHubSubscribeEvents(['dicom-send']);
    assert.ok(ensured.includes('dicom-send'));
    assert.ok(ensured.includes('status-request'));
    assert.ok(ensured.includes(STATUS_UPDATE));

    const spEvents = ensureHubSubscribeEvents([
      'dicom-send',
      'nifti-send',
      'status-request',
    ]);
    assert.ok(spEvents.includes('status-request'));
    assert.ok(spEvents.includes(STATUS_UPDATE));
    assert.equal(spEvents.filter((e) => e === 'status-request').length, 1);
  });

  it('hasPendingPayload detects payloadIds vs inline data', () => {
    const eventPending = {
      'hub.event': 'dicom-send',
      context: {
        files: [
          {
            fileName: 'a.dcm',
            payloadIds: ['abc'],
            byteLength: 4,
          },
        ],
      },
    };
    assert.equal(hasPendingPayload(eventPending), true);

    const messagePending = { id: 'm1', event: eventPending };
    assert.equal(hasPendingPayload(messagePending.event), true);
    assert.equal(messagePending.event.context.files[0].payloadIds[0], 'abc');

    const eventReady = {
      'hub.event': 'dicom-send',
      context: {
        files: [{ fileName: 'a.dcm', data: new Uint8Array([1, 2, 3, 4]).buffer }],
      },
    };
    assert.equal(hasPendingPayload(eventReady), false);
    assert.equal(hasPendingPayload({ id: 'm2', event: eventReady }.event), false);
  });
});
