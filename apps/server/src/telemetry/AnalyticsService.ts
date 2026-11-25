import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class AnalyticsService extends Context.Service<
  AnalyticsService,
  {
    readonly record: (
      event: string,
      properties?: Readonly<Record<string, unknown>>,
      options?: { readonly anonymous?: boolean },
    ) => Effect.Effect<boolean>;

    readonly flush: Effect.Effect<void>;
  }
>()("t3/telemetry/AnalyticsService") {}

// Keep callers and their return semantics while providing no transport, queue, or identity.
export const layer = Layer.succeed(AnalyticsService, {
  record: Effect.fn("AnalyticsService.record")(() => Effect.succeed(false)),
  flush: Effect.void,
});
