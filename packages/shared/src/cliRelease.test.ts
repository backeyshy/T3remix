import { describe, expect, it } from "vite-plus/test";

import { isSelfHostedSource, cliArchiveTarCommand, parseChecksums } from "./cliRelease.ts";

describe("cliRelease", () => {
  it("accepts local and fork sources and blocks upstream distributions", () => {
    for (const source of [
      "https://app.t3.codes",
      "https://raw.githubusercontent.com/PingDotGG/t3code/main/file",
      "https://registry.npmjs.org/t3/latest",
      "https://api.github.com/repos/pingdotgg/t3code/releases",
    ]) {
      expect(isSelfHostedSource(source)).toBe(false);
    }
    expect(isSelfHostedSource("https://github.com/backeyshy/T3remix")).toBe(true);
    expect(isSelfHostedSource("http://localhost:8000/t3/releases")).toBe(true);
  });

  it("parses sha256sum output including binary-mode markers", () => {
    const checksums = parseChecksums(
      [
        `${"a".repeat(64)}  t3-1.2.3-linux-x64.tar.gz`,
        `${"B".repeat(64)} *t3-1.2.3-win32-x64.zip`,
        "not a checksum line",
        "",
      ].join("\n"),
    );
    expect(checksums.get("t3-1.2.3-linux-x64.tar.gz")).toBe("a".repeat(64));
    expect(checksums.get("t3-1.2.3-win32-x64.zip")).toBe("b".repeat(64));
    expect(checksums.size).toBe(2);
  });

  it("extracts with the System32 bsdtar on Windows and plain tar elsewhere", () => {
    expect(cliArchiveTarCommand("linux", {})).toBe("tar");
    expect(cliArchiveTarCommand("win32", { SystemRoot: "D:\\Win" })).toBe(
      "D:\\Win\\System32\\tar.exe",
    );
    expect(cliArchiveTarCommand("win32", {})).toBe("C:\\Windows\\System32\\tar.exe");
  });
});
