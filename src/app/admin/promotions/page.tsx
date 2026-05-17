export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { BadgePercent, Calculator, Database, Filter, Globe2, PlusCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { findFipexEstimate } from "@/lib/fipe-provider";
import { prisma } from "@/lib/prisma";

const conditionAdjustments = {
  excellent: { label: "Excelente", factor: 1.03 },
  good: { label: "Bom", factor: 1 },
  attention: { label: "Com detalhes", factor: 0.95 },
  repair: { label: "Precisa reparos", factor: 0.9 },
} as const;

type SearchParams = {
  view?: string;
  condition?: keyof typeof conditionAdjustments;
  targetMargin?: string;
  compareTitle?: string;
  compareYear?: string;
  compareType?: string;
  compareCost?: string;
  compareSalePrice?: string;
};

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = params.view ?? "all";
  const conditionKey = params.condition && params.condition in conditionAdjustments ? params.condition : "good";
  const targetMargin = Number(params.targetMargin || 12);
  const condition = conditionAdjustments[conditionKey];
  const compareTitle = String(params.compareTitle || "").trim();
  const compareYear = Number(params.compareYear || "");
  const compareType = params.compareType === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR";
  const compareCost = parseMoneyParam(params.compareCost);
  const compareSalePrice = parseMoneyParam(params.compareSalePrice);

  const [vehicles, standaloneFipe] = await Promise.all([
    prisma.car.findMany({
      orderBy: { updatedAt: "desc" },
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    compareTitle
      ? findFipexEstimate({
          title: compareTitle,
          year: Number.isFinite(compareYear) && compareYear > 0 ? compareYear : undefined,
          vehicleType: compareType,
        })
      : Promise.resolve(null),
  ]);

  const withFipe = vehicles.filter((vehicle) => vehicle.fipePrice);
  const withMargin = vehicles.filter((vehicle) => vehicle.purchasePrice);
  const rows = vehicles
    .map((vehicle) => {
      const stateAdjustedFipe = vehicle.fipePrice ? vehicle.fipePrice * condition.factor : null;
      const suggestedByFipe = stateAdjustedFipe ? stateAdjustedFipe * 0.95 : null;
      const suggestedByMargin = vehicle.purchasePrice ? vehicle.purchasePrice * (1 + targetMargin / 100) : null;
      const suggestedPrice = Math.round(Math.max(suggestedByFipe ?? 0, suggestedByMargin ?? 0, vehicle.price));
      const grossMargin = vehicle.purchasePrice ? suggestedPrice - vehicle.purchasePrice : null;
      const marginPercent = grossMargin && suggestedPrice > 0 ? Math.round((grossMargin / suggestedPrice) * 100) : null;
      const discount =
        stateAdjustedFipe && stateAdjustedFipe > suggestedPrice
          ? Math.round(((stateAdjustedFipe - suggestedPrice) / stateAdjustedFipe) * 100)
          : 0;

      return {
        vehicle,
        stateAdjustedFipe,
        suggestedPrice,
        grossMargin,
        marginPercent,
        discount,
      };
    })
    .filter((row) => {
      if (view === "below-fipe") return row.discount > 0;
      if (view === "with-margin") return row.grossMargin !== null;
      if (view === "risk") return row.marginPercent !== null && row.marginPercent < targetMargin;
      if (view === "without-fipe") return !row.stateAdjustedFipe;
      return true;
    });
  const avgSuggestedMargin = average(
    rows
      .map((row) => row.marginPercent)
      .filter((value): value is number => value !== null),
  );
  const standaloneAdjustedFipe = standaloneFipe ? standaloneFipe.price * condition.factor : null;
  const standaloneSuggestedByFipe = standaloneAdjustedFipe ? standaloneAdjustedFipe * 0.95 : null;
  const standaloneSuggestedByMargin = compareCost ? compareCost * (1 + targetMargin / 100) : null;
  const standaloneSuggestedPrice =
    standaloneAdjustedFipe || standaloneSuggestedByMargin || compareSalePrice
      ? Math.round(Math.max(standaloneSuggestedByFipe ?? 0, standaloneSuggestedByMargin ?? 0, compareSalePrice ?? 0))
      : null;
  const standaloneMargin =
    standaloneSuggestedPrice && compareCost ? standaloneSuggestedPrice - compareCost : null;
  const standaloneMarginPercent =
    standaloneSuggestedPrice && standaloneMargin !== null
      ? Math.round((standaloneMargin / standaloneSuggestedPrice) * 100)
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Precificação</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Comparativo FIPE e margem</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Compare FIPE atual, estado de conservação, preço de venda, custo e margem desejada para escolher o melhor valor de anúncio.
            </p>
          </div>
          <Link
            href="/admin/cars-new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/15"
          >
            <PlusCircle className="h-4 w-4" />
            Cadastrar veículo
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Database} label="Veículos no estoque" value={vehicles.length} detail="Base interna cadastrada" />
        <MetricCard icon={BadgePercent} label="Com FIPE" value={withFipe.length} detail="Referência para desconto" />
        <MetricCard icon={Calculator} label="Com margem" value={withMargin.length} detail="Custo informado" />
        <MetricCard icon={TrendingUp} label="Margem sugerida" value={avgSuggestedMargin ? `${Math.round(avgSuggestedMargin)}%` : "0%"} detail={`Meta atual: ${targetMargin}%`} />
      </section>

      <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Filter className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div className="flex-1">
            <h2 className="font-semibold text-slate-950">Filtros de precificação</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <SelectFilter
                label="Visão"
                name="view"
                defaultValue={view}
                options={[
                  ["all", "Todos"],
                  ["below-fipe", "Abaixo da FIPE"],
                  ["with-margin", "Com margem"],
                  ["risk", "Risco/prejuízo"],
                  ["without-fipe", "Sem FIPE"],
                ]}
              />
              <SelectFilter
                label="Estado do veículo"
                name="condition"
                defaultValue={conditionKey}
                options={Object.entries(conditionAdjustments).map(([key, value]) => [key, value.label])}
              />
              <SelectFilter
                label="Lucro alvo"
                name="targetMargin"
                defaultValue={String(targetMargin)}
                options={[
                  ["8", "8% conservador"],
                  ["12", "12% padrão"],
                  ["15", "15% agressivo"],
                  ["20", "20% alto"],
                ]}
              />
              <div className="flex items-end">
                <button className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Aplicar
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              A FIPE por estado usa ajuste operacional: excelente +3%, bom sem ajuste, com detalhes -5%, reparos -10%.
            </p>
          </div>
        </div>
      </form>

      <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Calculator className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div className="flex-1">
            <h2 className="font-semibold text-slate-950">Comparar veículo sem cadastrar</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Use esta simulação para consultar FIPE atual, ajustar por estado e estimar preço/lucro antes de criar o veículo no estoque.
            </p>
            <form className="mt-4 grid gap-3 lg:grid-cols-6">
              <input type="hidden" name="view" value={view} />
              <input type="hidden" name="condition" value={conditionKey} />
              <input type="hidden" name="targetMargin" value={String(targetMargin)} />
              <TextFilter label="Modelo" name="compareTitle" defaultValue={compareTitle} placeholder="Ex: Honda Civic 2020" span="lg:col-span-2" />
              <TextFilter label="Ano" name="compareYear" defaultValue={params.compareYear ?? ""} placeholder="Ex: 2020" />
              <SelectFilter
                label="Tipo"
                name="compareType"
                defaultValue={compareType}
                options={[
                  ["CAR", "Carro"],
                  ["MOTORCYCLE", "Moto"],
                ]}
              />
              <TextFilter label="Custo" name="compareCost" defaultValue={params.compareCost ?? ""} placeholder="Ex: 95000" />
              <div className="flex items-end">
                <button className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Comparar
                </button>
              </div>
            </form>

            {compareTitle ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {standaloneFipe && standaloneSuggestedPrice ? (
                  <div className="grid gap-3 text-sm md:grid-cols-6">
                    <PriceBlock label="FIPE atual" value={formatCurrency(standaloneFipe.price)} strong />
                    <PriceBlock label={`FIPE ${condition.label}`} value={formatCurrency(standaloneAdjustedFipe ?? standaloneFipe.price)} />
                    <PriceBlock label="Preço sugerido" value={formatCurrency(standaloneSuggestedPrice)} tone="success" />
                    <PriceBlock
                      label="Lucro bruto"
                      value={standaloneMargin !== null ? `${formatCurrency(standaloneMargin)} · ${standaloneMarginPercent}%` : "Informe custo"}
                      tone={standaloneMarginPercent !== null && standaloneMarginPercent < targetMargin ? "danger" : "success"}
                    />
                    <PriceBlock label="Fonte" value={`${standaloneFipe.provider} - ${standaloneFipe.confidence}`} />
                    <PriceBlock label="Match" value={`${standaloneFipe.referenceMonth} - ${standaloneFipe.title}`} />
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    Não foi possível encontrar FIPE automática para esse texto. Ajuste modelo/ano ou use a consulta oficial como conferência manual.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 text-emerald-700" />
            <div>
              <h2 className="font-semibold text-slate-950">Comparação interna</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Usa veículos já cadastrados para sugerir preço, FIPE e margem. Quanto mais histórico real for cadastrado, melhor fica a recomendação.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex items-start gap-3">
            <Globe2 className="mt-0.5 h-5 w-5 text-sky-700" />
            <div>
              <h2 className="font-semibold text-slate-950">Comparação da internet</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A FIPE oficial não disponibiliza API pública. A próxima etapa para automatizar internet é contratar uma API licenciada/fornecedor homologado; até lá, use consulta oficial manual no cadastro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BadgePercent className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-lg font-semibold text-slate-950">Nenhum veículo cadastrado.</p>
          <p className="mt-2 text-sm text-slate-500">
            Cadastre o primeiro veículo com preço de venda, custo de compra e FIPE para liberar comparativos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map(({ vehicle, stateAdjustedFipe, suggestedPrice, grossMargin, marginPercent, discount }) => {
            return (
              <article key={vehicle.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {vehicle.images[0]?.url ? (
                        <Image src={vehicle.images[0].url} alt="" fill sizes="96px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-950">{vehicle.title}</h2>
                      <p className="text-sm text-slate-500">{vehicle.brand.name} · {vehicle.category?.name} · {vehicle.year}</p>
                      {vehicle.promotionNote ? (
                        <p className="mt-1 text-sm text-slate-600">{vehicle.promotionNote}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 xl:text-right">
                    <PriceBlock label="Venda atual" value={formatCurrency(vehicle.price)} strong />
                    <PriceBlock label="Sugerido" value={formatCurrency(suggestedPrice)} tone="success" />
                    <PriceBlock label="Custo" value={vehicle.purchasePrice ? formatCurrency(vehicle.purchasePrice) : "Não informado"} />
                    <PriceBlock label="Margem" value={grossMargin !== null ? `${formatCurrency(grossMargin)}${marginPercent !== null ? ` · ${marginPercent}%` : ""}` : "Sem custo"} tone={marginPercent !== null && marginPercent < targetMargin ? "danger" : "success"} />
                    <PriceBlock label={`FIPE ${condition.label}`} value={stateAdjustedFipe ? formatCurrency(stateAdjustedFipe) : "Não informado"} />
                    <PriceBlock label="Comparativo" value={discount > 0 ? `${discount}% abaixo` : "Sem desconto"} tone={discount > 0 ? "success" : "muted"} />
                    <PriceBlock label="Fonte FIPE" value={vehicle.fipePrice ? "Cadastro/manual" : "Fallback manual"} tone={vehicle.fipePrice ? "muted" : "danger"} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SelectFilter({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<[string, string]>;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextFilter({
  label,
  name,
  defaultValue,
  placeholder,
  span,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  span?: string;
}) {
  return (
    <label className={`text-sm font-medium text-slate-700 ${span ?? ""}`}>
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function PriceBlock({
  label,
  value,
  strong,
  tone = "default",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "default" | "success" | "danger" | "muted";
}) {
  const toneClass = {
    default: "text-slate-950",
    success: "text-emerald-700",
    danger: "text-red-700",
    muted: "text-slate-600",
  }[tone];

  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className={`${strong ? "font-black" : "font-semibold"} ${toneClass}`}>{value}</p>
    </div>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function parseMoneyParam(value?: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
