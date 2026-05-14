"use client";

import Link from "next/link";
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
        router.push("/");
        router.refresh();
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-50">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40 md:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden bg-zinc-100 p-10 text-zinc-950 md:block">
          <div className="absolute right-8 top-8 h-20 w-20 rounded-full border-[18px] border-zinc-950" />
          <div className="flex h-full flex-col justify-end gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-zinc-500">
              Sessão segura
            </p>
            <h1 className="max-w-sm text-5xl font-black leading-none tracking-tight">
              Entre para continuar sua garagem digital.
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 sm:p-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-400">
              Login
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Acesse sua conta</h2>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-200">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-white/40"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-200">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-white/40"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="rounded-2xl bg-white px-5 py-3 font-bold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || isPending ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-zinc-400">
            Ainda não tem conta?{" "}
            <Link className="font-semibold text-white underline-offset-4 hover:underline" href="/register">
              Criar cadastro
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
