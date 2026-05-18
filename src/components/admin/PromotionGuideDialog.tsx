"use client";

import { ArrowLeft, ArrowRight, HelpCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const guideSteps = [
  {
    title: "1. Filtros do estoque",
    body: "Recalcula somente KPIs e lista de veículos cadastrados.",
  },
  {
    title: "2. Comparativo avulso",
    body: "Digite o modelo, selecione a sugestão e clique em Comparar.",
  },
  {
    title: "3. Custo e FIPE",
    body: "Custo é o valor pago. Preço atual FIPE vem da sugestão.",
  },
  {
    title: "4. Ler a decisão",
    body: "Confira FIPE ajustada, preço sugerido, lucro, margem, fonte e match.",
  },
  {
    title: "5. Comparativo do estoque",
    body: "Compare venda atual, preço sugerido, custo, margem e desconto contra FIPE.",
  },
] as const;

export function PromotionGuideDialog() {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = guideSteps[activeStep] ?? guideSteps[0];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem("admin-promotions-guide-seen") !== "true") {
          setOpen(true);
        }
      } catch {
        // Local storage can be blocked by the browser; keep the guide closed in that case.
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function closeDialog() {
    try {
      window.localStorage.setItem("admin-promotions-guide-seen", "true");
    } catch {
      // Local storage can be blocked by the browser; closing the dialog should still work.
    }
    setOpen(false);
  }

  function goToPrevious() {
    setActiveStep((step) => Math.max(0, step - 1));
  }

  function goToNext() {
    if (activeStep === guideSteps.length - 1) {
      closeDialog();
      return;
    }
    setActiveStep((step) => Math.min(guideSteps.length - 1, step + 1));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
      >
        <HelpCircle className="h-4 w-4" />
        Como usar
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotions-guide-title"
        >
          <div className="my-4 grid max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
            <div className="overflow-y-auto border-b border-slate-200 p-4 sm:p-5 lg:max-h-[calc(100vh-2rem)] lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Guia rápido</p>
                  <h2 id="promotions-guide-title" className="mt-2 text-2xl font-black text-slate-950">
                    Comparativo FIPE
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A página separa dois caminhos: filtros do estoque cadastrado e simulação avulsa antes de criar um cadastro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  aria-label="Fechar guia"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {guideSteps.map((step, index) => {
                  const selected = index === activeStep;

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition ${
                        selected
                          ? "border-emerald-300 bg-emerald-50 text-slate-950"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          selected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{step.title}</span>
                        <span className="mt-1 block text-xs leading-5">{step.body}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-[340px] flex-col bg-slate-50 p-4 sm:p-5 lg:max-h-[calc(100vh-2rem)] lg:min-h-0 lg:overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{currentStep.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{currentStep.body}</p>
              </div>

              <div className="min-h-0 flex-1">
                <GuideIllustration activeStep={activeStep} />
              </div>

              <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 pt-4">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={activeStep === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </button>
                <div className="flex items-center gap-1.5">
                  {guideSteps.map((step, index) => (
                    <span
                      key={step.title}
                      className={`h-2 rounded-full transition-all ${index === activeStep ? "w-7 bg-emerald-700" : "w-2 bg-slate-300"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {activeStep === guideSteps.length - 1 ? "Entendi" : "Próximo"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GuideIllustration({ activeStep }: { activeStep: number }) {
  const active = (step: number) => activeStep === step;

  return (
    <svg
      className="mt-4 h-auto max-h-[240px] w-full lg:max-h-[330px]"
      viewBox="0 0 560 360"
      role="img"
      aria-label="Demonstracao visual do fluxo de comparacao FIPE"
    >
      <rect x="18" y="22" width="524" height="316" rx="20" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="44" y="48" width="472" height="58" rx="14" fill={active(0) ? "#ecfdf5" : "#f8fafc"} stroke={active(0) ? "#10b981" : "#cbd5e1"} strokeWidth="2" />
      <rect x="66" y="67" width="116" height="20" rx="6" fill={active(0) ? "#047857" : "#cbd5e1"} />
      <rect x="202" y="67" width="116" height="20" rx="6" fill={active(0) ? "#0f766e" : "#cbd5e1"} />
      <rect x="338" y="67" width="116" height="20" rx="6" fill={active(0) ? "#065f46" : "#cbd5e1"} />
      <text x="78" y="82" fill="#ffffff" fontSize="11" fontWeight="800">Visao</text>
      <text x="214" y="82" fill="#ffffff" fontSize="11" fontWeight="800">Estado</text>
      <text x="350" y="82" fill="#ffffff" fontSize="11" fontWeight="800">Margem</text>

      <rect x="44" y="130" width="224" height="118" rx="14" fill={active(1) || active(2) ? "#ecfdf5" : "#f8fafc"} stroke={active(1) || active(2) ? "#10b981" : "#cbd5e1"} strokeWidth="2" />
      <text x="66" y="154" fill="#0f172a" fontSize="13" fontWeight="800">Comparar sem cadastrar</text>
      <rect x="66" y="170" width="164" height="20" rx="6" fill={active(1) ? "#047857" : "#cbd5e1"} />
      <text x="78" y="184" fill="#ffffff" fontSize="10" fontWeight="800">Honda Civic...</text>
      <rect x="66" y="197" width="78" height="16" rx="5" fill={active(2) ? "#0f766e" : "#cbd5e1"} />
      <rect x="154" y="197" width="76" height="16" rx="5" fill={active(2) ? "#0f766e" : "#cbd5e1"} />
      <text x="74" y="209" fill="#ffffff" fontSize="9" fontWeight="800">Custo</text>
      <text x="164" y="209" fill="#ffffff" fontSize="9" fontWeight="800">Preco</text>
      <rect x="66" y="224" width="74" height="14" rx="7" fill={active(1) ? "#d1fae5" : "#e2e8f0"} />
      <rect x="150" y="224" width="90" height="14" rx="7" fill={active(1) ? "#d1fae5" : "#e2e8f0"} />

      <path d="M286 190h42" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
      <path d="m324 178 14 12-14 12" fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="358" y="130" width="158" height="118" rx="14" fill={active(3) ? "#ecfdf5" : "#f8fafc"} stroke={active(3) ? "#10b981" : "#cbd5e1"} strokeWidth="2" />
      <text x="380" y="154" fill="#0f172a" fontSize="13" fontWeight="800">Decisao</text>
      <text x="380" y="184" fill="#047857" fontSize="24" fontWeight="900">R$ X</text>
      <rect x="380" y="204" width="98" height="12" rx="4" fill="#cbd5e1" />
      <rect x="380" y="224" width="72" height="12" rx="4" fill="#cbd5e1" />

      <rect x="86" y="276" width="388" height="28" rx="14" fill={active(4) ? "#047857" : "#e2e8f0"} />
      <rect x="114" y="284" width="74" height="12" rx="6" fill="#ffffff" opacity={active(4) ? "1" : "0.65"} />
      <rect x="204" y="284" width="74" height="12" rx="6" fill="#ffffff" opacity={active(4) ? "1" : "0.65"} />
      <rect x="294" y="284" width="74" height="12" rx="6" fill="#ffffff" opacity={active(4) ? "1" : "0.65"} />
      <text x="194" y="326" fill="#475569" fontSize="12" fontWeight="800">Estoque cadastrado</text>
    </svg>
  );
}
