// @effect-diagnostics nodeBuiltinImport:off - Vite configuration also loads before dependency installation.
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";

import { isUpstreamServiceHostname } from "../../../packages/shared/src/relayUrl.ts";

export function allowedCacheEndpoint(value: string, allowCredentials = false): boolean {
  const url = URL.parse(value);
  if (!url || url.search || url.hash || (!allowCredentials && (url.username || url.password)))
    return false;
  const loopback =
    ["localhost", "[::1]"].includes(url.hostname) || /^127(?:\.\d+){3}$/u.test(url.hostname);
  return (
    !isUpstreamServiceHostname(url.hostname) &&
    (url.protocol === "https:" || (url.protocol === "http:" && loopback))
  );
}

export function remoteCacheUrl(root: string, env = process.env, home = NodeOS.homedir()) {
  if (env.VP_REMOTE_CACHE_URL)
    return allowedCacheEndpoint(env.VP_REMOTE_CACHE_URL, true)
      ? env.VP_REMOTE_CACHE_URL
      : undefined;
  try {
    const { endpoint } = JSON.parse(
      NodeFS.readFileSync(NodePath.join(root, ".task-cache.json"), "utf8"),
    );
    const credentials = JSON.parse(
      NodeFS.readFileSync(
        NodePath.join(home, ".config/t3remix-task-cache/credentials.json"),
        "utf8",
      ),
    );
    const credential = credentials[endpoint];
    if (
      typeof endpoint !== "string" ||
      !allowedCacheEndpoint(endpoint) ||
      typeof credential?.name !== "string" ||
      typeof credential.token !== "string"
    )
      return;
    const url = new URL(endpoint);
    url.username = credential.name;
    url.password = credential.token;
    return url.href;
  } catch {
    // Missing or damaged optional setup must not prevent ordinary project commands.
    return;
  }
}
