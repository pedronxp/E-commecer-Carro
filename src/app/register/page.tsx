"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function RegisterPage() {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Não foi possível criar sua conta.");
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
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-12 text-zinc-950">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/40 md:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 sm:p-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              Cadastro
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Crie sua conta
            </h1>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Nome
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-zinc-950"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="rounded-2xl bg-zinc-950 px-5 py-3 font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || isPending ? "Criando..." : "Criar conta"}
          </button>

          <p className="text-sm text-zinc-500">
            Já tem conta?{" "}
            <Link className="font-semibold text-zinc-950 underline-offset-4 hover:underline" href="/login">
              Fazer login
            </Link>
          </p>
        </form>

        <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white md:block">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[36px] border-white/10" />
          <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full bg-white" />
          <div className="flex h-full flex-col justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-zinc-500">
              E-commerce carro
            </p>
            <h2 className="max-w-xs text-5xl font-black leading-none tracking-tight">
              Uma sessão para favoritos, carrinho e compras.
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}
