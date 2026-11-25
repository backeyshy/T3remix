export const LEGAL_URL = "https://github.com/backeyshy/T3remix/blob/main/LICENSE";

function webDocumentIdentity(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin}${pathname}`;
  } catch {
    return null;
  }
}

export function isLegalDocumentUrl(value: string): boolean {
  return webDocumentIdentity(value) === LEGAL_URL;
}
