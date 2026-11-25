import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as NpmRelease from "./npmRelease.ts";

it.effect("reports no public npm release without network or process services", () =>
  Effect.gen(function* () {
    const service = yield* NpmRelease.make();
    expect(yield* service.get({ spec: "latest" })).toBeNull();
  }),
);
