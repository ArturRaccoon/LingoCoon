const STORAGE_ENVELOPE_VERSION = 1;

interface ExpiringStorageEnvelope<T> {
  version: typeof STORAGE_ENVELOPE_VERSION;
  expiresAt: number;
  value: T;
}

export function createExpiringStorageEnvelope<T>(
  value: T,
  ttlMs: number,
  now = Date.now(),
): ExpiringStorageEnvelope<T> {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error('Storage expiration must be a positive duration.');
  }

  return {
    version: STORAGE_ENVELOPE_VERSION,
    expiresAt: now + ttlMs,
    value,
  };
}

export function readExpiringStorageEnvelope(
  value: unknown,
  now = Date.now(),
): unknown | null {
  if (!value || typeof value !== 'object') return null;

  const envelope = value as Record<string, unknown>;
  if (
    envelope.version !== STORAGE_ENVELOPE_VERSION ||
    typeof envelope.expiresAt !== 'number' ||
    !Number.isFinite(envelope.expiresAt) ||
    envelope.expiresAt <= now ||
    !Object.hasOwn(envelope, 'value')
  ) {
    return null;
  }

  return envelope.value;
}
