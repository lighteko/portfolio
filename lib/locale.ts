import { headers } from "next/headers";

export type UiLocale = "ko" | "en";

function parsePrimaryLanguage(acceptLanguage: string): string {
  const primary = acceptLanguage
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)[0];

  if (!primary) {
    return "";
  }

  return primary.split(";")[0] ?? "";
}

export async function getUserLocale(): Promise<UiLocale> {
  const headerStore = await Promise.resolve(headers());
  const acceptLanguage = headerStore.get("accept-language") ?? "";
  const primaryLanguage = parsePrimaryLanguage(acceptLanguage);

  if (primaryLanguage.startsWith("ko")) {
    return "ko";
  }

  return "en";
}

