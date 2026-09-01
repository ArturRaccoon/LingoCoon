import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createExpiringStorageEnvelope,
  readExpiringStorageEnvelope,
} from '../src/lib/expiring-storage.ts';

const now = 1_800_000_000_000;

test('returns a stored value before its expiration', () => {
  const envelope = createExpiringStorageEnvelope({ nickname: 'Learner' }, 60_000, now);

  assert.deepEqual(
    readExpiringStorageEnvelope(envelope, now + 59_999),
    { nickname: 'Learner' },
  );
});

test('rejects a stored value at or after its expiration', () => {
  const envelope = createExpiringStorageEnvelope({ nickname: 'Learner' }, 60_000, now);

  assert.equal(readExpiringStorageEnvelope(envelope, now + 60_000), null);
  assert.equal(readExpiringStorageEnvelope(envelope, now + 60_001), null);
});

test('rejects malformed or unknown storage envelopes', () => {
  assert.equal(readExpiringStorageEnvelope(null, now), null);
  assert.equal(readExpiringStorageEnvelope({ version: 2, expiresAt: now + 1, value: {} }, now), null);
  assert.equal(readExpiringStorageEnvelope({ version: 1, expiresAt: 'later', value: {} }, now), null);
  assert.equal(readExpiringStorageEnvelope({ version: 1, expiresAt: now + 1 }, now), null);
});

test('rejects non-positive expiration durations', () => {
  assert.throws(() => createExpiringStorageEnvelope({}, 0, now));
  assert.throws(() => createExpiringStorageEnvelope({}, Number.NaN, now));
});
