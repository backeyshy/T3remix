import {
  RelayManagedEndpointOrigin,
  RelayManagedEndpointRuntimeConfig,
} from "@t3tools/contracts/relay";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as ServerSecretStore from "../auth/ServerSecretStore.ts";

export const CLOUD_MINT_PUBLIC_KEY = "t3remix-cloud-mint-ed25519-public-key";
export const CLOUD_ENDPOINT_RUNTIME_CONFIG = "t3remix-cloud-endpoint-runtime-config";
export const CLOUD_ENDPOINT_CONFIRMED_ORIGIN = "t3remix-cloud-endpoint-confirmed-origin";
export const CLOUD_LINKED_USER_ID = "t3remix-cloud-linked-user-id";
export const RELAY_URL_SECRET = "t3remix-cloud-relay-url";
export const RELAY_ISSUER_SECRET = "t3remix-cloud-relay-issuer";
export const RELAY_ENVIRONMENT_CREDENTIAL_SECRET = "t3remix-cloud-relay-environment-credential";
// Upstream mobile linking could set the old preference without asking the host owner.
export const PUBLISH_AGENT_ACTIVITY_SECRET = "t3remix-publish-agent-activity";
export const HOLD_WEBHOOKS_WHILE_OFFLINE_SECRET = "t3remix-cloud-hold-webhooks-while-offline";
export const CLOUD_LINK_REVOKED = "t3remix-cloud-link-revoked";

export const encodeEndpointRuntimeConfigJson = Schema.encodeEffect(
  Schema.fromJsonString(RelayManagedEndpointRuntimeConfig),
);

export const decodeRuntimeConfig = Schema.decodeUnknownOption(
  Schema.fromJsonString(RelayManagedEndpointRuntimeConfig),
);

export const ManagedEndpointConfirmedOrigin = Schema.Struct({
  config: RelayManagedEndpointRuntimeConfig,
  origin: RelayManagedEndpointOrigin,
});

export const encodeConfirmedOriginJson = Schema.encodeEffect(
  Schema.fromJsonString(ManagedEndpointConfirmedOrigin),
);

export const decodeConfirmedOrigin = Schema.decodeUnknownOption(
  Schema.fromJsonString(ManagedEndpointConfirmedOrigin),
);

export function isAgentActivityPublishingEnabledValue(value: string | null): boolean {
  return value === "true";
}

/**
 * Mirrors the per-publish gate in AgentAwarenessRelay, so the descriptor
    capability never advertises publishing that the publisher would skip.
 */
export const readAgentActivityPublishingActive: (
  secrets: ServerSecretStore.ServerSecretStore["Service"],
) => Effect.Effect<boolean> = Effect.fn("config.readAgentActivityPublishingActive")(
  function* (secrets: ServerSecretStore.ServerSecretStore["Service"]) {
    const readSecretString = (name: string) =>
      secrets
        .get(name)
        .pipe(
          Effect.map((bytes) =>
            Option.isSome(bytes) ? new TextDecoder().decode(bytes.value) : null,
          ),
        );
    const [enabled, url, environmentCredential] = yield* Effect.all([
      readSecretString(PUBLISH_AGENT_ACTIVITY_SECRET),
      readSecretString(RELAY_URL_SECRET),
      readSecretString(RELAY_ENVIRONMENT_CREDENTIAL_SECRET),
    ]);
    // Match the publisher, which treats empty strings as unconfigured.
    return (
      isAgentActivityPublishingEnabledValue(enabled) &&
      url !== null &&
      url !== "" &&
      environmentCredential !== null &&
      environmentCredential !== ""
    );
  },
  Effect.orElseSucceed(() => false),
);

const readSecretString = (name: string) =>
  ServerSecretStore.ServerSecretStore.pipe(
    Effect.flatMap((secrets) => secrets.get(name)),
    Effect.map((bytes) =>
      Option.isSome(bytes) && bytes.value.length > 0 ? new TextDecoder().decode(bytes.value) : null,
    ),
    Effect.orElseSucceed(() => null),
  );

export const readRelayConnection = Effect.all([
  readSecretString(RELAY_URL_SECRET),
  readSecretString(RELAY_ENVIRONMENT_CREDENTIAL_SECRET),
]).pipe(
  Effect.map(([url, environmentCredential]) =>
    url && environmentCredential ? { url, environmentCredential } : null,
  ),
);

export const readHoldWebhooksWhileOffline = readSecretString(
  HOLD_WEBHOOKS_WHILE_OFFLINE_SECRET,
).pipe(Effect.map((value) => value === "true"));
