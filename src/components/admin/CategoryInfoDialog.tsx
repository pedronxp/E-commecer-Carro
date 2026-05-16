"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-category-info-seen";

export function CategoryInfoDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOpen(window.localStorage.getItem(STORAGE_KEY) !== "true");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Como usar</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Categorias organizam a vitrine</h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <p>
            Use categorias como segmento comercial: Sedan, Hatch, SUV, Picape, Moto e Bike elétrica. Elas aparecem nos filtros e ajudam o cliente a encontrar o veículo certo.
          </p>
          <p>
            Marcas são fabricantes. Categorias são agrupamentos da vitrine. Um Toyota Corolla usa marca Toyota e categoria Sedan, por exemplo.
          </p>
          <p>
            Categorias com veículos vinculados ficam protegidas contra exclusão para evitar quebrar o catálogo.
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Entendi
        </button>
      </section>
    </div>
  );
}
