import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { resolveDesktopPairingUrl, resolveHostedPairingUrl } from "./pairingUrls";

describe("settings pairing URL helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses direct backend pairing URLs for HTTP endpoints", () => {
    expect(resolveHostedPairingUrl("http://192.168.1.44:3773", "PAIRCODE")).toBeNull();
    expect(resolveDesktopPairingUrl("http://192.168.1.44:3773", "PAIRCODE")).toBe(
      "http://192.168.1.44:3773/pair#token=PAIRCODE",
    );
  });

  it.each(["", "https://app.t3.codes"])(
    "keeps direct pairing without an operator's hosted app",
    (value) => {
      vi.stubEnv("VITE_HOSTED_APP_URL", value);
      expect(resolveHostedPairingUrl("https://host.example.test", "PAIRCODE")).toBeNull();
    },
  );

  it("uses hosted pairing URLs for HTTPS endpoints", () => {
    vi.stubEnv("VITE_HOSTED_APP_URL", "https://web.example.test");

    expect(resolveHostedPairingUrl("https://host.tailnet.example.ts.net:3773", "PAIRCODE")).toBe(
      "https://web.example.test/pair?host=https%3A%2F%2Fhost.tailnet.example.ts.net%3A3773#token=PAIRCODE",
    );
  });
});
