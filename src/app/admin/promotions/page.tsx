export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BadgePercent,
  Calculator,
  CheckCircle2,
  Database,
  Filter,
  Gauge,
  LineChart,
  PlusCircle,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PromotionCompareForm } from "@/components/admin/PromotionCompareForm";
import { PromotionGuideDialog } from "@/components/admin/PromotionGuideDialog";
import { findFipexEstimate, findFipexModelSuggestions, type FipeExpandedAnalytics, type FipePriceHistoryPoint } from "@/lib/fipe-provider";
import {
  buildPriceDecision,
  buildPriceGuidance,
  normalizePriceCondition,
  normalizeTargetMargin,
  parseMoneyText,
  priceConditionAdjustments,
  type PriceConditionKey,
} from "@/lib/price-comparison";
import { buildPriceTimeline, getTimelineVariation, normalizeTimelineRange, type PriceTimelinePoint, type TimelineRange } from "@/lib/price-timeline";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  view?: string;
  condition?: PriceConditionKey;
  targetMargin?: string;
  timelineRange?: string;
  historyRange?: string;
  compareTitle?: string;
  compareYear?: string;
  compareType?: string;
  compareCost?: string;
  compareSalePrice?: string;
  compareModelId?: string;
  compareModelSlug?: string;
  compareFuelId?: string;
  compareFuelAcronym?: string;
  compareMakeName?: string;
  compareModelName?: string;
  compareFuelName?: string;
};

type HistoryRange = "12" | "24" | "60" | "all";
type HistoryTrend = {
  label: string;
  detail: string;
  tone: "default" | "success" | "danger" | "warning";
};

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = params.view ?? "all";
  const conditionKey = normalizePriceCondition(params.condition);
  const targetMargin = normalizeTargetMargin(params.targetMargin);
  const condition = priceConditionAdjustments[conditionKey];
  const visibleView = params.view ?? "";
  const visibleCondition = params.condition && params.condition in priceConditionAdjustments ? params.condition : "";
  const visibleTargetMargin = params.targetMargin ?? "";
  const visibleTimelineRange = "";
  const timelineRange = normalizeTimelineRange();
  const historyRange = normalizeHistoryRange(params.historyRange);
  const compareTitle = String(params.compareTitle || "").trim();
  const compareYear = Number(params.compareYear || "");
  const compareType = params.compareType === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR";
  const compareCost = parseMoneyText(params.compareCost);
  const compareSalePrice = parseMoneyText(params.compareSalePrice);
  const compareModelId = normalizeOptional(params.compareModelId);
  const compareModelSlug = normalizeOptional(params.compareModelSlug);
  const compareFuelId = normalizeOptional(params.compareFuelId);
  const compareFuelAcronym = normalizeOptional(params.compareFuelAcronym);

  const [vehicles, standaloneFipe, historySuggestions] = await Promise.all([
    prisma.car.findMany({
      orderBy: { updatedAt: "desc" },
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    compareTitle
      ? findFipexEstimate({
          title: compareTitle,
          year: Number.isFinite(compareYear) && compareYear > 0 ? compareYear : undefined,
          vehicleType: compareType,
          modelId: compareModelId,
          modelSlug: compareModelSlug,
          fuelId: compareFuelId,
          fuelAcronym: compareFuelAcronym,
        })
      : Promise.resolve(null),
    compareTitle
      ? findFipexModelSuggestions({
          query: compareTitle,
          vehicleType: compareType,
          includeOlderModels: true,
        })
      : Promise.resolve([]),
  ]);

  const withFipe = vehicles.filter((vehicle) => vehicle.fipePrice);
  const withMargin = vehicles.filter((vehicle) => vehicle.purchasePrice);
  const analyzedVehicles = vehicles.map((vehicle) => {
    const decision = buildPriceDecision({
      fipePrice: vehicle.fipePrice,
      purchasePrice: vehicle.purchasePrice,
      currentPrice: vehicle.price,
      targetMargin,
      conditionKey,
    });
    const suggestedPrice = decision.suggestedPrice ?? vehicle.price;
    const currentGap = suggestedPrice - vehicle.price;

    return {
      vehicle,
      stateAdjustedFipe: decision.adjustedFipe,
      suggestedPrice,
      grossMargin: decision.grossMargin,
      marginPercent: decision.marginPercent,
      discount: decision.discountPercent,
      currentGap,
      status: getPricingStatus({
        marginPercent: decision.marginPercent,
        targetMargin,
        hasFipe: Boolean(vehicle.fipePrice),
        hasCost: Boolean(vehicle.purchasePrice),
        currentGap,
      }),
    };
  });
  const rows = analyzedVehicles
    .filter((row) => {
      if (view === "below-fipe") return row.discount > 0;
      if (view === "with-margin") return row.grossMargin !== null;
      if (view === "risk") return row.marginPercent !== null && row.marginPercent < targetMargin;
      if (view === "without-fipe") return !row.stateAdjustedFipe;
      return true;
    });
  const riskRows = analyzedVehicles.filter((row) => row.status.tone === "danger");
  const attentionRows = analyzedVehicles.filter((row) => row.status.tone === "warning");
  const positiveGapRows = analyzedVehicles.filter((row) => row.currentGap > 0);
  const suggestedRevenue = sum(analyzedVehicles.map((row) => row.suggestedPrice));
  const currentRevenue = sum(analyzedVehicles.map((row) => row.vehicle.price));
  const revenueGap = suggestedRevenue - currentRevenue;
  const primaryInsight = getPrimaryInsight({
    rows,
    riskRows,
    attentionRows,
    positiveGapRows,
    revenueGap,
    targetMargin,
  });
  const PrimaryInsightIcon = primaryInsight.icon;
  const avgSuggestedMargin = average(
    rows
      .map((row) => row.marginPercent)
      .filter((value): value is number => value !== null),
  );
  const standaloneDecision = buildPriceDecision({
    fipePrice: standaloneFipe?.price ?? null,
    purchasePrice: compareCost,
    currentPrice: compareSalePrice,
    targetMargin,
    conditionKey,
  });
  const standaloneGuidance = buildPriceGuidance(standaloneDecision);
  const standaloneSuggestedPrice = standaloneDecision.suggestedPrice;
  const standaloneMargin = standaloneDecision.grossMargin;
  const standaloneMarginPercent = standaloneDecision.marginPercent;
  const priceTimeline = buildPriceTimeline({
    compareTitle,
    compareYear: Number.isFinite(compareYear) && compareYear > 0 ? compareYear : undefined,
    timelineRange,
    standaloneFipe,
    suggestions: historySuggestions,
  });
  const filteredHistory = filterHistoryByRange(standaloneFipe?.history ?? [], historyRange);
  const timelineVariation = getTimelineVariation(priceTimeline);
  const historyVariation = getHistoryVariation(filteredHistory);
  const visibleVariation = historyVariation ?? timelineVariation;
  const historyTrend = getHistoryTrend(filteredHistory);
  const referenceQuality = standaloneFipe
    ? standaloneFipe.matchScore >= 100 || Boolean(standaloneFipe.modelSlug || compareModelSlug)
      ? "Referencia exata"
      : `Correspondencia ${standaloneFipe.confidence}`
    : "Manual";
  const localComparableVehicles = findComparableStock({
    vehicles,
    compareTitle,
    compareType,
  });
  const localComparableAveragePrice = average(localComparableVehicles.map((vehicle) => vehicle.price));
  const standaloneAction = getStandaloneAction({
    hasTitle: Boolean(compareTitle),
    hasDecision: standaloneDecision.hasDecision,
    hasFipe: Boolean(standaloneFipe),
    hasCost: Boolean(compareCost),
    marginPercent: standaloneMarginPercent,
    targetMargin,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Precificação</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Comparativo FIPE e margem</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Compare preco atual FIPE, conservacao do veiculo, valor pretendido de compra e margem minima desejada para estimar o melhor preco para o negocio.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <PromotionGuideDialog />
            <Link
              href="/admin/cars-new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/15"
            >
              <PlusCircle className="h-4 w-4" />
              Cadastrar veículo
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">KPIs do estoque cadastrado</h2>
            <p className="text-xs leading-5 text-slate-500">Estes numeros usam apenas veiculos ja cadastrados e os filtros do estoque.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{vehicles.length} veiculo(s) no estoque</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Database} label="Estoque filtrado" value={`${rows.length}/${vehicles.length}`} detail="Somente veiculos cadastrados" />
          <MetricCard icon={BadgePercent} label="Cobertura FIPE" value={withFipe.length} detail={`${vehicles.length - withFipe.length} sem referencia no cadastro`} />
          <MetricCard icon={AlertTriangle} label="Atencao no estoque" value={riskRows.length + attentionRows.length} detail={`${riskRows.length} abaixo da meta`} tone={riskRows.length ? "danger" : "default"} />
          <MetricCard icon={TrendingUp} label="Potencial do estoque" value={formatCurrency(revenueGap)} detail={`Margem media filtrada: ${avgSuggestedMargin ? `${Math.round(avgSuggestedMargin)}%` : "0%"}`} tone={revenueGap > 0 ? "success" : "default"} />
        </div>
      </section>

      <section className={`rounded-xl border p-5 shadow-sm ${primaryInsight.toneClass}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <PrimaryInsightIcon className={`mt-0.5 h-5 w-5 ${primaryInsight.iconClass}`} />
            <div>
              <h2 className="font-semibold text-slate-950">Diagnóstico da precificação</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{primaryInsight.message}</p>
            </div>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px]">
            <DiagnosticPill label="Estoque com custo" value={`${withMargin.length}/${vehicles.length}`} />
            <DiagnosticPill label="Preço acima do atual" value={positiveGapRows.length} />
            <DiagnosticPill label="Potencial" value={formatCurrency(revenueGap)} />
          </div>
        </div>
      </section>

      <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" open={vehicles.length > 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <span className="inline-flex items-center gap-3">
            <Filter className="h-5 w-5 text-emerald-700" />
            <span>
              <span className="block font-semibold text-slate-950">Filtros do estoque cadastrado</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {vehicles.length > 0 ? "Abra ou recolha os filtros da lista de veículos cadastrados." : "Disponível quando houver veículos cadastrados."}
              </span>
            </span>
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            {vehicles.length > 0 ? "Mostrar/ocultar" : "Sem estoque"}
          </span>
        </summary>

        {vehicles.length > 0 ? (
          <form className="mt-4">
            <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <SelectFilter
                label="Visão"
                name="view"
                defaultValue={visibleView}
                help="Define qual recorte do estoque será mostrado na lista e nos KPIs."
                options={[
                  ["", "Selecione"],
                  ["all", "Todos"],
                  ["below-fipe", "Abaixo da FIPE"],
                  ["with-margin", "Com margem"],
                  ["risk", "Risco/prejuízo"],
                  ["without-fipe", "Sem FIPE"],
                ]}
              />
              <SelectFilter
                label="Conservacao do veiculo"
                name="condition"
                defaultValue={visibleCondition}
                help="Opcional. Ajusta a FIPE pelo estado real do veiculo; deixe sem ajuste quando nao houver avaliacao de conservacao."
                options={[["", "Sem ajuste"], ...Object.entries(priceConditionAdjustments).map(([key, value]) => [key, value.label] as [string, string])]}
              />
              <SelectFilter
                label="Margem minima desejada"
                name="targetMargin"
                defaultValue={visibleTargetMargin}
                help="Percentual minimo usado para calcular preco sugerido, risco de margem e valor maximo recomendado para compra."
                options={[
                  ["", "Padrao 12%"],
                  ["8", "8% conservador"],
                  ["12", "12% padrao"],
                  ["15", "15% agressivo"],
                  ["20", "20% alto"],
                ]}
              />
              <div className="flex items-end">
                <button className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Aplicar
                </button>
              </div>
              <div className="flex items-end">
                <Link
                  href="/admin/promotions"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar filtros
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Estes filtros recalculam apenas os KPIs e a lista de veículos cadastrados abaixo. O comparativo avulso só roda quando você clicar em Comparar.
            </p>
          </form>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Cadastre o primeiro veículo para liberar filtros de estoque. Enquanto isso, use o comparativo avulso para simular uma compra antes do cadastro.
          </div>
        )}
      </details>

      <section className="overflow-hidden rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Calculator className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-950">Comparar veículo sem cadastrar</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Nao precisa escolher outro carro do estoque. Informe modelo, ano-modelo, conservacao do veiculo, margem minima desejada e valor pretendido de compra para estimar FIPE, melhor preco para o negocio, lucro bruto e margem antes de cadastrar.
            </p>
            <PromotionCompareForm
              key={`${compareTitle}-${params.compareYear ?? ""}-${compareType}-${params.compareCost ?? ""}-${params.compareSalePrice ?? ""}-${params.compareModelId ?? ""}-${params.compareModelSlug ?? ""}-${params.compareFuelId ?? ""}-${params.compareFuelAcronym ?? ""}-${params.compareMakeName ?? ""}-${params.compareModelName ?? ""}-${params.compareFuelName ?? ""}-${visibleCondition}-${visibleTargetMargin}-${visibleTimelineRange}-${historyRange}`}
              view={view}
              condition={visibleCondition}
              targetMargin={visibleTargetMargin}
              timelineRange={visibleTimelineRange}
              historyRange={historyRange}
              initialTitle={compareTitle}
              initialYear={params.compareYear ?? ""}
              initialType={compareType}
              initialCost={params.compareCost ?? ""}
              initialSalePrice={params.compareSalePrice ?? ""}
              initialModelId={params.compareModelId ?? ""}
              initialModelSlug={params.compareModelSlug ?? ""}
              initialFuelId={params.compareFuelId ?? ""}
              initialFuelAcronym={params.compareFuelAcronym ?? ""}
              initialMakeName={params.compareMakeName ?? standaloneFipe?.makeName ?? ""}
              initialModelName={params.compareModelName ?? standaloneFipe?.modelName ?? ""}
              initialFuelName={params.compareFuelName ?? standaloneFipe?.fuelName ?? ""}
            />

            {compareTitle ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {standaloneDecision.hasDecision && standaloneSuggestedPrice ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Comparativo avulso</p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">Resultado para decisao comercial</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Este bloco nao altera os KPIs do estoque. Ele usa somente o modelo selecionado, FIPE, valor pretendido de compra, conservacao e margem minima desejada.
                      </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-lg border border-emerald-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-950">
                          Nosso sistema sugere o melhor preço para seu negócio em {compareTitle}:{" "}
                          <span className="text-emerald-700">{formatCurrency(standaloneSuggestedPrice)}</span>.
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {standaloneFipe
                            ? `A recomendacao combina FIPE ajustada por estado, valor pretendido de compra e margem minima de ${targetMargin}%.`
                            : `A recomendacao usa custo/preco informados e margem minima de ${targetMargin}% enquanto a FIPE automatica nao encontra match confiavel.`}
                        </p>
                      </div>
                      <div className={`rounded-lg border p-4 ${standaloneAction.className}`}>
                        <p className="text-sm font-semibold text-slate-950">{standaloneAction.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{standaloneAction.detail}</p>
                      </div>
                    </div>
                    <PurchaseRecommendation
                      suggestedPrice={standaloneSuggestedPrice}
                      targetMargin={targetMargin}
                      intendedPayment={compareCost}
                      localAveragePrice={localComparableAveragePrice}
                      localSampleCount={localComparableVehicles.length}
                      hasFipe={Boolean(standaloneFipe)}
                    />
                    <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-6">
                      <PriceBlock label="Preço atual FIPE" value={standaloneFipe ? formatCurrency(standaloneFipe.price) : "Sem FIPE"} strong />
                      <PriceBlock label={`FIPE ${condition.label}`} value={standaloneDecision.adjustedFipe ? formatCurrency(standaloneDecision.adjustedFipe) : "Sem FIPE"} />
                      <PriceBlock label="Preço sugerido para anunciar" value={formatCurrency(standaloneSuggestedPrice)} tone="success" />
                      <PriceBlock
                        label="Lucro bruto"
                        value={standaloneMargin !== null ? `${formatCurrency(standaloneMargin)} · ${standaloneMarginPercent}%` : "Informe custo"}
                        tone={standaloneMarginPercent !== null && standaloneMarginPercent < targetMargin ? "danger" : "success"}
                      />
                      <PriceBlock label="Fonte de preço" value={standaloneFipe ? `${standaloneFipe.provider} - ${standaloneFipe.confidence}` : "Manual"} />
                      <PriceBlock label="Referência encontrada" value={standaloneFipe ? `${standaloneFipe.referenceMonth} - ${standaloneFipe.title}` : "Valor informado manualmente"} />
                    </div>
                    <ProviderEvidence
                      title={standaloneFipe?.title ?? compareTitle}
                      makeName={params.compareMakeName ?? standaloneFipe?.makeName}
                      modelName={params.compareModelName ?? standaloneFipe?.modelName}
                      fuelName={params.compareFuelName ?? standaloneFipe?.fuelName}
                      year={Number.isFinite(compareYear) && compareYear > 0 ? compareYear : standaloneFipe?.year}
                      referenceMonth={standaloneFipe?.referenceMonth}
                      referenceQuality={referenceQuality}
                    />
                    {standaloneFipe?.analytics ? <FipeAnalyticsStrip analytics={standaloneFipe.analytics} /> : null}
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <StandaloneMetric label="Preço atual FIPE" value={standaloneFipe ? formatCurrency(standaloneFipe.price) : "Sem match"} detail="Referência retornada para o modelo selecionado" />
                      <StandaloneMetric label="Preço sugerido para anunciar" value={formatCurrency(standaloneSuggestedPrice)} detail="Referência comercial atual, não previsão de venda futura" tone="success" />
                      <StandaloneMetric
                        label="Lucro bruto"
                        value={standaloneMargin !== null ? formatCurrency(standaloneMargin) : "Informe custo"}
                        detail={standaloneMarginPercent !== null ? `${standaloneMarginPercent}% sobre o preço sugerido` : "Depende do valor que pretende pagar"}
                        tone={standaloneMarginPercent !== null && standaloneMarginPercent < targetMargin ? "danger" : "success"}
                      />
                      <StandaloneMetric
                        label="Diferença menor/maior"
                        value={visibleVariation ? formatCurrency(visibleVariation.absolute) : "Sem janela"}
                        detail={visibleVariation ? `${visibleVariation.percent}% entre minima e maxima` : "Selecione um modelo com historico"}
                      />
                      <StandaloneMetric
                        label="Tendencia FIPE"
                        value={historyTrend.label}
                        detail={historyTrend.detail}
                        tone={historyTrend.tone}
                      />
                      <StandaloneMetric
                        label="Qualidade da referencia"
                        value={referenceQuality}
                        detail={standaloneFipe ? "Baseada no match FIPE/FipeX selecionado" : "Sem fornecedor automatico confiavel"}
                        tone={standaloneFipe ? "success" : "warning"}
                      />
                    </div>
                    <DecisionFormula decision={standaloneDecision} guidance={standaloneGuidance} />
                    {standaloneFipe && filteredHistory.length ? (
                      <FipeHistoryTimeline
                        history={filteredHistory}
                        vehicleTitle={standaloneFipe.title}
                        vehicleYear={standaloneFipe.year}
                        historyRange={historyRange}
                        trend={historyTrend}
                      />
                    ) : (
                      <PriceTimeline points={priceTimeline} timelineRange={timelineRange} selectedYear={Number.isFinite(compareYear) && compareYear > 0 ? compareYear : standaloneFipe?.year ?? null} />
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Ainda não há decisão completa</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Ajuste modelo/ano, selecione uma sugestão do campo Modelo ou informe custo/preço para calcular uma recomendação manual.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
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
        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Comparativo do estoque</h2>
              <p className="text-xs leading-5 text-slate-500">Lista calculada somente com veiculos cadastrados, custo, FIPE e filtros do estoque.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{rows.length} item(ns) filtrado(s)</span>
          </div>
          <div className="grid gap-4">
            {rows.map(({ vehicle, stateAdjustedFipe, suggestedPrice, grossMargin, marginPercent, discount, currentGap, status }) => {
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
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        Nosso sistema sugere anunciar este veiculo por {formatCurrency(suggestedPrice)}.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge label={status.label} tone={status.tone} />
                        {currentGap !== 0 ? (
                          <StatusBadge
                            label={`${currentGap > 0 ? "Subir" : "Reduzir"} ${formatCurrency(Math.abs(currentGap))}`}
                            tone={currentGap > 0 ? "success" : "warning"}
                          />
                        ) : null}
                      </div>
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
        </section>
      )}
    </div>
  );
}

function SelectFilter({
  label,
  name,
  defaultValue,
  options,
  help,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<[string, string]>;
  help?: string;
}) {
  const tooltipId = help ? `filter-help-${name}` : undefined;
  return (
    <label className="min-w-0 text-sm font-medium text-slate-700">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <span className="truncate">{label}</span>
        {help ? (
          <span className="group/help relative inline-flex shrink-0">
            <span
              tabIndex={0}
              aria-describedby={tooltipId}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-black text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              ?
            </span>
            <span
              id={tooltipId}
              role="tooltip"
              className="pointer-events-none invisible absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-left text-[11px] font-medium leading-4 text-white opacity-0 shadow-xl transition group-hover/help:visible group-hover/help:opacity-100 group-focus-within/help:visible group-focus-within/help:opacity-100"
            >
              {help}
            </span>
          </span>
        ) : null}
      </span>
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

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass = {
    default: "border-slate-200 bg-white text-emerald-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-red-200 bg-red-50 text-red-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <Icon className="h-5 w-5" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function StandaloneMetric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass = {
    default: "border-slate-200 bg-white text-slate-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function ProviderEvidence({
  title,
  makeName,
  modelName,
  fuelName,
  year,
  referenceMonth,
  referenceQuality,
}: {
  title: string;
  makeName?: string | null;
  modelName?: string | null;
  fuelName?: string | null;
  year?: number | null;
  referenceMonth?: string | null;
  referenceQuality: string;
}) {
  const items = [
    ["Marca", makeName],
    ["Modelo", modelName || title],
    ["Combustivel", fuelName],
    ["Ano-modelo", year ? String(year) : null],
    ["Referencia", referenceMonth],
    ["Qualidade", referenceQuality],
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Referencia FIPE usada na decisao</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            A comparacao usa a selecao estruturada da API quando existem modelo, combustivel e ano. Se faltar algum dado, o painel mostra a analise como manual ou parcial.
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-500">{label}</p>
            <p className="mt-0.5 truncate font-black text-slate-950">{value || "Nao informado"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FipeAnalyticsStrip({ analytics }: { analytics: FipeExpandedAnalytics }) {
  const items = [
    {
      label: "Retencao de valor",
      value: formatNullablePercent(analytics.valueRetentionPercent),
      detail: "quanto do valor foi preservado no ciclo FIPE",
    },
    {
      label: "Variacao mensal",
      value: formatNullablePercent(analytics.changeFromPreviousMonthPercent),
      detail: "mudanca contra a referencia anterior",
    },
    {
      label: "Volatilidade",
      value: formatNullableNumber(analytics.priceVolatility),
      detail: "oscilacao do preco na serie",
    },
    {
      label: "Depreciacao anual",
      value: formatNullablePercent(analytics.annualDepreciationRate),
      detail: "ritmo estimado de perda anual",
    },
    {
      label: "Ciclo do veiculo",
      value: analytics.lifecycleStatus || "Nao informado",
      detail: "classificacao retornada pelo provedor",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-slate-950">Leitura analitica da FIPE</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Estes dados enriquecem a decisao, mas nao substituem conferencia comercial, estado real do veiculo e FIPE oficial no fechamento.
        </p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-black text-slate-950">{item.value}</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchaseRecommendation({
  suggestedPrice,
  targetMargin,
  intendedPayment,
  localAveragePrice,
  localSampleCount,
  hasFipe,
}: {
  suggestedPrice: number;
  targetMargin: number;
  intendedPayment: number | null;
  localAveragePrice: number | null;
  localSampleCount: number;
  hasFipe: boolean;
}) {
  const maxPayment = Math.round(suggestedPrice * (1 - targetMargin / 100));
  const paymentValue = typeof intendedPayment === "number" && intendedPayment > 0 ? intendedPayment : null;
  const hasPayment = paymentValue !== null;
  const isOverLimit = paymentValue !== null && paymentValue > maxPayment;
  const remaining = paymentValue !== null ? maxPayment - paymentValue : null;
  const toneClass = isOverLimit
    ? "border-red-200 bg-red-50"
    : hasPayment
      ? "border-emerald-200 bg-emerald-50"
      : "border-amber-200 bg-amber-50";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Valor maximo recomendado para compra</p>
          <p className={`mt-1 text-2xl font-black ${isOverLimit ? "text-red-700" : "text-emerald-700"}`}>{formatCurrency(maxPayment)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Para manter margem minima de {targetMargin}% sobre o preco sugerido, o sistema recomenda pagar ate esse valor.
          </p>
        </div>
        <div className="rounded-lg border border-white/70 bg-white/75 px-3 py-2 text-sm leading-6 text-slate-700">
          {isOverLimit ? (
            <p>
              O valor pretendido esta {formatCurrency(Math.abs(remaining ?? 0))} acima do teto. Acima de {formatCurrency(maxPayment)}, talvez nao valha a pena sem reduzir custo, melhorar preco de anuncio ou aceitar margem menor.
            </p>
          ) : hasPayment ? (
            <p>
              O valor pretendido esta dentro do teto. Ainda restam {formatCurrency(Math.max(remaining ?? 0, 0))} de folga antes de perder a margem minima.
            </p>
          ) : (
            <p>
              Informe o valor pretendido de compra para o sistema comparar contra esse teto e mostrar se o negocio fecha na margem desejada.
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Base usada: {hasFipe ? "FIPE/FipeX do modelo selecionado" : "preco informado manualmente"}, margem minima desejada e {localSampleCount > 0 ? `estoque local com ${localSampleCount} similar(es), media ${formatCurrency(localAveragePrice ?? 0)}` : "sem similares locais suficientes"}.
          </p>
        </div>
      </div>
    </div>
  );
}

function DecisionFormula({
  decision,
  guidance,
}: {
  decision: ReturnType<typeof buildPriceDecision>;
  guidance: ReturnType<typeof buildPriceGuidance>;
}) {
  const candidates = [
    {
      label: "FIPE ajustada pela conservação",
      value: decision.adjustedFipe,
      detail: "preço FIPE multiplicado pelo fator do estado do veículo",
    },
    {
      label: "Minimo pela margem minima",
      value: decision.suggestedByMargin,
      detail: `valor pretendido de compra + ${decision.targetMargin}%`,
    },
    {
      label: "Referencia FIPE informada",
      value: decision.suggestedByCurrentPrice,
      detail: "fallback usado somente quando nao ha FIPE ajustada nem calculo de margem",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Como o preço sugerido para anunciar foi calculado</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            O painel escolhe o maior valor entre FIPE ajustada e minimo pela margem desejada. A referencia FIPE informada so vira fallback quando faltam esses dados. E referencia comercial para negociar agora, nao previsao de venda futura.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Resultado: {decision.suggestedPrice ? formatCurrency(decision.suggestedPrice) : "Sem decisão"}
        </span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {candidates.map((candidate) => (
          <div key={candidate.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-600">{candidate.label}</p>
            <p className="mt-1 font-black text-slate-950">{candidate.value ? formatCurrency(candidate.value) : "Não informado"}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{candidate.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-700">Fórmula de lucro e margem</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Lucro bruto = preço sugerido para anunciar menos valor que pretende pagar. Margem = lucro bruto dividido pelo preço sugerido para anunciar.
          </p>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${guidance.tone === "danger" ? "border-red-200 bg-red-50" : guidance.tone === "warning" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className="text-xs font-semibold text-slate-900">{guidance.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{guidance.detail}</p>
          {guidance.suggestions.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {guidance.suggestions.map((suggestion) => (
                <li key={suggestion}>- {suggestion}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DiagnosticPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/70 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "muted" }) {
  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    muted: "border-slate-200 bg-slate-50 text-slate-600",
  }[tone];

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>;
}

function FipeHistoryTimeline({
  history,
  vehicleTitle,
  vehicleYear,
  historyRange,
  trend,
}: {
  history: FipePriceHistoryPoint[];
  vehicleTitle: string;
  vehicleYear: number;
  historyRange: HistoryRange;
  trend: HistoryTrend;
}) {
  const points = [...history].sort((a, b) => a.year - b.year || a.month - b.month);

  if (points.length <= 1) {
    return <SingleHistoryReference point={points[0]} vehicleTitle={vehicleTitle} vehicleYear={vehicleYear} />;
  }

  const minPoint = points.reduce((min, point) => (point.price < min.price ? point : min), points[0]);
  const maxPoint = points.reduce((max, point) => (point.price > max.price ? point : max), points[0]);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const minPrice = minPoint.price;
  const maxPrice = maxPoint.price;
  const priceRange = Math.max(maxPrice - minPrice, 1);
  const width = 760;
  const height = 300;
  const paddingX = 62;
  const paddingTop = 42;
  const paddingBottom = 52;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const yForPrice = (price: number) => paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: paddingX + (index / Math.max(points.length - 1, 1)) * chartWidth,
    y: yForPrice(point.price),
    index,
  }));
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const gridValues = [maxPrice, minPrice + priceRange / 2, minPrice];
  const keyPointMap = new Map<string, (typeof chartPoints)[number]>();
  [chartPoints[0], chartPoints.at(-1), chartPoints.find((point) => point.price === minPoint.price), chartPoints.find((point) => point.price === maxPoint.price)]
    .filter((point): point is (typeof chartPoints)[number] => Boolean(point))
    .forEach((point) => keyPointMap.set(`${point.year}-${point.month}-${point.price}`, point));
  const keyPoints = Array.from(keyPointMap.values()).sort((a, b) => a.index - b.index);
  const absoluteVariation = maxPrice - minPrice;
  const percentVariation = minPrice > 0 ? Math.round((absoluteVariation / minPrice) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Linha do tempo FIPE mensal</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Historico real retornado pela FipeX para o ano-modelo {vehicleYear}. Janela: {getHistoryRangeLabel(historyRange)}. A linha mostra referencias mensais FIPE encontradas, nao projecao de venda futura.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <TimelineSummary label="Periodo FIPE" value={`${firstPoint.label} ate ${lastPoint.label}`} tone="muted" />
          <TimelineSummary label={`Minima ${minPoint.label}`} value={formatCurrency(minPoint.price)} tone="muted" />
          <TimelineSummary label={`Maxima ${maxPoint.label}`} value={formatCurrency(maxPoint.price)} tone="success" />
          <TimelineSummary label="Tendencia" value={trend.label} tone={trend.tone === "success" ? "success" : trend.tone === "danger" || trend.tone === "warning" ? "warning" : "muted"} />
          <TimelineSummary label="Diferenca menor/maior" value={`${formatCurrency(absoluteVariation)} · ${percentVariation}%`} tone={percentVariation >= 8 ? "warning" : "muted"} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <svg
          className="h-auto w-full rounded-lg border border-slate-100 bg-slate-50"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Grafico em linha com historico mensal FIPE"
        >
          {gridValues.map((value, index) => {
            const y = yForPrice(value);
            return (
              <g key={`${value}-${index}`}>
                <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="10" y={y + 4} fill="#64748b" fontSize="11" fontWeight="700">
                  {formatCompactCurrency(value)}
                </text>
              </g>
            );
          })}

          <line x1={paddingX} x2={width - paddingX} y1={height - paddingBottom} y2={height - paddingBottom} stroke="#cbd5e1" strokeWidth="1.5" />
          <polyline points={linePoints} fill="none" stroke="#047857" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          <text x={paddingX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
            {firstPoint.label}
          </text>
          <text x={width / 2} y={height - 18} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
            {chartPoints[Math.floor(chartPoints.length / 2)]?.label}
          </text>
          <text x={width - paddingX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
            {lastPoint.label}
          </text>

          {keyPoints.map((point) => {
            const isMinOrMax = point.price === minPoint.price || point.price === maxPoint.price;
            const isLast = point.index === chartPoints.length - 1;

            return (
              <g key={`${point.year}-${point.month}-${point.price}`}>
                <title>{`${point.referenceMonth}: ${formatCurrency(point.price)} - ${vehicleTitle}`}</title>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isLast ? 7 : isMinOrMax ? 6 : 4.5}
                  fill={isLast ? "#047857" : "#ffffff"}
                  stroke={isLast ? "#064e3b" : "#047857"}
                  strokeWidth="3"
                />
                <text x={point.x} y={Math.max(18, point.y - 12)} textAnchor="middle" fill={isLast || isMinOrMax ? "#047857" : "#334155"} fontSize="11" fontWeight="800">
                  {formatCompactCurrency(point.price)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 md:grid-cols-2">
        <p className="rounded-lg bg-slate-50 px-3 py-2">Esta serie vem do historico mensal do provedor. Ela ajuda a enxergar queda, estabilidade ou valorizacao antes de definir o preco de anuncio.</p>
        <p className="rounded-lg bg-slate-50 px-3 py-2">A decisao final continua dependendo do valor que pretende pagar, conservacao do veiculo, margem alvo e validacao na FIPE oficial.</p>
      </div>
    </div>
  );
}

function SingleHistoryReference({
  point,
  vehicleTitle,
  vehicleYear,
}: {
  point?: FipePriceHistoryPoint;
  vehicleTitle: string;
  vehicleYear: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Linha do tempo FIPE mensal</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            O provedor retornou apenas uma referencia mensal para o ano-modelo {vehicleYear}. O painel nao desenha linha para nao sugerir tendencia inexistente.
          </p>
        </div>
        {point ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <TimelineSummary label="Referencia FIPE" value={point.label} tone="muted" />
            <TimelineSummary label="Preco atual FIPE" value={formatCurrency(point.price)} tone="success" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <svg
          className="h-auto w-full"
          viewBox="0 0 360 180"
          role="img"
          aria-label="Sem grafico de linha porque existe apenas uma referencia FIPE mensal"
        >
          <rect x="22" y="22" width="316" height="136" rx="20" fill="#ffffff" stroke="#dbeafe" />
          <path d="M58 116 H302" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <path d="M88 116 C118 84 145 84 176 116 C206 148 235 148 272 116" fill="none" stroke="#a7f3d0" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
          <circle cx="180" cy="116" r="17" fill="#047857" stroke="#064e3b" strokeWidth="5" />
          <circle cx="180" cy="116" r="7" fill="#ecfdf5" />
          <rect x="96" y="50" width="168" height="32" rx="16" fill="#ecfdf5" stroke="#6ee7b7" />
          <text x="180" y="71" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="800">
            {point?.label ?? vehicleYear}
          </text>
          <text x="180" y="145" textAnchor="middle" fill="#334155" fontSize="13" fontWeight="800">
            {point ? formatCompactCurrency(point.price) : "Sem serie"}
          </text>
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">Sem serie suficiente para grafico em linha</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Para {vehicleTitle}, use a FIPE encontrada como base atual e combine com valor que pretende pagar, conservacao do veiculo e margem alvo.
          </p>
          <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
            <p className="rounded-lg bg-white px-3 py-2">Preco sugerido para anunciar continua sendo referencia comercial atual, nao venda futura.</p>
            <p className="rounded-lg bg-white px-3 py-2">Quando houver mais referencias mensais, o grafico em linha aparece automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceTimeline({
  points,
  timelineRange,
  selectedYear,
}: {
  points: PriceTimelinePoint[];
  timelineRange: TimelineRange;
  selectedYear: number | null;
}) {
  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-950">Comparação por ano-modelo</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Selecione uma sugestão de modelo e clique em Comparar para consultar valores FIPE por ano-modelo.
        </p>
      </div>
    );
  }

  if (points.length === 1) {
    return <SingleReferenceTimeline point={points[0]} timelineRange={timelineRange} selectedYear={selectedYear} />;
  }

  const minPoint = points.reduce((min, point) => (point.price < min.price ? point : min), points[0]);
  const maxPoint = points.reduce((max, point) => (point.price > max.price ? point : max), points[0]);
  const selectedPoint = points.find((point) => point.isSelected);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const currentCalendarYear = new Date().getFullYear();
  const requestedAxisStartYear = timelineRange === "current" ? selectedYear ?? firstPoint.year : firstPoint.year;
  const axisStartYear = Math.min(requestedAxisStartYear, firstPoint.year);
  const axisEndYear = timelineRange === "current" ? Math.max(axisStartYear, currentCalendarYear) : lastPoint.year;
  const minPrice = minPoint.price;
  const maxPrice = maxPoint.price;
  const priceRange = Math.max(maxPrice - minPrice, 1);
  const width = 760;
  const height = 300;
  const paddingX = 58;
  const paddingTop = 42;
  const paddingBottom = 54;
  const chartHeight = height - paddingTop - paddingBottom;
  const yForPrice = (price: number) => paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const hasLeadingGap = axisStartYear < firstPoint.year;
  const hasTrailingGap = timelineRange === "current" && lastPoint.year < axisEndYear;
  const gapBandWidth = 118;
  const dataStartX = paddingX + (hasLeadingGap ? gapBandWidth : 0);
  const dataEndX = width - paddingX - (hasTrailingGap ? gapBandWidth : 0);
  const dataWidth = Math.max(dataEndX - dataStartX, 1);
  const xForDataYear = (year: number) => {
    const dataYearRange = Math.max(lastPoint.year - firstPoint.year, 1);
    return dataStartX + ((year - firstPoint.year) / dataYearRange) * dataWidth;
  };
  const chartPoints = points.map((point) => {
    const x = points.length === 1 ? dataStartX + dataWidth / 2 : xForDataYear(point.year);
    return {
      ...point,
      x,
      y: yForPrice(point.price),
    };
  });
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const gridValues = [maxPrice, minPrice + priceRange / 2, minPrice];
  const leadingReferenceWidth = Math.max(0, dataStartX - paddingX);
  const missingReferenceWidth = Math.max(0, width - paddingX - dataEndX);
  const referencePeriodLabel = firstPoint.year === lastPoint.year ? String(firstPoint.year) : `${firstPoint.year} até ${lastPoint.year}`;
  const axisPeriodLabel = axisStartYear === axisEndYear ? String(axisStartYear) : `${axisStartYear} até ${axisEndYear}`;
  const hasExpandedAxis = hasLeadingGap || hasTrailingGap;
  const timelineCopy =
    timelineRange === "current"
      ? `Eixo visual do ano-modelo ${axisStartYear} até ${axisEndYear}; a linha usa somente referências FIPE encontradas. ${hasTrailingGap ? `Última referência encontrada: ${lastPoint.year}.` : ""}`
      : timelineRange === "selected"
        ? `Janela encerrada no ano-modelo ${selectedYear ?? lastPoint.year}, com até 10 versões anteriores encontradas.`
        : `Janela automática com referências FIPE encontradas a partir do ano-modelo informado.`;
  const absoluteVariation = maxPrice - minPrice;
  const percentVariation = minPrice > 0 ? Math.round((absoluteVariation / minPrice) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Comparação FIPE por ano-modelo</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            O ano é o ano-modelo do veículo na FIPE. {timelineCopy} Não é histórico mensal de anúncio nem projeção futura.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <TimelineSummary label="Referências FIPE" value={referencePeriodLabel} tone="muted" />
          {hasExpandedAxis ? <TimelineSummary label="Eixo visual" value={axisPeriodLabel} tone="muted" /> : null}
          <TimelineSummary label={`Mínima ${minPoint.year}`} value={formatCurrency(minPoint.price)} tone="muted" />
          <TimelineSummary label={`Máxima ${maxPoint.year}`} value={formatCurrency(maxPoint.price)} tone="success" />
          <TimelineSummary label="Diferença menor/maior" value={`${formatCurrency(absoluteVariation)} · ${percentVariation}%`} tone={percentVariation >= 8 ? "warning" : "muted"} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <svg
          className="h-auto w-full rounded-lg border border-slate-100 bg-slate-50"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Gráfico em linha com comparação FIPE por ano-modelo"
        >
          {gridValues.map((value, index) => {
            const y = yForPrice(value);
            return (
              <g key={`${value}-${index}`}>
                <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="10" y={y + 4} fill="#64748b" fontSize="11" fontWeight="700">
                  {formatCompactCurrency(value)}
                </text>
              </g>
            );
          })}

          {hasLeadingGap ? (
            <g>
              <rect
                x={paddingX}
                y={paddingTop - 18}
                width={leadingReferenceWidth}
                height={chartHeight + 18}
                fill="#f8fafc"
                opacity="0.85"
              />
              <line x1={dataStartX} x2={dataStartX} y1={paddingTop - 18} y2={height - paddingBottom} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth="1.5" />
              <text x={paddingX + 8} y={paddingTop - 4} fill="#64748b" fontSize="11" fontWeight="700">
                sem FIPE {axisStartYear}-{firstPoint.year - 1}
              </text>
            </g>
          ) : null}

          {hasTrailingGap ? (
            <g>
              <rect
                x={dataEndX}
                y={paddingTop - 18}
                width={missingReferenceWidth}
                height={chartHeight + 18}
                fill="#f8fafc"
                opacity="0.85"
              />
              <line x1={dataEndX} x2={dataEndX} y1={paddingTop - 18} y2={height - paddingBottom} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth="1.5" />
              <text x={Math.min(width - paddingX - 6, dataEndX + 10)} y={paddingTop - 4} fill="#64748b" fontSize="11" fontWeight="700">
                sem FIPE {lastPoint.year + 1}-{axisEndYear}
              </text>
            </g>
          ) : null}
          <line x1={paddingX} x2={width - paddingX} y1={height - paddingBottom} y2={height - paddingBottom} stroke="#cbd5e1" strokeWidth="1.5" />
          <polyline points={linePoints} fill="none" stroke="#047857" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x={paddingX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
            {axisStartYear}
          </text>
          {hasLeadingGap ? (
            <text x={dataStartX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
              {firstPoint.year}
            </text>
          ) : null}
          {hasTrailingGap ? (
            <text x={dataEndX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
              {lastPoint.year}
            </text>
          ) : null}
          {axisEndYear !== axisStartYear ? (
            <text x={width - paddingX} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
              {axisEndYear}
            </text>
          ) : null}

          {chartPoints.map((point) => {
            const showLabel = points.length <= 7 || point.year === firstPoint.year || point.year === lastPoint.year || point.isSelected;
            const isMinOrMax = point.year === minPoint.year || point.year === maxPoint.year;

            return (
              <g key={`${point.year}-${point.price}-${point.title}`}>
                <title>{`${point.year}: ${formatCurrency(point.price)} - ${point.title}`}</title>
                {point.isSelected ? (
                  <line x1={point.x} x2={point.x} y1={paddingTop - 10} y2={height - paddingBottom} stroke="#047857" strokeDasharray="5 5" strokeWidth="1.5" />
                ) : null}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.isSelected ? 8 : isMinOrMax ? 6 : 4.5}
                  fill={point.isSelected ? "#047857" : "#ffffff"}
                  stroke={point.isSelected ? "#064e3b" : "#047857"}
                  strokeWidth="3"
                />
                {showLabel ? (
                  <>
                    {point.year !== axisStartYear && point.year !== axisEndYear && !(hasLeadingGap && point.year === firstPoint.year) && !(hasTrailingGap && point.year === lastPoint.year) ? (
                    <text x={point.x} y={height - 18} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="800">
                      {point.year}
                    </text>
                    ) : null}
                    <text x={point.x} y={Math.max(18, point.y - 12)} textAnchor="middle" fill={point.isSelected || isMinOrMax ? "#047857" : "#334155"} fontSize="11" fontWeight="800">
                      {formatCompactCurrency(point.price)}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {selectedPoint ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Ano-modelo selecionado: <span className="font-semibold text-slate-800">{selectedPoint.year}</span>, com referência FIPE de{" "}
          <span className="font-semibold text-slate-800">{formatCurrency(selectedPoint.price)}</span>.
        </p>
      ) : null}
      <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 md:grid-cols-2">
        <p className="rounded-lg bg-slate-50 px-3 py-2">O modo automático mostra apenas anos com FIPE encontrada. Use Do ano-modelo até hoje para enxergar lacunas sem projetar preço futuro.</p>
        <p className="rounded-lg bg-slate-50 px-3 py-2">Para decisão comercial, combine esta variação com custo pago, estado do veículo e margem alvo.</p>
      </div>
    </div>
  );
}

function SingleReferenceTimeline({
  point,
  timelineRange,
  selectedYear,
}: {
  point: PriceTimelinePoint;
  timelineRange: TimelineRange;
  selectedYear: number | null;
}) {
  const currentCalendarYear = new Date().getFullYear();
  const axisStartYear = timelineRange === "current" ? selectedYear ?? point.year : point.year;
  const axisEndYear = timelineRange === "current" ? Math.max(axisStartYear, currentCalendarYear) : point.year;
  const hasMissingYears = timelineRange === "current" && axisEndYear > point.year;
  const missingCopy = hasMissingYears
    ? `Não há referências FIPE encontradas de ${point.year + 1} até ${axisEndYear}; esses anos ficam como lacuna, sem projeção.`
    : "Com uma referência única, o painel não desenha linha para não sugerir evolução de preço.";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Comparação FIPE por ano-modelo</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Apenas uma referência FIPE foi encontrada para o ano-modelo {point.year}. {missingCopy}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <TimelineSummary label="Referência FIPE" value={String(point.year)} tone="muted" />
          {hasMissingYears ? <TimelineSummary label="Eixo visual" value={`${axisStartYear} até ${axisEndYear}`} tone="muted" /> : null}
          <TimelineSummary label="Preço atual FIPE" value={formatCurrency(point.price)} tone="success" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <svg
          className="h-auto w-full"
          viewBox="0 0 360 180"
          role="img"
          aria-label="Sem gráfico de linha porque existe apenas uma referência FIPE"
        >
          <rect x="22" y="22" width="316" height="136" rx="20" fill="#ffffff" stroke="#dbeafe" />
          <path d="M58 116 H302" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <path d="M88 116 C118 84 145 84 176 116 C206 148 235 148 272 116" fill="none" stroke="#a7f3d0" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
          <circle cx="180" cy="116" r="17" fill="#047857" stroke="#064e3b" strokeWidth="5" />
          <circle cx="180" cy="116" r="7" fill="#ecfdf5" />
          <rect x="111" y="50" width="138" height="32" rx="16" fill="#ecfdf5" stroke="#6ee7b7" />
          <text x="180" y="71" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="800">
            {point.year}
          </text>
          <text x="180" y="145" textAnchor="middle" fill="#334155" fontSize="13" fontWeight="800">
            {formatCompactCurrency(point.price)}
          </text>
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">Sem série suficiente para gráfico em linha</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Para {point.title}, o motor encontrou somente uma referência de preço. O melhor caminho é usar esta FIPE como base atual, combinar com valor que pretende pagar, conservação do veículo e margem alvo.
          </p>
          <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
            <p className="rounded-lg bg-white px-3 py-2">Preço sugerido para anunciar continua sendo referência comercial atual, não venda futura.</p>
            <p className="rounded-lg bg-white px-3 py-2">Quando o provedor retornar mais anos do mesmo modelo, o gráfico em linha aparece automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineSummary({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "muted" }) {
  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    muted: "border-slate-200 bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div className={`min-w-[132px] rounded-lg border px-3 py-2 ${toneClass}`}>
      <p>{label}</p>
      <p className="mt-0.5 font-black">{value}</p>
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

function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${Math.round(value / 1000)} mil`;
  }

  return formatCurrency(value);
}

function formatNullablePercent(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}%` : "Nao informado";
}

function formatNullableNumber(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.round(value * 100) / 100) : "Nao informado";
}

function getHistoryVariation(points: FipePriceHistoryPoint[]): { absolute: number; percent: number } | null {
  if (points.length < 2) return null;

  const prices = points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min <= 0 || max <= min) return null;

  return {
    absolute: max - min,
    percent: Math.round(((max - min) / min) * 100),
  };
}

function getHistoryTrend(points: FipePriceHistoryPoint[]): HistoryTrend {
  if (points.length < 2) {
    return {
      label: "Sem serie",
      detail: "Historico insuficiente para indicar tendencia",
      tone: "warning",
    };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const absolute = last.price - first.price;
  const percent = first.price > 0 ? Math.round((absolute / first.price) * 100) : 0;

  if (Math.abs(percent) <= 2) {
    return {
      label: "Estavel",
      detail: `${formatCurrency(absolute)} no periodo filtrado`,
      tone: "default",
    };
  }

  if (percent > 0) {
    return {
      label: `Subiu ${percent}%`,
      detail: `${formatCurrency(absolute)} acima de ${first.label}`,
      tone: "success",
    };
  }

  return {
    label: `Caiu ${Math.abs(percent)}%`,
    detail: `${formatCurrency(Math.abs(absolute))} abaixo de ${first.label}`,
    tone: "danger",
  };
}

function filterHistoryByRange(points: FipePriceHistoryPoint[], range: HistoryRange): FipePriceHistoryPoint[] {
  const sorted = [...points].sort((a, b) => a.year - b.year || a.month - b.month);
  if (range === "all") return sorted;

  const limit = Number(range);
  return sorted.slice(Math.max(0, sorted.length - limit));
}

function normalizeHistoryRange(value?: string | null): HistoryRange {
  if (value === "24" || value === "60" || value === "all") return value;
  return "12";
}

function getHistoryRangeLabel(range: HistoryRange): string {
  if (range === "all") return "todo historico";
  if (range === "60") return "ultimos 5 anos";
  return `ultimos ${range} meses`;
}

function findComparableStock({
  vehicles,
  compareTitle,
  compareType,
}: {
  vehicles: Array<{ title: string; price: number; vehicleType: string }>;
  compareTitle: string;
  compareType: "CAR" | "MOTORCYCLE";
}): Array<{ title: string; price: number; vehicleType: string }> {
  const tokens = buildComparableTokens(compareTitle);
  if (tokens.length === 0) return [];

  const requiredMatches = Math.min(2, tokens.length);
  return vehicles.filter((vehicle) => {
    if (vehicle.vehicleType !== compareType) return false;
    const normalizedTitle = normalizeComparableText(vehicle.title);
    const matches = tokens.filter((token) => normalizedTitle.includes(token)).length;
    return matches >= requiredMatches;
  });
}

function buildComparableTokens(value: string): string[] {
  return normalizeComparableText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !/^\d{4}$/.test(token));
}

function normalizeComparableText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOptional(value?: string | null): string | null {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function getPricingStatus({
  marginPercent,
  targetMargin,
  hasFipe,
  hasCost,
  currentGap,
}: {
  marginPercent: number | null;
  targetMargin: number;
  hasFipe: boolean;
  hasCost: boolean;
  currentGap: number;
}): { label: string; tone: "success" | "warning" | "danger" | "muted" } {
  if (!hasFipe) return { label: "Sem FIPE", tone: "warning" };
  if (!hasCost) return { label: "Sem custo", tone: "warning" };
  if (marginPercent !== null && marginPercent < targetMargin) return { label: "Abaixo da meta", tone: "danger" };
  if (currentGap > 0) return { label: "Oportunidade", tone: "success" };
  return { label: "Dentro da meta", tone: "muted" };
}

function getPrimaryInsight({
  rows,
  riskRows,
  attentionRows,
  positiveGapRows,
  revenueGap,
  targetMargin,
}: {
  rows: unknown[];
  riskRows: unknown[];
  attentionRows: unknown[];
  positiveGapRows: unknown[];
  revenueGap: number;
  targetMargin: number;
}): { icon: LucideIcon; message: string; toneClass: string; iconClass: string } {
  if (rows.length === 0) {
    return {
      icon: Gauge,
      message: "Nenhum veículo aparece com os filtros atuais. Ajuste a visão ou use o comparativo avulso para simular um modelo antes do cadastro.",
      toneClass: "border-slate-200 bg-white",
      iconClass: "text-slate-500",
    };
  }

  if (riskRows.length > 0) {
    return {
      icon: AlertTriangle,
      message: `${riskRows.length} veículo(s) estão abaixo da margem alvo de ${targetMargin}%. Priorize custo, preço de anúncio e FIPE desses itens antes de promover.`,
      toneClass: "border-red-200 bg-red-50",
      iconClass: "text-red-700",
    };
  }

  if (attentionRows.length > 0) {
    return {
      icon: Target,
      message: `${attentionRows.length} veículo(s) ainda precisam de custo ou FIPE para uma análise completa. Complete esses dados para reduzir decisão manual.`,
      toneClass: "border-amber-200 bg-amber-50",
      iconClass: "text-amber-700",
    };
  }

  if (revenueGap > 0 && positiveGapRows.length > 0) {
    return {
      icon: LineChart,
      message: `Há ${positiveGapRows.length} oportunidade(s) de ajuste positivo, com potencial total de ${formatCurrency(revenueGap)} sobre os preços atuais.`,
      toneClass: "border-emerald-200 bg-emerald-50",
      iconClass: "text-emerald-700",
    };
  }

  return {
    icon: CheckCircle2,
    message: "A precificação filtrada está coerente com a margem alvo e sem alerta crítico. Use o comparativo avulso para validar novos modelos antes do cadastro.",
    toneClass: "border-emerald-200 bg-emerald-50",
    iconClass: "text-emerald-700",
  };
}

function getStandaloneAction({
  hasTitle,
  hasDecision,
  hasFipe,
  hasCost,
  marginPercent,
  targetMargin,
}: {
  hasTitle: boolean;
  hasDecision: boolean;
  hasFipe: boolean;
  hasCost: boolean;
  marginPercent: number | null;
  targetMargin: number;
}): { title: string; detail: string; className: string } {
  if (!hasTitle) {
    return {
      title: "Comece pelo modelo",
      detail: "Digite marca ou modelo e escolha uma sugestão para melhorar a correspondência FIPE.",
      className: "border-slate-200 bg-white",
    };
  }

  if (!hasDecision) {
    return {
      title: "Faltam dados para decidir",
      detail: "Informe custo ou preço atual para o sistema calcular uma recomendação mesmo sem FIPE automática.",
      className: "border-amber-200 bg-amber-50",
    };
  }

  if (!hasCost) {
    return {
      title: "Preço sugerido sem lucro",
      detail: "A recomendação de preço existe, mas lucro bruto e margem dependem do custo de entrada.",
      className: "border-amber-200 bg-amber-50",
    };
  }

  if (marginPercent !== null && marginPercent < targetMargin) {
    return {
      title: "Margem abaixo da meta",
      detail: "O preço sugerido não alcança a margem alvo. Revise custo, condição do veículo ou estratégia de anúncio.",
      className: "border-red-200 bg-red-50",
    };
  }

  return {
    title: hasFipe ? "Decisão pronta para negociação" : "Decisão manual pronta",
    detail: hasFipe
      ? "Use o preço sugerido como referência comercial e confira a FIPE oficial antes do fechamento."
      : "Sem match FIPE confiável, a decisão foi baseada em custo/preço informados e margem alvo.",
    className: "border-emerald-200 bg-emerald-50",
  };
}
