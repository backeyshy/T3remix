import { describe, expect, it } from "@effect/vitest";

import { toolActivityFaviconUrl } from "./favicon.ts";

describe("tool history image privacy", () => {
  it.each([
    "http://localhost/private",
    "https://example.com/icon",
    "//example.com/icon",
    "data:image/svg+xml;base64,PHN2Zz4=",
  ])("uses a local glyph instead of loading %s", (url) => {
    for (const appearance of ["light", "dark"] as const) {
      const website = {
        _tag: "website",
        pageUrl: url,
        faviconUrl: url,
        faviconUrlDark: url,
      } as const;
      expect(toolActivityFaviconUrl(website, appearance)).toBeNull();
      expect(
        toolActivityFaviconUrl({ _tag: "themed-logo", logoUrl: url, logoUrlDark: url }, appearance),
      ).toBeNull();
    }
  });

  it("uses an inline raster icon when the dark icon requires a request", () => {
    const inline = "data:image/png;base64,aWNvbg==";
    expect(
      toolActivityFaviconUrl(
        {
          _tag: "website",
          pageUrl: "https://example.com",
          faviconUrl: inline,
          faviconUrlDark: "https://example.com/dark",
        },
        "dark",
      ),
    ).toBe(inline);
  });
});
