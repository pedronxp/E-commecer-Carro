export const dynamic = "force-dynamic";

import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Calculator, PlusCircle } from "lucide-react";
import { PromotionCompareForm } from "@/components/admin/PromotionCompareForm";
import { PromotionGuideDialog } from "@/components/admin/PromotionGuideDialog";
import { isRecoverableDatabaseError, withDatabaseTimeout } from "@/lib/database-resilience";
import { findFipexEstimate, findFipexModelSuggestions, type FipeExpandedAnalytics, type FipePriceHistoryPoint } from "@/lib/fipe-provider";
import { buildMarketLiquidityInsight, type MarketLiquidityInsight } from "@/lib/market-liquidity";
import {
  buildPriceDecision,
  buildPriceGuidance,
  getPriceConditionOption,
  normalizePriceCondition,
  normalizeTargetMargin,
  parseMoneyText,
  priceConditionAdjustments,
  type PriceConditionKey,
} from "@/lib/price-comparison";
import { buildPriceTimeline, getTimelineVariation, normalizeTimelineRange, type PriceTimelinePoint, type TimelineRange } from "@/lib/price-timeline";
import { buildMarketContext, getRecommendationReportModeOption, normalizeMarketUf, normalizeRecommendationReportMode } from "@/lib/pricing-report";
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
  compareMarketUf?: string;
  compareReportMode?: string;
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
type MarketContext = ReturnType<typeof buildMarketContext>;

const promotionStockVehicleInclude = {
  brand: true,
  category: true,
  images: { where: { isPrimary: true }, take: 1 },
} satisfies Prisma.CarInclude;

type PromotionStockVehicle = Prisma.CarGetPayload<{
  include: typeof promotionStockVehicleInclude;
}>;

type PromotionStockState = {
  vehicles: PromotionStockVehicle[];
  unavailable: boolean;
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
  const conditionOption = getPriceConditionOption(params.condition ?? "");
  const visibleCondition = params.condition && params.condition in priceConditionAdjustments ? params.condition : "";
  const visibleTargetMargin = params.targetMargin ?? "";
  const timelineRange = normalizeTimelineRange(params.timelineRange);
  const visibleTimelineRange = timelineRange;
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
  const compareMarketUf = normalizeMarketUf(params.compareMarketUf);
  const reportMode = normalizeRecommendationReportMode(params.compareReportMode);
  const reportModeOption = getRecommendationReportModeOption(reportMode);
  const marketContext = buildMarketContext(compareMarketUf);
  const showPlusReport = reportMode === "plus" || reportMode === "advanced";
  const showAdvancedReport = reportMode === "advanced";

  const [stockState, standaloneFipe, historySuggestions] = await Promise.all([
    getPromotionStockVehicles(),
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
  const vehicles = stockState.vehicles;
  const stockUnavailable = stockState.unavailable;

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
  const marketLiquidity = buildMarketLiquidityInsight({
    marketUf: compareMarketUf,
    vehicleType: compareType,
    referencePrice: standaloneFipe?.price ?? compareSalePrice,
    adjustedFipe: standaloneDecision.adjustedFipe,
    suggestedPrice: standaloneDecision.suggestedPrice,
    purchasePrice: compareCost,
    maxRecommendedPurchasePrice: standaloneDecision.maxRecommendedPurchasePrice,
    targetMargin,
    trendTone: historyTrend.tone,
    fipeSpreadPercent: visibleVariation?.percent,
    localSampleCount: localComparableVehicles.length,
  });
  const standaloneAction = getStandaloneAction({
    hasTitle: Boolean(compareTitle),
    hasDecision: standaloneDecision.hasDecision,
    hasFipe: Boolean(standaloneFipe),
    hasCost: Boolean(compareCost),
    marginPercent: standaloneMarginPercent,
    targetMargin,
  });
  const standaloneChart = standaloneFipe && filteredHistory.length ? (
    <FipeHistoryTimeline
      history={filteredHistory}
      vehicleTitle={standaloneFipe.title}
      vehicleYear={standaloneFipe.year}
      historyRange={historyRange}
      trend={historyTrend}
    />
  ) : (
    <PriceTimeline points={priceTimeline} timelineRange={timelineRange} selectedYear={Number.isFinite(compareYear) && compareYear > 0 ? compareYear : standaloneFipe?.year ?? null} />
  );

  return (
    <div className="space-y-6">
      <section className="admin-hero-panel rounded-xl p-6 shadow-sm">
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Produto interno</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Precificador sem cadastro</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Simule FIPE, conservacao do veiculo, valor de compra da loja, margem minima e preco sugerido antes de cadastrar o veiculo no estoque.
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

      {stockUnavailable ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-950">Estoque cadastrado temporariamente indisponivel</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                O banco de dados do estoque nao respondeu agora. O precificador sem cadastro continua disponivel; apenas comparaveis internos de estoque ficam pausados ate a conexao voltar.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="admin-panel overflow-visible rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Calculator className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-950">Simulacao de compra sem cadastro</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Nao precisa escolher outro veiculo do estoque. Informe modelo, ano-modelo, conservacao, margem minima e valor de compra da loja para estimar FIPE, teto de compra, preco de anuncio, lucro bruto e margem antes de cadastrar.
            </p>
            <PromotionCompareForm
              key={`${compareTitle}-${params.compareYear ?? ""}-${compareType}-${params.compareCost ?? ""}-${params.compareSalePrice ?? ""}-${params.compareModelId ?? ""}-${params.compareModelSlug ?? ""}-${params.compareFuelId ?? ""}-${params.compareFuelAcronym ?? ""}-${params.compareMarketUf ?? ""}-${params.compareReportMode ?? ""}-${params.compareMakeName ?? ""}-${params.compareModelName ?? ""}-${params.compareFuelName ?? ""}-${visibleCondition}-${visibleTargetMargin}-${visibleTimelineRange}-${historyRange}`}
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
              initialMarketUf={compareMarketUf}
              initialReportMode={reportMode}
              initialMakeName={params.compareMakeName ?? standaloneFipe?.makeName ?? ""}
              initialModelName={params.compareModelName ?? standaloneFipe?.modelName ?? ""}
              initialFuelName={params.compareFuelName ?? standaloneFipe?.fuelName ?? ""}
            />

            {compareTitle ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {standaloneDecision.hasDecision && standaloneSuggestedPrice ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Simulacao sem cadastro</p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">Resultado para decisao comercial</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Modo {reportModeOption.label}. Este bloco usa modelo selecionado, FIPE, valor de compra da loja, conservacao, margem minima e contexto de UF quando informado.
                      </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-lg border border-emerald-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Melhor preco para comprar</p>
                        <p className="mt-1 text-2xl font-black leading-tight text-slate-950">
                          {marketLiquidity.bestPurchasePrice ? formatCurrency(marketLiquidity.bestPurchasePrice) : standaloneDecision.maxRecommendedPurchasePrice ? formatCurrency(standaloneDecision.maxRecommendedPurchasePrice) : "Sem teto"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {standaloneFipe
                            ? `Compra recomendada para preservar margem, conservacao e liquidez ${marketContext.requestedUf ? `em ${marketContext.requestedUf}` : "nacional"}. Preco de anuncio sugerido: ${formatCurrency(standaloneSuggestedPrice)}.`
                            : `Sem FIPE confiavel, o sistema usa custo/preco informados e margem minima de ${targetMargin}% com confianca reduzida.`}
                        </p>
                      </div>
                      <div className={`rounded-lg border p-4 ${standaloneAction.className}`}>
                        <p className="text-sm font-semibold text-slate-950">{standaloneAction.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{standaloneAction.detail}</p>
                      </div>
                    </div>
                    <PurchaseRecommendation
                      suggestedPrice={standaloneSuggestedPrice}
                      purchaseCeiling={standaloneDecision.maxRecommendedPurchasePrice}
                      bestPurchasePrice={marketLiquidity.bestPurchasePrice}
                      marketLiquidity={marketLiquidity}
                      targetMargin={targetMargin}
                      intendedPayment={compareCost}
                      localAveragePrice={localComparableAveragePrice}
                      localSampleCount={localComparableVehicles.length}
                      hasFipe={Boolean(standaloneFipe)}
                    />
                    <DecisionContextCards
                      conditionLabel={conditionOption.optionLabel}
                      conditionEffect={conditionOption.effect}
                      targetMargin={targetMargin}
                      intendedPayment={compareCost}
                      purchaseCeiling={standaloneDecision.maxRecommendedPurchasePrice}
                      referenceQuality={referenceQuality}
                      marketContext={marketContext}
                      marketLiquidity={marketLiquidity}
                      hasFipe={Boolean(standaloneFipe)}
                    />
                    <MarketLiquidityPanel insight={marketLiquidity} />
                    <div className="grid gap-3 text-[13px] md:grid-cols-2 xl:grid-cols-6">
                      <PriceBlock label="Preço atual FIPE" value={standaloneFipe ? formatCurrency(standaloneFipe.price) : "Sem FIPE"} strong />
                      <PriceBlock label={conditionOption.decisionLabel} value={standaloneDecision.adjustedFipe ? formatCurrency(standaloneDecision.adjustedFipe) : "Sem FIPE"} />
                      <PriceBlock label="Preço sugerido para anunciar" value={formatCurrency(standaloneSuggestedPrice)} tone="success" />
                      <PriceBlock
                        label="Lucro bruto"
                        value={standaloneMargin !== null ? `${formatCurrency(standaloneMargin)} · ${standaloneMarginPercent}%` : "Informe custo"}
                        tone={standaloneMarginPercent !== null && standaloneMarginPercent < targetMargin ? "danger" : "success"}
                      />
                      <PriceBlock label="Fonte de preço" value={standaloneFipe ? `${standaloneFipe.provider} - ${standaloneFipe.confidence}` : "Manual"} />
                      <PriceBlock label="Referência encontrada" value={standaloneFipe ? `${standaloneFipe.referenceMonth} - ${standaloneFipe.title}` : "Valor informado manualmente"} />
                    </div>
                    {showPlusReport ? (
                      <>
                        <ProviderEvidence
                          title={standaloneFipe?.title ?? compareTitle}
                          makeName={params.compareMakeName ?? standaloneFipe?.makeName}
                          modelName={params.compareModelName ?? standaloneFipe?.modelName}
                          fuelName={params.compareFuelName ?? standaloneFipe?.fuelName}
                          year={Number.isFinite(compareYear) && compareYear > 0 ? compareYear : standaloneFipe?.year}
                          referenceMonth={standaloneFipe?.referenceMonth}
                          referenceQuality={referenceQuality}
                          marketContext={marketContext}
                        />
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                          <StandaloneMetric label="Preço atual FIPE" value={standaloneFipe ? formatCurrency(standaloneFipe.price) : "Sem match"} detail="Referência retornada para o modelo selecionado" />
                          <StandaloneMetric label="Preço sugerido para anunciar" value={formatCurrency(standaloneSuggestedPrice)} detail="Referência comercial atual, não previsão de venda futura" tone="success" />
                          <StandaloneMetric
                            label="Lucro bruto"
                            value={standaloneMargin !== null ? formatCurrency(standaloneMargin) : "Informe custo"}
                            detail={standaloneMarginPercent !== null ? `${standaloneMarginPercent}% sobre o preco sugerido` : "Depende do valor de compra da loja"}
                            tone={standaloneMarginPercent !== null && standaloneMarginPercent < targetMargin ? "danger" : "success"}
                          />
                          <StandaloneMetric
                            label="Amplitude FIPE"
                            value={visibleVariation ? formatCurrency(visibleVariation.absolute) : "Sem janela"}
                            detail={visibleVariation ? `${visibleVariation.percent}% entre menor e maior FIPE da janela` : "Historico insuficiente"}
                          />
                          <StandaloneMetric label="Tendencia FIPE" value={historyTrend.label} detail={historyTrend.detail} tone={historyTrend.tone} />
                          <StandaloneMetric label="Qualidade FIPE" value={referenceQuality} detail={standaloneFipe ? "Match automatico com conferencia recomendada" : "Manual/parcial"} tone={standaloneFipe ? "success" : "warning"} />
                        </div>
                        {standaloneChart}
                      </>
                    ) : null}
                    {showAdvancedReport ? (
                      <>
                        {standaloneFipe?.analytics ? <FipeAnalyticsStrip analytics={standaloneFipe.analytics} /> : null}
                        <RecommendationFunnel decision={standaloneDecision} guidance={standaloneGuidance} marketContext={marketContext} marketLiquidity={marketLiquidity} referenceQuality={referenceQuality} />
                        <LiquiditySensitivityChart insight={marketLiquidity} targetMargin={targetMargin} />
                        <DecisionFormula decision={standaloneDecision} guidance={standaloneGuidance} />
                      </>
                    ) : null}
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

      {vehicles.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Estoque cadastrado</h2>
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
      ) : null}
    </div>
  );
}

async function getPromotionStockVehicles(): Promise<PromotionStockState> {
  try {
    const vehicles = await withDatabaseTimeout(
      prisma.car.findMany({
        orderBy: { updatedAt: "desc" },
        include: promotionStockVehicleInclude,
      }),
    );

    return { vehicles, unavailable: false };
  } catch (error) {
    if (!isRecoverableDatabaseError(error)) {
      throw error;
    }

    console.error("[admin/promotions] Failed to load stock vehicles", error);
    return { vehicles: [], unavailable: true };
  }
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
      <p className="mt-1 text-base font-black leading-6">{value}</p>
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
  marketContext,
}: {
  title: string;
  makeName?: string | null;
  modelName?: string | null;
  fuelName?: string | null;
  year?: number | null;
  referenceMonth?: string | null;
  referenceQuality: string;
  marketContext: MarketContext;
}) {
  const items = [
    ["Marca", makeName],
    ["Modelo", modelName || title],
    ["Combustivel", fuelName],
    ["Ano-modelo", year ? String(year) : null],
    ["Referencia", referenceMonth],
    ["Qualidade", referenceQuality],
    ["UF/escopo", marketContext.requestedUf ? `${marketContext.requestedUf} - FIPE nacional` : "FIPE nacional"],
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Qualidade da referencia FIPE usada na decisao</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Referencia exata usa selecao estruturada de modelo, combustivel e ano. A FIPE/FipeX atual nao filtra por UF; trate mercado local como validacao comercial separada.
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">{marketContext.note}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
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
      detail: "quanto do valor FIPE foi preservado; maior retencao tende a dar mais seguranca na negociacao",
    },
    {
      label: "Variacao mensal",
      value: formatNullablePercent(analytics.changeFromPreviousMonthPercent),
      detail: "mudanca contra a referencia anterior; queda recente pede cautela no valor de entrada",
    },
    {
      label: "Volatilidade",
      value: formatNullableNumber(analytics.priceVolatility),
      detail: "oscilacao da serie; quanto maior, mais importante confirmar FIPE e mercado local",
    },
    {
      label: "Depreciacao anual",
      value: formatNullablePercent(analytics.annualDepreciationRate),
      detail: "ritmo estimado de perda anual usado apenas como leitura de apoio",
    },
    {
      label: "Ciclo do veiculo",
      value: analytics.lifecycleStatus || "Nao informado",
      detail: "classificacao do ciclo FIPE para orientar risco e expectativa de negociacao",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-slate-950">Leitura analitica da FIPE</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Leitura gerencial da serie FIPE. Use para entender estabilidade, risco e poder de negociacao, sem substituir conferencia comercial, estado real do veiculo e FIPE oficial no fechamento.
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
  purchaseCeiling,
  bestPurchasePrice,
  marketLiquidity,
  targetMargin,
  intendedPayment,
  localAveragePrice,
  localSampleCount,
  hasFipe,
}: {
  suggestedPrice: number;
  purchaseCeiling: number | null;
  bestPurchasePrice: number | null;
  marketLiquidity: MarketLiquidityInsight;
  targetMargin: number;
  intendedPayment: number | null;
  localAveragePrice: number | null;
  localSampleCount: number;
  hasFipe: boolean;
}) {
  const maxPayment = bestPurchasePrice ?? purchaseCeiling;
  const riskCeiling = purchaseCeiling;
  const paymentValue = typeof intendedPayment === "number" && intendedPayment > 0 ? intendedPayment : null;
  const hasPayment = paymentValue !== null;
  const hasCeiling = maxPayment !== null;
  const isOverBest = paymentValue !== null && maxPayment !== null && paymentValue > maxPayment;
  const isOverLimit = paymentValue !== null && riskCeiling !== null && paymentValue > riskCeiling;
  const remaining = paymentValue !== null && maxPayment !== null ? maxPayment - paymentValue : null;
  const ceilingText = maxPayment !== null ? formatCurrency(maxPayment) : "Sem referencia";
  const riskCeilingText = riskCeiling !== null ? formatCurrency(riskCeiling) : "Sem referencia";
  const toneClass = isOverLimit
    ? "border-red-200 bg-red-50"
    : isOverBest
      ? "border-amber-200 bg-amber-50"
      : hasPayment && hasCeiling
      ? "border-emerald-200 bg-emerald-50"
      : "border-amber-200 bg-amber-50";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Comprar ate</p>
          <p className={`mt-1 text-2xl font-black ${isOverLimit ? "text-red-700" : hasCeiling ? "text-emerald-700" : "text-amber-700"}`}>
            {ceilingText}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Melhor preco de compra considerando margem minima de {targetMargin}%, FIPE/conservacao e liquidez estimada. Teto tecnico antes de risco: {riskCeilingText}.
          </p>
        </div>
        <div className="rounded-lg border border-white/70 bg-white/75 px-3 py-2 text-sm leading-6 text-slate-700">
          {isOverLimit ? (
            <p>
              O valor de compra da loja passou do teto tecnico de {riskCeilingText}. Acima disso, talvez nao valha a pena sem renegociar, reduzir custo ou aceitar margem menor.
            </p>
          ) : isOverBest ? (
            <p>
              A proposta esta {formatCurrency(Math.abs(remaining ?? 0))} acima do melhor preco para comprar, mas ainda nao passou do teto tecnico. Use como faixa de renegociacao.
            </p>
          ) : hasPayment ? (
            <p>
              {hasCeiling
                ? `O valor de compra da loja esta dentro do melhor preco. Ainda restam ${formatCurrency(Math.max(remaining ?? 0, 0))} de folga para negociar.`
                : `Sem FIPE/preco atual, o painel calcula apenas o anuncio minimo de ${formatCurrency(suggestedPrice)} para preservar a margem informada.`}
            </p>
          ) : (
            <p>
              Informe o valor de compra da loja para comparar contra o melhor preco, o teto tecnico e a margem desejada.
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Base usada: {hasFipe ? "FIPE/FipeX nacional do modelo selecionado" : hasCeiling ? "preco informado manualmente" : "sem referencia de mercado suficiente"}, liquidez {marketLiquidity.score}/100 e {localSampleCount > 0 ? `estoque local com ${localSampleCount} similar(es), media ${formatCurrency(localAveragePrice ?? 0)}` : "sem similares locais suficientes"}.
          </p>
        </div>
      </div>
    </div>
  );
}

function MarketLiquidityPanel({ insight }: { insight: MarketLiquidityInsight }) {
  const toneClass = {
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
    default: "border-slate-200 bg-white",
  }[insight.tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Liquidez e revenda</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-black leading-none text-slate-950">{insight.score}/100</p>
            <p className="text-sm font-semibold text-slate-700">{insight.resaleLikelihoodPercent}% chance relativa de revenda</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{insight.summary}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniDecisionCard label="Comprar ideal" value={insight.bestPurchasePrice ? formatCurrency(insight.bestPurchasePrice) : "Sem base"} detail={`Desconto liquidez: ${insight.liquidityDiscountPercent}%`} />
          <MiniDecisionCard label="Compra competitiva" value={insight.competitivePurchasePrice ? formatCurrency(insight.competitivePurchasePrice) : "Sem base"} detail="Faixa ainda negociavel" />
          <MiniDecisionCard label="Anunciar com giro" value={formatRange(insight.targetListingMin, insight.targetListingMax)} detail={`Confianca ${insight.confidence}`} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {insight.drivers.map((driver) => (
          <div key={driver.label} className={`rounded-lg border px-3 py-2 ${getLiquidityToneClass(driver.tone)}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{driver.label}</p>
              <p className="text-xs font-black text-slate-900">{driver.score}/100</p>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">{driver.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">
        Esta leitura mede liquidez regional e risco comercial. Ela nao altera a FIPE nacional; serve para decidir compra, faixa de anuncio e confianca de revenda.
      </p>
      <details className="mt-3 rounded-lg border border-white/80 bg-white/70 px-3 py-2 text-xs text-slate-700">
        <summary className="cursor-pointer select-none font-semibold text-slate-950">
          Como calculamos a liquidez
        </summary>
        <p className="mt-2 leading-5 text-slate-600">
          Somamos cinco sinais para aproximar o giro real do mercado: {insight.calculation.formula}. O objetivo e mostrar risco de compra e chance relativa de revenda, sem alterar a FIPE nacional.
        </p>
        <div className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
          {insight.calculation.components.map((component) => (
            <div key={component.label} className="grid gap-1 px-3 py-2 sm:grid-cols-[1fr_5rem_5rem] sm:items-center">
              <div>
                <p className="font-semibold text-slate-950">{component.label}</p>
                <p className="text-[11px] leading-4 text-slate-500">{component.detail}</p>
              </div>
              <p className="font-semibold text-slate-600 sm:text-right">{component.weight}%</p>
              <p className="font-black text-slate-950 sm:text-right">{component.contribution} pts</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-4 text-slate-500">{insight.calculation.note}</p>
      </details>
    </div>
  );
}

function MiniDecisionCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black leading-5 text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
    </div>
  );
}

function RecommendationFunnel({
  decision,
  guidance,
  marketContext,
  marketLiquidity,
  referenceQuality,
}: {
  decision: ReturnType<typeof buildPriceDecision>;
  guidance: ReturnType<typeof buildPriceGuidance>;
  marketContext: MarketContext;
  marketLiquidity: MarketLiquidityInsight;
  referenceQuality: string;
}) {
  const overCeiling = decision.purchaseExceedsRecommendedPrice;
  const missingPurchase = decision.purchasePrice === null;
  const steps = [
    {
      label: "1. Referencia",
      value: decision.recommendedPurchaseReferencePrice ? formatCurrency(decision.recommendedPurchaseReferencePrice) : "Sem base",
      detail: `${referenceQuality}. ${marketContext.source}${marketContext.requestedUf ? ` com UF ${marketContext.requestedUf} apenas como contexto.` : "."}`,
      tone: "sky" as const,
    },
    {
      label: "2. Conservacao",
      value: decision.adjustedFipe ? formatCurrency(decision.adjustedFipe) : "Nao aplicada",
      detail: `${decision.conditionLabel} multiplica a FIPE pelo fator comercial de estado real.`,
      tone: "slate" as const,
    },
    {
      label: "3. Teto de compra",
      value: marketLiquidity.bestPurchasePrice ? formatCurrency(marketLiquidity.bestPurchasePrice) : decision.maxRecommendedPurchasePrice ? formatCurrency(decision.maxRecommendedPurchasePrice) : "Sem teto",
      detail: `Melhor compra ajustada por liquidez. Teto tecnico: ${decision.maxRecommendedPurchasePrice ? formatCurrency(decision.maxRecommendedPurchasePrice) : "sem base"}.`,
      tone: overCeiling ? "red" as const : "emerald" as const,
    },
    {
      label: "4. Compra da loja",
      value: decision.purchasePrice ? formatCurrency(decision.purchasePrice) : "Nao informada",
      detail: missingPurchase
        ? "Sem esse valor, margem real e risco de compra ficam parciais."
        : overCeiling
          ? "Valor acima do teto recomendado exige renegociacao ou aceitacao de risco."
          : "Valor dentro do teto calculado para a margem minima.",
      tone: missingPurchase ? "amber" as const : overCeiling ? "red" as const : "emerald" as const,
    },
    {
      label: "5. Preco de anuncio",
      value: decision.suggestedPrice ? formatCurrency(decision.suggestedPrice) : "Sem decisao",
      detail: decision.marginPercent !== null
        ? `Margem estimada de ${decision.marginPercent}% no preco sugerido.`
        : "Preco depende de FIPE, compra ou referencia manual.",
      tone: guidance.tone === "danger" ? "red" as const : guidance.tone === "warning" ? "amber" as const : "emerald" as const,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Funil tecnico da recomendacao</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Mostra por que o motor chegou ao preco: referencia, conservacao, teto, compra da loja e anuncio. UF entra como contexto comercial; o preco FIPE continua nacional no motor atual.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
          guidance.tone === "danger"
            ? "border-red-200 bg-red-50 text-red-700"
            : guidance.tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          {guidance.title}
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((step) => (
          <div key={step.label} className={`rounded-lg border px-3 py-2 ${getFunnelToneClass(step.tone)}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{step.label}</p>
            <p className="mt-1 text-sm font-black leading-5 text-slate-950">{step.value}</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getFunnelToneClass(tone: "slate" | "sky" | "emerald" | "amber" | "red") {
  return {
    slate: "border-slate-200 bg-slate-50",
    sky: "border-sky-200 bg-sky-50",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
    red: "border-red-200 bg-red-50",
  }[tone];
}

function getLiquidityToneClass(tone: "default" | "success" | "warning" | "danger") {
  return {
    default: "border-slate-200 bg-slate-50",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
  }[tone];
}

function LiquiditySensitivityChart({
  insight,
  targetMargin,
}: {
  insight: MarketLiquidityInsight;
  targetMargin: number;
}) {
  const baseline = insight.bestPurchasePrice ?? insight.maxRiskPurchasePrice ?? insight.competitivePurchasePrice;

  if (!baseline) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-950">Sensibilidade compra x margem</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Sem referencia suficiente para montar o grafico tecnico.</p>
      </div>
    );
  }

  const rows = [-8, -4, 0, 4, 8].map((percent) => {
    const purchase = Math.round(baseline * (1 + percent / 100));
    const listing = Math.round(purchase / (1 - targetMargin / 100));
    const risk = insight.maxRiskPurchasePrice && purchase > insight.maxRiskPurchasePrice ? "Acima do teto" : percent <= 0 ? "Boa compra" : "Negociar";
    return { percent, purchase, listing, risk };
  });

  const maxListing = Math.max(...rows.map((row) => row.listing));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Grafico tecnico: compra x margem</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Simula como pequenas mudancas no valor de compra exigem preco de anuncio maior para manter {targetMargin}% de margem. Ajuda a negociar antes de cadastrar no estoque.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          Base {formatCurrency(baseline)}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.percent} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs md:grid-cols-[7rem_1fr_8rem] md:items-center">
            <div>
              <p className="font-semibold text-slate-950">{row.percent > 0 ? "+" : ""}{row.percent}% compra</p>
              <p className="text-slate-500">{formatCurrency(row.purchase)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(12, Math.round((row.listing / maxListing) * 100))}%` }} />
            </div>
            <div className="md:text-right">
              <p className="font-black text-slate-950">{formatCurrency(row.listing)}</p>
              <p className={row.risk === "Acima do teto" ? "font-semibold text-red-700" : row.risk === "Boa compra" ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>{row.risk}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionContextCards({
  conditionLabel,
  conditionEffect,
  targetMargin,
  intendedPayment,
  purchaseCeiling,
  referenceQuality,
  marketContext,
  marketLiquidity,
  hasFipe,
}: {
  conditionLabel: string;
  conditionEffect: string;
  targetMargin: number;
  intendedPayment: number | null;
  purchaseCeiling: number | null;
  referenceQuality: string;
  marketContext: MarketContext;
  marketLiquidity: MarketLiquidityInsight;
  hasFipe: boolean;
}) {
  const overCeiling = intendedPayment !== null && purchaseCeiling !== null && intendedPayment > purchaseCeiling;
  const items = [
    {
      label: "Conservacao aplicada",
      value: conditionLabel,
      detail: conditionEffect,
      tone: "default" as const,
    },
    {
      label: "Margem minima",
      value: `${targetMargin}%`,
      detail: "Meta usada para calcular lucro bruto e teto maximo de compra.",
      tone: "success" as const,
    },
    {
      label: "Compra da loja",
      value: intendedPayment ? formatCurrency(intendedPayment) : "Nao informado",
      detail: purchaseCeiling
        ? `Teto recomendado: ${formatCurrency(purchaseCeiling)}.`
        : "Informe valor de compra e preco para calcular o teto.",
      tone: overCeiling ? "danger" as const : intendedPayment ? "success" as const : "warning" as const,
    },
    {
      label: "Referencia FIPE",
      value: referenceQuality,
      detail: hasFipe ? "Base automatica usada para apoiar a decisao comercial." : "Leitura manual ou parcial; confirme antes de fechar.",
      tone: hasFipe ? "success" as const : "warning" as const,
    },
    {
      label: "UF de mercado",
      value: marketContext.requestedUf ?? "Brasil",
      detail: marketContext.regionalPricingAvailable
        ? "Preco regional conectado ao motor."
        : `Liquidez ${marketLiquidity.score}/100; FIPE atual segue nacional.`,
      tone: marketLiquidity.tone,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <StandaloneMetric key={item.label} label={item.label} value={item.value} detail={item.detail} tone={item.tone} />
      ))}
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
      detail: "preco FIPE multiplicado pelo fator de conservacao do veiculo",
    },
    {
      label: "Minimo pela margem minima",
      value: decision.suggestedByMargin,
      detail: `preco minimo para preservar ${decision.targetMargin}% de margem sobre o anuncio`,
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
            O painel escolhe o maior valor entre FIPE ajustada e minimo pela margem desejada. A referencia FIPE informada so vira fallback quando faltam esses dados. E uma referencia comercial para negociar agora, nao previsao de venda futura.
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
            Lucro bruto = preco sugerido para anunciar menos valor de compra da loja. Margem = lucro bruto dividido pelo preco sugerido para anunciar.
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

      <div className="admin-chart-frame mt-4 rounded-lg">
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
        <p className="rounded-lg bg-slate-50 px-3 py-2">Esta serie vem do historico mensal do provedor. Diferenca menor/maior e a distancia entre a menor e a maior FIPE da janela; valor alto pede mais cautela.</p>
        <p className="rounded-lg bg-slate-50 px-3 py-2">A decisao final continua dependendo do valor de compra da loja, conservacao do veiculo, margem alvo e validacao na FIPE oficial.</p>
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
            Para {vehicleTitle}, use a FIPE encontrada como base atual e combine com valor de compra da loja, conservacao do veiculo e margem alvo.
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
          Selecione uma sugestao de modelo e clique em Gerar recomendacao para consultar valores FIPE por ano-modelo.
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
          <TimelineSummary label="Amplitude FIPE" value={`${formatCurrency(absoluteVariation)} · ${percentVariation}%`} tone={percentVariation >= 8 ? "warning" : "muted"} />
        </div>
      </div>

      <div className="admin-chart-frame mt-4 rounded-lg">
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
        <p className="rounded-lg bg-slate-50 px-3 py-2">Para decisão comercial, combine esta variação com custo pago, conservacao do veiculo e margem alvo.</p>
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
            Para {point.title}, o motor encontrou somente uma referencia de preco. O melhor caminho e usar esta FIPE como base atual, combinar com valor de compra da loja, conservacao do veiculo e margem alvo.
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

function formatRange(min: number | null, max: number | null): string {
  if (!min || !max) return "Sem faixa";
  return `${formatCurrency(min)} a ${formatCurrency(max)}`;
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
      detail: "Historico insuficiente; use a FIPE atual como referencia sem inferir tendencia",
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
      detail: `Oscilou ${formatCurrency(Math.abs(absolute))} no periodo filtrado; leitura sem movimento relevante`,
      tone: "default",
    };
  }

  if (percent > 0) {
    return {
      label: `Subiu ${percent}%`,
      detail: `${formatCurrency(absolute)} acima de ${first.label}; historico favoravel, sem garantia futura`,
      tone: "success",
    };
  }

  return {
    label: `Caiu ${Math.abs(percent)}%`,
    detail: `${formatCurrency(Math.abs(absolute))} abaixo de ${first.label}; negocie compra com mais cautela`,
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
