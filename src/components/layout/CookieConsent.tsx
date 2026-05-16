"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "lima-cookie-consent";
const COOKIE_NAME = "lima_cookie_consent";
const CONSENT_VERSION = 1;
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type CookiePreferences = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = readConsent();
      if (!saved || saved.version !== CONSENT_VERSION) {
        setVisible(true);
        return;
      }

      setAnalytics(saved.analytics);
      setMarketing(saved.marketing);
    }, 0);

    function openPreferences() {
      const saved = readConsent();
      setAnalytics(saved?.analytics ?? false);
      setMarketing(saved?.marketing ?? false);
      setCustomizing(true);
      setVisible(true);
    }

    window.addEventListener("lima:open-cookie-preferences", openPreferences);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("lima:open-cookie-preferences", openPreferences);
    };
  }, []);

  function save(preferences: { analytics: boolean; marketing: boolean }) {
    const payload: CookiePreferences = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      acceptedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("lima:cookie-consent-updated", { detail: payload }));
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) return null;

  return (
    <section className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-3 shadow-2xl sm:inset-x-4 sm:bottom-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-slate-950">Preferências de cookies</p>
          <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
            Usamos cookies necessários para segurança, sessão e funcionamento do site. Cookies opcionais de métricas e
            marketing só serão usados se você permitir.
            <Link href="/lgpd" className="ml-1 font-semibold text-emerald-700 hover:text-emerald-800">
              Ver LGPD.
            </Link>
          </p>

          {customizing ? (
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <CookieOption
                title="Necessários"
                description="Sessão, segurança, formulários e preferências básicas. Sempre ativos."
                checked
                disabled
                onChange={() => undefined}
              />
              <CookieOption
                title="Métricas"
                description="Ajudam a entender navegação e páginas acessadas sem liberar contato."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CookieOption
                title="Marketing"
                description="Reservado para campanhas quando houver integração ativa."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          ) : null}
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:min-w-56 lg:grid-cols-1">
          {customizing ? (
            <>
              <button
                type="button"
                onClick={() => save({ analytics, marketing })}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Salvar preferências
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Recusar opcionais
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => save({ analytics: true, marketing: true })}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Aceitar todos
              </button>
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Personalizar
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Somente necessários
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function CookieOption({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <span className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span>
          <span className="block font-semibold text-slate-950">{title}</span>
          <span className="mt-1 block leading-5 text-slate-600">{description}</span>
        </span>
      </span>
    </label>
  );
}

function readConsent(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    if (parsed.necessary !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}
