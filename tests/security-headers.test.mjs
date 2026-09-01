import assert from 'node:assert/strict';
import test from 'node:test';
import nextConfig from '../next.config.ts';

test('applies the baseline security headers to every route', async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  assert.equal(typeof nextConfig.headers, 'function');

  const rules = await nextConfig.headers();
  const allRoutes = rules.find((rule) => rule.source === '/(.*)');
  const headers = new Map(allRoutes?.headers.map(({ key, value }) => [key, value]));

  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headers.get('X-Frame-Options'), 'DENY');
  assert.equal(headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('Permissions-Policy'), 'camera=(), geolocation=(), microphone=(self)');
  assert.match(headers.get('Content-Security-Policy') ?? '', /frame-ancestors 'none'/);
  assert.match(headers.get('Content-Security-Policy') ?? '', /object-src 'none'/);
});
