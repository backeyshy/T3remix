import { RelayApi } from "@t3tools/contracts/relay";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as HttpApiBuilder from "effect/http-api/HttpApiBuilder";

export const layerMobileIngest = HttpApiBuilder.group(RelayApi, "mobileTelemetry", (handlers) =>
  handlers.handleRaw("ingest", () => Effect.succeed(HttpServerResponse.empty({ status: 410 }))),
);
