import { assert, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";

import * as AnalyticsService from "./AnalyticsService.ts";

it.effect("drops usage and feedback events without any HTTP, identity or storage service", () =>
  Effect.gen(function* () {
    const analytics = yield* AnalyticsService.AnalyticsService;
    assert.isFalse(yield* analytics.record("client.turn.requested", { model: "test" }));
    assert.isFalse(
      yield* analytics.record("agent.feedback", { text: "private" }, { anonymous: true }),
    );
    yield* analytics.flush;
  }).pipe(
    Effect.provide([
      AnalyticsService.layer,
      ConfigProvider.layer(ConfigProvider.fromEnvRecord({ T3CODE_TELEMETRY_ENABLED: "true" })),
    ]),
  ),
);
