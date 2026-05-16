"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

const loginMessages = [
  "Para melhor visualização do painel, use notebook ou computador desktop.",
  "Gerencie estoque, vitrine, promoções e contatos em uma área restrita.",
  "Acesso exclusivo para operadores autorizados da Lima Automóveis.",
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loginMessages.length);
    }, 3800);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Não foi possível fazer login.");
        return;
      }

      startTransition(() => {
        router.push("/admin");
        router.refresh();
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-3 py-6 text-foreground sm:px-6 lg:py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-white shadow-xl lg:grid-cols-[0.82fr_1fr]">
        <div className="login-admin-panel relative hidden overflow-hidden bg-secondary p-8 text-white lg:flex lg:min-h-[520px] lg:flex-col xl:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_15%,rgba(16,185,129,0.28),transparent_28%),radial-gradient(circle_at_78%_82%,rgba(14,165,233,0.18),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-primary shadow-lg shadow-primary/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Lima Automóveis</p>
              <p className="text-xs text-muted-light">Painel administrativo</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center pb-10">
            <div className="login-copy-panel max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">
                Acesso restrito
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
                Gestão da vitrine e do estoque.
              </h1>
              <p className="mt-5 min-h-12 text-sm leading-6 text-slate-300 transition" aria-live="polite">
                {loginMessages[messageIndex]}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-[min(640px,100dvh-48px)] flex-col justify-center gap-5 p-5 sm:p-8 lg:min-h-[520px] lg:p-10">
          <div>
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Lima Automóveis</p>
                <p className="text-xs text-muted">Painel administrativo</p>
              </div>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Acesso administrativo
            </p>
            <h2 className="mt-3 text-2xl font-bold text-secondary sm:text-3xl">Entrar no painel</h2>
            <p className="mt-2 text-sm text-muted">
              Use suas credenciais autorizadas para acessar a gestão da loja.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-secondary">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass(email)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-secondary">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass(password)}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="group relative overflow-hidden rounded-xl bg-secondary px-5 py-3 font-bold text-white shadow-lg shadow-secondary/15 ring-1 ring-secondary/10 transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-primary/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/25 blur-xl transition duration-700 group-hover:translate-x-[360%]" />
            <span className="absolute inset-0 opacity-0 ring-2 ring-primary/35 transition group-hover:opacity-100" />
            <span className="relative inline-flex items-center justify-center gap-2">
              {isSubmitting || isPending ? "Entrando..." : "Entrar"}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>
        </form>
      </section>
    </main>
  );
}

function inputClass(value: string): string {
  const active = value.trim().length > 0;

  return [
    "rounded-xl border bg-white px-4 py-3 text-base text-foreground outline-none transition duration-200",
    "focus:-translate-y-0.5 focus:border-primary focus:shadow-lg focus:shadow-primary/10 focus:ring-2 focus:ring-primary/15",
    active ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border",
  ].join(" ");
}
