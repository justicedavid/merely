import { DatabagSDK } from '../src/index';
import { type SessionParams } from '../src/types';

import { MockConnection } from '../__mocks__/connection';
import { MockSettingsModule } from '../__mocks__/settings';
import { MockIdentityModule } from '../__mocks__/identity';
import { MockAliasModule } from '../__mocks__/alias';
import { MockStreamModule } from '../__mocks__/stream';
import { MockContactModule } from '../__mocks__/contact';
import { MockAttributeModule } from '../__mocks__/attribute';
import { MockRingModule } from '../__mocks__/ring';
import { waitFor } from '../__mocks__/waitFor';

jest.mock('../src/net/fetchUtil', () => {
  const fn = jest.fn().mockImplementation((url: string, options: { method: string, body: string }) => {
    return Promise.resolve({ state: 200, json: () => ({ guid: 'guid', appToken: 'token', created: 3, pushSupported: false }) });
  });

  return {
    fetchWithTimeout: fn,
    checkResponse: () => {},
  }
});

const mockConnection = new MockConnection();
jest.mock('../src/connection', () => {
  return {
    Connection: jest.fn().mockImplementation(() => {
      return mockConnection;
    })
  }
})

const mockSettings = new MockSettingsModule();
jest.mock('../src/settings', () => {
  return {
    SettingsModule: jest.fn().mockImplementation(() => {
      return mockSettings;
    })
  }
})

const mockIdentity = new MockIdentityModule();
jest.mock('../src/identity', () => {
  return {
    IdentityModule: jest.fn().mockImplementation(() => {
      return mockIdentity;
    })
  }
})

const mockStream = new MockStreamModule();
jest.mock('../src/stream', () => {
  return {
    StreamModule: jest.fn().mockImplementation(() => {
      return mockStream;
    })
  }
})

const mockContact = new MockContactModule();
jest.mock('../src/contact', () => {
  return {
    ContactModule: jest.fn().mockImplementation(() => {
      return mockContact;
    })
  }
})

const mockAttribute = new MockAttributeModule();
jest.mock('../src/attribute', () => {
  return {
    AttributeModule: jest.fn().mockImplementation(() => {
      return mockAttribute;
    })
  }
})

const mockAlias = new MockAliasModule();
jest.mock('../src/alias', () => {
  return {
    AliasModule: jest.fn().mockImplementation(() => {
      return mockAlias;
    })
  }
})

const mockRing = new MockRingModule();
jest.mock('../src/ring', () => {
  return {
    RingModule: jest.fn().mockImplementation(() => {
      return mockRing;
    })
  }
})

test('allocates session correctly', async () => {
  let status: string = '';
  const sdk = new DatabagSDK({ channelTypes: []});
  const params: SessionParams = { pushType: '', deviceToken: '', notifications: [], deviceId: '', version: '', appName: '' };
  const session = await sdk.login('handle', 'password', 'jest.test', true, null, params);
  session.addStatusListener((ev: string) => { status = ev; });
  const settings = session.getSettings();
  settings.enableNotifications();
  mockConnection.emitStatus('connected');
  mockConnection.emitRevision({ account: 3, profile: 3, article: 3, group: 3, channel: 3, card: 3});
  mockConnection.emitRing({ cardId: '', callId: 'test', calleeToken: '', ice: []});
  await waitFor(() => (status === 'connected'));
  await waitFor(() => (mockSettings.revision == 3));
  await waitFor(() => (mockIdentity.revision == 3));
  await waitFor(() => (mockStream.revision == 3));
  await waitFor(() => (mockContact.revision == 3));
  await waitFor(() => (mockAttribute.revision == 3));
  await waitFor(() => (mockAlias.revision == 3));
});
