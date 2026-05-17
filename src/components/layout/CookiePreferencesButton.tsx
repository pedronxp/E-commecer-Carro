"use client";

import { openCookiePreferences } from "@/lib/cookie-consent";

export function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={`font-semibold underline transition hover:text-emerald-800 ${className}`}
    >
      Revisar preferências de cookies
    </button>
  );
}
