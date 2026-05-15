"use client";

import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-white shadow-xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="login-admin-panel relative hidden overflow-hidden bg-secondary p-10 text-white md:flex md:min-h-[520px] md:flex-col">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-primary shadow-lg shadow-primary/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Lima Automóveis</p>
              <p className="text-xs text-muted-light">Painel administrativo</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center pb-16">
            <div className="login-copy-panel max-w-sm">
              <p className="text-sm font-semibold uppercase text-primary-light">
                Acesso restrito
              </p>
              <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-white">
                Gestão da vitrine e do estoque.
              </h1>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                Entre com uma conta administrativa para cadastrar veículos, ajustar catálogo e acompanhar a operação.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 sm:p-10">
          <div>
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Lima Automóveis</p>
                <p className="text-xs text-muted">Painel administrativo</p>
              </div>
            </div>
            <p className="text-sm font-semibold uppercase text-primary">
              Acesso administrativo
            </p>
            <h2 className="mt-3 text-3xl font-bold text-secondary">Entrar no painel</h2>
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
              className="rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-secondary">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
            className="group relative overflow-hidden rounded-lg bg-primary px-5 py-3 font-bold text-white shadow-md shadow-primary/20 transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/15 transition duration-500 group-hover:translate-x-full" />
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
