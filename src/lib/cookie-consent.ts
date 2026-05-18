export const STORAGE_KEY = "lima-cookie-consent";
export const COOKIE_NAME = "lima_cookie_consent";
export const CONSENT_VERSION = 1;
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type CookiePreferences = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

/** Tolerant parser: never throws, never returns partial data. */
export function readConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Try reading from cookie as fallback
      const cookie = parseCookie(document.cookie, COOKIE_NAME);
      if (!cookie) return null;
      return parsePreferences(cookie);
    }
    return parsePreferences(raw);
  } catch {
    return null;
  }
}

export function writeConsent(preferences: {
  analytics: boolean;
  marketing: boolean;
}): CookiePreferences {
  const payload: CookiePreferences = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    acceptedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  writeConsentCookie(payload);
  window.dispatchEvent(
    new CustomEvent("lima:cookie-consent-updated", { detail: payload }),
  );
  return payload;
}

/** Dispatch the event that opens the cookie preferences panel. */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event("lima:open-cookie-preferences"));
}

function parsePreferences(raw: string): CookiePreferences | null {
  const parsed: unknown = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;

  if (obj.necessary !== true) return null;
  if (typeof obj.version !== "number" || obj.version < 1) return null;
  if (typeof obj.analytics !== "boolean") return null;
  if (typeof obj.marketing !== "boolean") return null;
  if (typeof obj.acceptedAt !== "string" || !obj.acceptedAt) return null;

  return {
    version: obj.version,
    necessary: true,
    analytics: obj.analytics,
    marketing: obj.marketing,
    acceptedAt: obj.acceptedAt,
  };
}

function parseCookie(raw: string, name: string): string | null {
  const match = raw.match(new RegExp(`(?:^|;\\s*)${escapeRegex(name)}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function writeConsentCookie(payload: CookiePreferences): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
