import {
  AuthEnvironmentMaintainScope,
  sessionGrantsScope,
  type AuthSessionState,
  type ExecutionEnvironmentCapabilities,
  type ServerProvider,
} from "@t3tools/contracts";
import { cliReleaseChannelOf } from "@t3tools/shared/cliRelease";
import { isUpstreamServiceHostname } from "@t3tools/shared/relayUrl";
import { compareSemverVersions } from "@t3tools/shared/semver";
import { msg } from "gt-react-native";

import { m } from "../../i18n/messages";

export function canMaintainEnvironment(session: AuthSessionState | null, connected: boolean) {
  return (
    connected &&
    session?.authenticated === true &&
    sessionGrantsScope(session, AuthEnvironmentMaintainScope)
  );
}

export function supportsEnvironmentUpdate(
  capabilities: Pick<ExecutionEnvironmentCapabilities, "serverSelfUpdate" | "desktopAppUpdate">,
) {
  return (
    capabilities.serverSelfUpdate !== undefined &&
    (capabilities.serverSelfUpdate !== "desktop-managed" || capabilities.desktopAppUpdate === true)
  );
}

export function canUpdateEnvironmentProvider(provider: ServerProvider) {
  const compatibility = provider.compatibilityAdvisory?.latestVersionStatus;
  return (
    provider.installed &&
    provider.availability !== "unavailable" &&
    provider.versionAdvisory?.status === "behind_latest" &&
    provider.versionAdvisory.canUpdate &&
    provider.versionAdvisory.latestVersion !== null &&
    compatibility !== "broken" &&
    compatibility !== "unsupported" &&
    provider.updateState?.status !== "running" &&
    provider.updateState?.status !== "queued"
  );
}

export function releaseFeedUrl(): string | null {
  try {
    const url = new URL(process.env.EXPO_PUBLIC_T3CODE_RELEASE_FEED_URL ?? "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      isUpstreamServiceHostname(url.hostname)
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export async function findEnvironmentUpdate(currentVersion: string, signal: AbortSignal) {
  const url = releaseFeedUrl();
  if (!url) throw new Error(m(msg("No release feed is configured.")));
  const response = await fetch(url, { signal, redirect: "error" });
  if (!response.ok)
    throw new Error(
      m(msg("Could not check releases ({status}). Try again.", { status: response.status })),
    );
  const version =
    /^version:\s*["']?(\d+\.\d+\.\d+(?:-(?:nightly|preview)\.\d{8}\.\d+)?)["']?\s*$/m.exec(
      await response.text(),
    )?.[1];
  const channel = cliReleaseChannelOf(currentVersion);
  if (!version || cliReleaseChannelOf(version) !== channel)
    throw new Error(m(msg("No {channel} release was found.", { channel })));
  return compareSemverVersions(version, currentVersion) > 0 ? version : null;
}
