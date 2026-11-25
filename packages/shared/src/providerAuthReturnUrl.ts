import { currentHostedAppOrigin } from "./connectAuth.ts";
import { isUpstreamServiceHostname } from "./relayUrl.ts";
import { isLoopbackHost } from "./preview.ts";

export function providerAuthReturnUrl(
  value: string | undefined,
  configuredOrigin = currentHostedAppOrigin(),
): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const desktop =
      ["t3remix:", "t3remix-dev:", "t3remix-preview:"].includes(url.protocol) && url.host === "app";
    const web =
      ["http:", "https:"].includes(url.protocol) &&
      (isLoopbackHost(url.hostname) || url.origin === configuredOrigin);
    if (
      isUpstreamServiceHostname(url.hostname) ||
      url.username ||
      url.password ||
      (!desktop && !web) ||
      (url.pathname !== "/welcome" &&
        url.pathname !== "/settings" &&
        !url.pathname.startsWith("/settings/"))
    )
      return undefined;
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        url.pathname === "/welcome" ||
        !["machine", "project", "checkout", "environmentId", "instanceId"].includes(key)
      ) {
        url.searchParams.delete(key);
      }
    }
    if (url.pathname !== "/welcome" || !/^#agents:[\w-]+$/u.test(url.hash)) url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}
