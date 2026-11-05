/**
 * Offline asserts for HubClient constructor / newInstance shim (no hub required).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HubClient,
  newInstance,
} from '../../packages/client/dist/hub-client.js';

describe('HubClient constructor', () => {
  it('accepts hub, session, options like Python hub_client', () => {
    const client = new HubClient(
      {
        hub_endpoint: 'http://127.0.0.1:2018/api/hub',
        authorization_endpoint: 'http://127.0.0.1:2018/oauth/authorize',
        token_endpoint: 'http://127.0.0.1:2018/oauth/token',
        client_id: 'id',
        client_secret: 'secret',
      },
      {
        subscriberName: 'DEMO-ABC',
        productName: 'DEMO',
        topic: 'USER-1',
        events: ['*'],
      },
      { autoReconnect: false }
    );
    assert.equal(client.getSessionConfig().subscriberName, 'DEMO-ABC');
    assert.equal(client.getSessionConfig().topic, 'USER-1');
    assert.equal(client.getHubConfig().hub_endpoint, 'http://127.0.0.1:2018/api/hub');
    assert.equal(typeof client.connect, 'function');
    assert.equal(typeof client.close, 'function');
    assert.equal(typeof client.sendHubRequestResponse, 'function');
    void client.close({ hubUnsubscribe: false });
  });

  it('newInstance shim maps legacy bag to constructor', () => {
    const client = HubClient.newInstance({
      hub: {
        hub_endpoint: 'http://127.0.0.1:2018/api/hub',
        token_endpoint: 'http://127.0.0.1:2018/oauth/token',
        client_id: 'id',
        client_secret: 'secret',
      },
      session: {
        subscriberName: 'LEGACY-1',
        topic: 'T',
        events: ['*'],
      },
      autoReconnect: false,
    });
    assert.equal(client.getSessionConfig().subscriberName, 'LEGACY-1');
    assert.equal(newInstance({ hub: {}, session: { subscriberName: 'X' } }).getSessionConfig().subscriberName, 'X');
    void client.close({ hubUnsubscribe: false });
  });
});
