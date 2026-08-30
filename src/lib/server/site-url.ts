const DEFAULT_LOCAL_SITE_URL = 'http://localhost:3000';

function addHttpsProtocol(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  return `https://${value}`;
}

function parseHttpOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    return url.origin;
  } catch {
    return null;
  }
}

function isLocalUrl(value: string | null) {
  if (!value) return false;

  const hostname = new URL(value).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function getVercelSiteUrl() {
  return (
    parseHttpOrigin(addHttpsProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL)) ??
    parseHttpOrigin(addHttpsProtocol(process.env.VERCEL_URL)) ??
    parseHttpOrigin(addHttpsProtocol(process.env.VERCEL_BRANCH_URL))
  );
}

export function getSiteUrl(fallbackUrl = DEFAULT_LOCAL_SITE_URL): string {
  const configuredSiteUrl = parseHttpOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelSiteUrl = getVercelSiteUrl();

  if (process.env.VERCEL === '1') {
    if (configuredSiteUrl && !isLocalUrl(configuredSiteUrl)) return configuredSiteUrl;
    if (vercelSiteUrl) return vercelSiteUrl;
  }

  return configuredSiteUrl ?? parseHttpOrigin(fallbackUrl) ?? DEFAULT_LOCAL_SITE_URL;
}
