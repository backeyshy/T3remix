import { isUpstreamServiceHostname } from "./relayUrl.ts";
import * as Schema from "effect/Schema";

const ClerkPublishableKeyPrefix = Schema.Literals(["pk_test", "pk_live", "unknown"]);

export class ClerkPublishableKeyDecodeError extends Schema.TaggedError<ClerkPublishableKeyDecodeError>()(
  "ClerkPublishableKeyDecodeError",
  {
    keyPrefix: ClerkPublishableKeyPrefix,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to decode Clerk publishable key (${this.keyPrefix}).`;
  }
}

export class ClerkPublishableKeyFrontendApiError extends Schema.TaggedError<ClerkPublishableKeyFrontendApiError>()(
  "ClerkPublishableKeyFrontendApiError",
  {
    keyPrefix: ClerkPublishableKeyPrefix,
    frontendApi: Schema.String,
    reason: Schema.Literals(["empty", "contains-path", "invalid-url"]),
    cause: Schema.optional(Schema.Defect()),
  },
) {
  override get message(): string {
    return `Invalid Clerk frontend API decoded from publishable key (${this.keyPrefix}; ${this.reason}).`;
  }
}

function parseClerkFrontendApi(publishableKey: string): {
  readonly hostname: string;
  readonly url: string;
} {
  const keyPrefix = publishableKey.startsWith("pk_test_")
    ? "pk_test"
    : publishableKey.startsWith("pk_live_")
      ? "pk_live"
      : "unknown";
  const encodedFrontendApi = publishableKey.split("_").slice(2).join("_");
  let frontendApi: string;
  try {
    frontendApi = globalThis.atob(encodedFrontendApi).replace(/\$$/u, "");
  } catch (cause) {
    throw new ClerkPublishableKeyDecodeError({ keyPrefix, cause });
  }

  if (frontendApi.length === 0) {
    throw new ClerkPublishableKeyFrontendApiError({
      keyPrefix,
      frontendApi,
      reason: "empty",
    });
  }
  if (frontendApi.includes("/")) {
    throw new ClerkPublishableKeyFrontendApiError({
      keyPrefix,
      frontendApi,
      reason: "contains-path",
    });
  }

  const url = `https://${frontendApi}`;
  try {
    const parsed = new URL(url);
    if (
      isUpstreamServiceHostname(parsed.hostname) ||
      parsed.host !== frontendApi ||
      keyPrefix === "unknown"
    ) {
      throw new Error("Unsupported authentication hostname");
    }
    return { hostname: parsed.hostname, url };
  } catch (cause) {
    throw new ClerkPublishableKeyFrontendApiError({
      keyPrefix,
      frontendApi,
      reason: "invalid-url",
      cause,
    });
  }
}

export function clerkFrontendApiUrlFromPublishableKey(publishableKey: string): string {
  return parseClerkFrontendApi(publishableKey).url;
}

export function clerkFrontendApiHostnameFromPublishableKey(publishableKey: string): string {
  return parseClerkFrontendApi(publishableKey).hostname;
}

export function normalizeClerkPublishableKey(value: string | null | undefined): string | null {
  const key = value?.trim();
  if (!key) return null;
  try {
    parseClerkFrontendApi(key);
    return key;
  } catch {
    return null;
  }
}

export function relayClerkTokenOptions(template: string) {
  return {
    template,
    skipCache: true,
  } as const;
}
