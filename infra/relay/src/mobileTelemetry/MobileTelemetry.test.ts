import * as NodeHttpPlatform from "@effect/platform-node/NodeHttpPlatform";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { expect, it } from "@effect/vitest";
import { RelayApi } from "@t3tools/contracts/relay";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Etag from "effect/http/Etag";
import * as HttpEffect from "effect/http/HttpEffect";
import * as HttpRouter from "effect/http/HttpRouter";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import type * as HttpServerResponse from "effect/http/HttpServerResponse";
import * as HttpApi from "effect/http-api/HttpApi";
import * as HttpApiBuilder from "effect/http-api/HttpApiBuilder";
import { layerMobileIngest } from "./MobileTelemetry.ts";

it.effect("discards every mobile signal even when the body is invalid", () =>
  Effect.gen(function* () {
    const handler = yield* HttpRouter.toHttpEffect(
      HttpApiBuilder.layer(HttpApi.make("RelayApi").add(RelayApi.groups.mobileTelemetry)).pipe(
        Layer.provide(layerMobileIngest),
        Layer.provide([NodeServices.layer, NodeHttpPlatform.layer, Etag.layerWeak]),
      ),
    );
    for (const signal of ["logs", "traces", "metrics"]) {
      const response = yield* Deferred.make<HttpServerResponse.HttpServerResponse>();
      const req = new Request(
        `https://relay.test/v1/mobile/observe/d763fcb8-d37c-41ea-a773-b54a0ab4a454/v1/${signal}`,
        { method: "POST", body: "invalid" },
      );
      yield* HttpEffect.toHandled(handler, (_request, value) =>
        Deferred.succeed(response, value),
      ).pipe(
        Effect.provideService(HttpServerRequest.HttpServerRequest, HttpServerRequest.fromWeb(req)),
      );
      expect((yield* Deferred.await(response)).status).toBe(410);
    }
  }).pipe(Effect.scoped),
);
