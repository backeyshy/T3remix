import { isUpstreamServiceHostname } from "@t3tools/shared/relayUrl";

import {
  readHostedPairingRequest as readPairingRequest,
  setPairingTokenOnUrl,
} from "@t3tools/shared/remote";

export interface HostedPairingRequest {
  readonly host: string;
  readonly token: string;
  readonly label: string;
}

type HostedAppChannel = "latest" | "nightly";

export function configuredHostedAppUrl(): string {
  return (
    originFromUrl(import.meta.env.VITE_HOSTED_APP_URL ?? "") ??
    originFromUrl(globalThis.location?.href ?? "") ??
    ""
  );
}

function configuredBackendUrl(): string {
  return import.meta.env.VITE_HTTP_URL?.trim() || import.meta.env.VITE_WS_URL?.trim() || "";
}

function configuredHostedAppChannel(): HostedAppChannel | null {
  const channel = import.meta.env.VITE_HOSTED_APP_CHANNEL?.trim().toLowerCase();
  return channel === "latest" || channel === "nightly" ? channel : null;
}

function originFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !isUpstreamServiceHostname(url.hostname)
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function isHostedStaticApp(url?: URL): boolean {
  if (configuredBackendUrl()) {
    return false;
  }

  if (configuredHostedAppChannel()) {
    return true;
  }

  if (url === undefined && (typeof window === "undefined" || window.location === undefined)) {
    return false;
  }

  const hostedOrigin = originFromUrl(import.meta.env.VITE_HOSTED_APP_URL ?? "");
  return hostedOrigin !== null && (url ?? new URL(window.location.href)).origin === hostedOrigin;
}

export function readHostedPairingRequest(url: URL = new URL(window.location.href)) {
  return readPairingRequest(url);
}

export function hasHostedPairingRequest(url: URL = new URL(window.location.href)): boolean {
  return readHostedPairingRequest(url) !== null;
}

export function buildHostedPairingUrl(input: {
  readonly host: string;
  readonly token: string;
  readonly label?: string | null;
}): string {
  const url = new URL("/pair", configuredHostedAppUrl() || input.host);
  url.searchParams.set("host", input.host);

  const label = input.label?.trim();
  if (label) {
    url.searchParams.set("label", label);
  }

  return setPairingTokenOnUrl(url, input.token).toString();
}
