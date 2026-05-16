"use client";

import { Camera, Clock3, Eye, EyeOff, LocateFixed, LogOut, Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AdminOperatorStatusProps = {
  user: {
    name: string;
    email: string;
  };
  ipAddress: string;
  city: string;
  onLogout: () => void;
};

export function AdminOperatorStatus({
  user,
  ipAddress,
  city,
  onLogout,
}: AdminOperatorStatusProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [identityVisible, setIdentityVisible] = useState(false);
  const [time, setTime] = useState("Horário");
  const [locationLabel, setLocationLabel] = useState(sanitizeLocation(city));
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAvatar(window.localStorage.getItem("admin-avatar"));
      setIdentityVisible(window.localStorage.getItem("admin-identity-visible") === "true");
      setTime(formatTime(new Date()));
    }, 0);

    const interval = window.setInterval(() => setTime(formatTime(new Date())), 30000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (result) {
        window.localStorage.setItem("admin-avatar", result);
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function toggleIdentity() {
    setIdentityVisible((current) => {
      const next = !current;
      window.localStorage.setItem("admin-identity-visible", String(next));
      return next;
    });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationLabel("Localização indisponível");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
          );
          const data = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
              county?: string;
              state?: string;
              state_code?: string;
            };
          };
          const address = data.address ?? {};
          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "Cidade detectada";
          const stateName = address.state_code || address.state || "";
          setLocationLabel(stateName ? `${cityName}, ${stateName}` : cityName);
        } catch {
          setLocationLabel("Localização permitida");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLabel(sanitizeLocation(city));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <>
      <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden max-w-[46vw] -translate-x-1/2 -translate-y-1/2 items-center gap-2 overflow-hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 shadow-sm md:flex xl:gap-3">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
          {time}
        </span>
        <button
          type="button"
          onClick={requestLocation}
          className="inline-flex items-center gap-1.5 text-left transition hover:text-emerald-700"
          title="Mostrar cidade e estado deste navegador"
        >
          <LocateFixed className="h-3.5 w-3.5 text-emerald-600" />
          <span className="max-w-28 truncate xl:max-w-36">{locationLoading ? "Localizando..." : locationLabel}</span>
        </button>
        <span className="inline-flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5 text-emerald-600" />
          <span className="max-w-28 truncate">{ipAddress}</span>
        </span>
      </div>

      <div className="ml-auto flex items-center justify-end gap-3">
        <div className="hidden text-right xl:block">
          <p className="text-sm font-semibold text-slate-950">{identityVisible ? user.name : "Operador"}</p>
          <p className="text-xs text-slate-500">{identityVisible ? user.email : maskEmail(user.email)}</p>
        </div>
        <button
          type="button"
          onClick={toggleIdentity}
          className="hidden rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 xl:inline-flex"
          title={identityVisible ? "Ocultar dados do operador" : "Mostrar dados do operador"}
        >
          {identityVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-emerald-50 text-sm font-semibold text-emerald-700"
          title="Adicionar foto do operador"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex h-4 items-center justify-center bg-slate-950/70 opacity-0 transition group-hover:opacity-100">
            <Camera className="h-3 w-3 text-white" />
          </span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

        <button
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function sanitizeLocation(value: string): string {
  const normalized = value?.trim();
  if (!normalized || normalized.toLowerCase().includes("gps")) {
    return "Localização";
  }

  return normalized;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) {
    return "Email oculto";
  }

  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}
