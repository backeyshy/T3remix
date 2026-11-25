import type { ToolActivityIcon } from "@t3tools/contracts";

function inlineRasterImage(value: string | null | undefined): string | null {
  return value && /^data:image\/(?:png|jpeg|gif|webp|x-icon);base64,[A-Za-z0-9+/]+=*$/i.test(value)
    ? value
    : null;
}

export function toolActivityFaviconUrl(
  icon: Extract<ToolActivityIcon, { _tag: "website" | "themed-logo" }>,
  appearance: "light" | "dark",
): string | null {
  const light = icon._tag === "website" ? icon.faviconUrl : icon.logoUrl;
  const dark = icon._tag === "website" ? icon.faviconUrlDark : icon.logoUrlDark;
  return (appearance === "dark" ? inlineRasterImage(dark) : null) ?? inlineRasterImage(light);
}
