import { isUpstreamServiceHostname, normalizeSecureRelayUrl } from "@t3tools/shared/relayUrl";
import { buildHostedPairingUrl } from "../../hostedPairing";
import { setPairingTokenOnUrl } from "@t3tools/shared/remote";

export function resolveDesktopPairingUrl(endpointUrl: string, credential: string): string | null {
  const url = new URL(endpointUrl);
  if (isUpstreamServiceHostname(url.hostname)) return null;
  url.pathname = "/pair";
  return setPairingTokenOnUrl(url, credential).toString();
}

export function resolveHostedPairingUrl(endpointUrl: string, credential: string): string | null {
  const url = new URL(endpointUrl);
  if (
    url.protocol !== "https:" ||
    isUpstreamServiceHostname(url.hostname) ||
    !normalizeSecureRelayUrl(import.meta.env.VITE_HOSTED_APP_URL ?? "")
  ) {
    return null;
  }

  return buildHostedPairingUrl({
    host: endpointUrl,
    token: credential,
  });
}
