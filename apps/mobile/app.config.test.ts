import { afterEach, expect, it, vi } from "vite-plus/test";

import manifest from "./package.json";
import appleAppSiteAssociation from "../web/public/.well-known/apple-app-site-association.json";
import assetLinks from "../web/public/.well-known/assetlinks.json";

// Keep config parsing independent of local env files and build credentials.
vi.mock("../../scripts/lib/public-config.ts", () => ({
  loadRepoEnv: () => ({
    ...process.env,
    T3CODE_RELAY_URL: "https://relay.example.test",
    EXPO_PUBLIC_OTLP_TRACES_TOKEN: "test-token",
  }),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

async function loadConfig(variant: string | undefined) {
  vi.resetModules();
  vi.stubEnv("APP_VARIANT", variant);
  return (await import("./app.config.ts")).default;
}

it.each(["prod", ""])("rejects APP_VARIANT=%j before selecting production IDs", async (value) => {
  await expect(loadConfig(value)).rejects.toThrow(
    "APP_VARIANT must be development, preview, or production.",
  );
});

it.each([
  [undefined, "io.github.backeyshy.t3remix"],
  ["development", "io.github.backeyshy.t3remix.dev"],
  ["preview", "io.github.backeyshy.t3remix.preview"],
  ["production", "io.github.backeyshy.t3remix"],
])("keeps the iOS and Android identifiers for APP_VARIANT=%j", async (value, identifier) => {
  const config = await loadConfig(value);
  expect(config.ios?.bundleIdentifier).toBe(identifier);
  expect(config.android?.package).toBe(identifier);
  expect(config.ios?.appleTeamId).toBeUndefined();
  expect(config.ios?.associatedDomains).toEqual([]);
  expect(config.android?.intentFilters).toEqual([]);
  expect(config.owner).toBeUndefined();
  expect(config.extra?.eas).toBeUndefined();
  expect(appleAppSiteAssociation.applinks.details).toEqual([]);
  expect(assetLinks).toEqual([]);
});

it("associates only the configured private host and signing identity", async () => {
  vi.stubEnv("T3CODE_HOSTED_APP_URL", "https://work.example.test");
  vi.stubEnv("T3CODE_IOS_TEAM_ID", "MYTEAM1234");
  vi.stubEnv("T3CODE_EAS_PROJECT_ID", "my-project");
  const config = await loadConfig("production");
  expect(config.ios?.associatedDomains).toEqual(["applinks:work.example.test"]);
  expect(config.android?.intentFilters?.[0]?.data).toEqual([
    { scheme: "https", host: "work.example.test", pathPrefix: "/threads/" },
  ]);
  expect(config.extra?.eas).toEqual({ projectId: "my-project" });
  expect(config.ios?.appleTeamId).toBe("MYTEAM1234");
});

it.each([
  ["T3CODE_ANDROID_PACKAGE", "com.t3tools.t3code.dev"],
  ["T3CODE_IOS_BUNDLE_ID", "com.t3tools.t3code"],
  ["T3CODE_IOS_TEAM_ID", "ARK85ZXQ4Z"],
  ["T3CODE_EAS_PROJECT_ID", "d763fcb8-d37c-41ea-a773-b54a0ab4a454"],
  ["T3CODE_EAS_OWNER", "pingdotgg"],
])("rejects an inherited upstream identity in %s", async (key, value) => {
  vi.stubEnv(key, value);
  await expect(loadConfig("development")).rejects.toThrow("your own native app");
});

it("ignores a former hosted domain", async () => {
  vi.stubEnv("T3CODE_HOSTED_APP_URL", "https://app.t3.codes");
  expect((await loadConfig("preview")).ios?.associatedDomains).toEqual([]);
});

it("excludes vendor diagnostics and upstream OTA updates in a relay-enabled build", async () => {
  const config = await loadConfig("production");
  expect(manifest.dependencies).not.toHaveProperty("expo-observe");
  expect(config.extra?.eas).toBeUndefined();
  expect(config.extra).not.toHaveProperty("observability");
  expect(config.updates?.enabled).toBe(false);
});
