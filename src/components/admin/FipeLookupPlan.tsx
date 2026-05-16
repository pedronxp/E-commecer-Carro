"use client";

import { ExternalLink, SearchCheck } from "lucide-react";

export function FipeLookupPlan({ vehicleType }: { vehicleType: "CAR" | "MOTORCYCLE" | "ELECTRIC_BIKE" }) {
  const isBike = vehicleType === "ELECTRIC_BIKE";

  return (
    <section className={isBike ? "rounded-xl border border-amber-200 bg-amber-50 p-4" : "rounded-xl border border-sky-200 bg-sky-50 p-4"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <SearchCheck className={isBike ? "mt-0.5 h-5 w-5 text-amber-700" : "mt-0.5 h-5 w-5 text-sky-700"} />
          <div>
            <h2 className="font-semibold text-slate-950">{isBike ? "Referência manual para bike" : "Consulta FIPE assistida"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isBike
                ? "Bike elétrica não entra no fluxo FIPE de carros e motos. Informe uma referência manual baseada em compra, estado e mercado local."
                : "O painel usa FipeX como sugestão automática por texto e mantém a FIPE oficial como conferência antes de fechar o preço."}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {isBike
                ? "O valor manual continua servindo para comparativo comercial, promoção e margem, mas não será preenchido automaticamente."
                : "Pesquisa bruta: FipeX e Fipe Online/Parallelum estavam em maio/2026 no teste. A FipeX foi escolhida aqui porque busca por nome livre e devolve preço recente em uma chamada; a Fipe Online segue útil para consulta hierárquica ou conferência."}
            </p>
          </div>
        </div>
        {!isBike ? (
          <a
            href="https://veiculos.fipe.org.br/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            Abrir FIPE oficial
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
