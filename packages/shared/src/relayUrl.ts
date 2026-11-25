export function isUpstreamServiceHostname(hostname: string): boolean {
  return /(?:^|\.)(?:t3\.(?:codes|chat|tools|sh)|t3coderelay\.com|t3tools\.com|pinglabs\.workers\.dev)$/iu.test(
    hostname.replace(/\.+$/u, ""),
  );
}

export function isUpstreamServiceUrl(value: string): boolean {
  try {
    return isUpstreamServiceHostname(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function normalizeSecureRelayUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      isUpstreamServiceHostname(url.hostname) ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.search.length > 0 ||
      url.hash.length > 0 ||
      !/^\/+$/u.test(url.pathname)
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function isSecureRelayUrl(value: string): boolean {
  return normalizeSecureRelayUrl(value) !== null;
}
