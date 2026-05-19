"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgePercent, Bike, Car, CheckCircle2, ChevronDown, CircleDollarSign, Loader2, Search, Target, X, type LucideIcon } from "lucide-react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildMarketLiquidityInsight } from "@/lib/market-liquidity";
import { getPriceConditionOption, normalizeTargetMargin, priceConditionSelectOptions } from "@/lib/price-comparison";
import { marketUfOptions, normalizeMarketUf, recommendationReportModeOptions } from "@/lib/pricing-report";

type VehicleType = "CAR" | "MOTORCYCLE";

type FipeSuggestion = {
  title: string;
  makeName: string;
  modelName: string;
  fuelName?: string;
  year: number;
  price: number;
  referenceMonth: string;
  provider: "FipeX";
  modelId?: string;
  modelSlug?: string;
  fuelId?: string;
  fuelAcronym?: string;
};

type SelectedFipeMeta = Partial<Pick<
  FipeSuggestion,
  "modelId" | "modelSlug" | "fuelId" | "fuelAcronym" | "makeName" | "modelName" | "fuelName" | "year" | "price" | "referenceMonth"
>>;

export function PromotionCompareForm({
  view,
  condition,
  targetMargin,
  timelineRange,
  historyRange,
  initialTitle,
  initialYear,
  initialType,
  initialCost,
  initialSalePrice,
  initialModelId,
  initialModelSlug,
  initialFuelId,
  initialFuelAcronym,
  initialMarketUf,
  initialReportMode,
  initialMakeName,
  initialModelName,
  initialFuelName,
}: {
  view: string;
  condition: string;
  targetMargin: string;
  timelineRange: string;
  historyRange: string;
  initialTitle: string;
  initialYear: string;
  initialType: VehicleType;
  initialCost: string;
  initialSalePrice: string;
  initialModelId?: string;
  initialModelSlug?: string;
  initialFuelId?: string;
  initialFuelAcronym?: string;
  initialMarketUf?: string;
  initialReportMode?: string;
  initialMakeName?: string;
  initialModelName?: string;
  initialFuelName?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [year, setYear] = useState(initialYear);
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialType);
  const [cost, setCost] = useState(formatCurrencyInput(initialCost));
  const [salePrice, setSalePrice] = useState(formatCurrencyInput(initialSalePrice));
  const [selectedCondition, setSelectedCondition] = useState(condition);
  const [selectedTargetMargin, setSelectedTargetMargin] = useState(targetMargin);
  const [selectedMarketUf, setSelectedMarketUf] = useState(initialMarketUf ?? "");
  const [selectedReportMode, setSelectedReportMode] = useState(initialReportMode ?? "basic");
  const [suggestions, setSuggestions] = useState<FipeSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedFipeMeta, setSelectedFipeMeta] = useState<SelectedFipeMeta>({
    modelId: initialModelId,
    modelSlug: initialModelSlug,
    fuelId: initialFuelId,
    fuelAcronym: initialFuelAcronym,
    makeName: initialMakeName,
    modelName: initialModelName,
    fuelName: initialFuelName,
    year: Number(initialYear) || undefined,
    price: parseCurrencyValue(initialSalePrice) || undefined,
  });
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [compareSlow, setCompareSlow] = useState(false);
  const [formOpen, setFormOpen] = useState(() => !initialTitle.trim());
  const fieldRef = useRef<HTMLDivElement>(null);
  const slowTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 2) return;

    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: normalizedTitle,
          vehicleType,
          includeOlderModels: "1",
        });
        const response = await fetch(`/api/admin/fipe-suggestions?${params.toString()}`);
        if (!response.ok) return;

        const payload = (await response.json()) as { suggestions?: FipeSuggestion[] };
        setSuggestions(payload.suggestions ?? []);
        setSuggestionsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [title, vehicleType]);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  function selectSuggestion(suggestion: FipeSuggestion) {
    setTitle(suggestion.title);
    setYear(String(suggestion.year));
    setSalePrice(formatCurrency(suggestion.price));
    setSelectedFipeMeta({
      modelId: suggestion.modelId,
      modelSlug: suggestion.modelSlug,
      fuelId: suggestion.fuelId,
      fuelAcronym: suggestion.fuelAcronym,
      makeName: suggestion.makeName,
      modelName: suggestion.modelName,
      fuelName: suggestion.fuelName,
      year: suggestion.year,
      price: suggestion.price,
      referenceMonth: suggestion.referenceMonth,
    });
    setSuggestionsOpen(false);
  }

  function clearSelectedFipe() {
    setSelectedFipeMeta({});
    setSalePrice("");
  }

  function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (comparing) return;

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      const text = String(value).trim();
      if (text) params.set(key, text);
    });

    setSuggestionsOpen(false);
    setComparing(true);
    setCompareSlow(false);
    window.dispatchEvent(new Event("lima:admin-collapse-sidebar"));

    if (slowTimerRef.current) window.clearTimeout(slowTimerRef.current);
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);

    slowTimerRef.current = window.setTimeout(() => {
      setCompareSlow(true);
    }, 7000);

    redirectTimerRef.current = window.setTimeout(() => {
      const query = params.toString();
      router.push(query ? `/admin/promotions?${query}` : "/admin/promotions");
    }, 3200);
  }

  const hasAnyValue = Boolean(title.trim() || year.trim() || cost.trim() || salePrice.trim());
  const summaryTitle = title.trim() || "Nova simulacao sem cadastro";
  const hasStructuredSelection = Boolean(selectedFipeMeta.modelId || selectedFipeMeta.modelSlug);
  const selectedFipePrice = parseCurrencyValue(salePrice) || selectedFipeMeta.price || 0;
  const selectedConditionOption = getPriceConditionOption(selectedCondition);
  const selectedMargin = normalizeTargetMargin(selectedTargetMargin);
  const purchaseRecommendation = hasStructuredSelection && selectedFipePrice > 0
    ? buildPurchaseRecommendation({
        fipePrice: selectedFipePrice,
        condition: selectedCondition,
        targetMargin: selectedTargetMargin,
        intendedPayment: cost,
        marketUf: selectedMarketUf,
        vehicleType,
        referenceMonth: selectedFipeMeta.referenceMonth,
      })
    : null;
  const summaryMeta = [
    year.trim() ? `Ano-modelo ${year.trim()}` : null,
    vehicleType === "MOTORCYCLE" ? "Moto" : "Carro",
    selectedFipeMeta.fuelName ? selectedFipeMeta.fuelName : null,
    cost.trim() ? `Compra da loja ${cost.trim()}` : null,
    salePrice.trim() ? `FIPE ${salePrice.trim()}` : null,
    selectedMarketUf ? `UF ${selectedMarketUf}` : null,
    selectedReportMode !== "basic" ? `Relatorio ${selectedReportMode}` : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <form className="relative mt-5 space-y-4" onSubmit={handleCompare}>
      <input type="hidden" name="view" value={view === "all" ? "" : view} />
      <input type="hidden" name="compareModelId" value={selectedFipeMeta.modelId ?? ""} />
      <input type="hidden" name="compareModelSlug" value={selectedFipeMeta.modelSlug ?? ""} />
      <input type="hidden" name="compareFuelId" value={selectedFipeMeta.fuelId ?? ""} />
      <input type="hidden" name="compareFuelAcronym" value={selectedFipeMeta.fuelAcronym ?? ""} />
      <input type="hidden" name="compareMakeName" value={selectedFipeMeta.makeName ?? ""} />
      <input type="hidden" name="compareModelName" value={selectedFipeMeta.modelName ?? ""} />
      <input type="hidden" name="compareFuelName" value={selectedFipeMeta.fuelName ?? ""} />
      <input type="hidden" name="timelineRange" value={timelineRange} />

      {comparing ? <CompareLoadingOverlay vehicleType={vehicleType} slow={compareSlow} /> : null}

      <button
        type="button"
        onClick={() => setFormOpen((value) => !value)}
        aria-expanded={formOpen}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-950">Dados da simulacao sem cadastro</span>
          <span className="mt-1 block min-w-0 truncate text-xs text-slate-500">
            {formOpen ? "Preencha para calcular FIPE, margem, teto de compra e preco de anuncio." : summaryTitle}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-emerald-700">
          {formOpen ? "Ocultar" : "Editar"}
          <ChevronDown className={`h-4 w-4 transition ${formOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {!formOpen ? (
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {summaryMeta.length > 0 ? summaryMeta.map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold">
              {item}
            </span>
          )) : (
            <span>Abra os campos para iniciar uma nova simulacao.</span>
          )}
        </div>
      ) : null}

      {formOpen ? <div className="admin-form-grid grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <div ref={fieldRef} className="relative min-w-0 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-2">
          <LabelWithHelp label="Modelo" htmlFor="compareTitle" />
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="compareTitle"
              name="compareTitle"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                setSelectedFipeMeta({});

                if (nextTitle.trim().length < 2) {
                  setSuggestions([]);
                  setSuggestionsOpen(false);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestionsOpen(true);
              }}
              autoComplete="off"
              placeholder="Digite marca ou modelo"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-9 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {loading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-700" /> : null}
          </div>
          <FieldHelp>
            Selecione uma sugestao FIPE/FipeX para preencher ano-modelo, combustivel e preco FIPE automaticamente.
          </FieldHelp>

          {suggestionsOpen && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.title}-${suggestion.year}-${suggestion.referenceMonth}-${suggestion.fuelName ?? "fuel"}`}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-emerald-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-950">{suggestion.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {suggestion.makeName} / {suggestion.modelName}
                      {suggestion.fuelName ? ` / ${suggestion.fuelName}` : ""} / {suggestion.year}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                      Ref. {suggestion.referenceMonth}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-emerald-700">{formatCurrency(suggestion.price)}</span>
                </button>
              ))}
            </div>
          ) : null}

          {hasStructuredSelection ? (
            <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-slate-700">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid min-w-0 gap-1 sm:grid-cols-2">
                  <StructuredItem label="Marca" value={selectedFipeMeta.makeName} />
                  <StructuredItem label="Modelo" value={selectedFipeMeta.modelName} />
                  <StructuredItem label="Combustivel" value={selectedFipeMeta.fuelName || selectedFipeMeta.fuelAcronym} />
                  <StructuredItem label="Referencia" value={selectedFipeMeta.referenceMonth} />
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFipe}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Trocar modelo
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <TextField
          label="Ano-modelo"
          name="compareYear"
          value={year}
          onChange={setYear}
          placeholder="Ex: 2020"
          help="Ano-modelo usado na tabela FIPE, nao a data da pesquisa."
        />

        <div className="min-w-0 text-sm font-medium text-slate-700">
          <label htmlFor="compareType" className="admin-field-label inline-flex max-w-full">
            <LabelWithHelp label="Tipo" />
          </label>
          <select
            id="compareType"
            name="compareType"
            value={vehicleType}
            onChange={(event) => {
              setVehicleType(event.target.value === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR");
              setSuggestions([]);
              setSelectedFipeMeta({});
              setSuggestionsOpen(false);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="CAR">Carro</option>
            <option value="MOTORCYCLE">Moto</option>
          </select>
          <FieldHelp>Define a base FIPE/FipeX: carros ou motos.</FieldHelp>
        </div>

        <SelectField
          label="Conservacao do veiculo"
          name="condition"
          value={selectedCondition}
          onChange={setSelectedCondition}
          help="Ajuste comercial pelo estado de conservacao do veiculo; nao e filtro por UF/estado."
          options={priceConditionSelectOptions.map((option) => [option.key, option.optionLabel])}
        />
        <SelectField
          label="Margem minima desejada"
          name="targetMargin"
          value={selectedTargetMargin}
          onChange={setSelectedTargetMargin}
          help="Meta minima de lucro. Ela define o teto de compra; acima dele a negociacao perde margem."
          options={[
            ["", "Padrao 12%"],
            ["8", "8%"],
            ["12", "12%"],
            ["15", "15%"],
            ["20", "20%"],
          ]}
        />
        <SelectField
          label="Historico mensal FIPE"
          name="historyRange"
          defaultValue={historyRange}
          help="Meses de historico FIPE exibidos quando o provedor retorna serie mensal."
          options={[
            ["12", "Ultimos 12 meses"],
            ["24", "Ultimos 24 meses"],
            ["60", "Ultimos 5 anos"],
            ["all", "Todo historico"],
          ]}
        />
        <SelectField
          label="Linha por ano-modelo"
          name="timelineRange"
          defaultValue={timelineRange || "available"}
          help="Alternativa ao historico mensal: controla os anos exibidos sem projetar preco."
          options={[
            ["available", "FIPE encontrada"],
            ["selected", "Ate ano-modelo"],
            ["current", "Ano-modelo ate hoje"],
          ]}
        />
        <SelectField
          label="UF de mercado"
          name="compareMarketUf"
          value={selectedMarketUf}
          onChange={setSelectedMarketUf}
          help="Contexto comercial da loja. O motor atual ainda usa FIPE/FipeX nacional, sem preco regional por UF."
          options={marketUfOptions.map((option) => [option.value, option.label])}
        />
        <SelectField
          label="Modo do relatorio"
          name="compareReportMode"
          value={selectedReportMode}
          onChange={setSelectedReportMode}
          help="Basico reduz ruido. Plus adiciona leitura gerencial. Avancado mostra funil, formula e graficos tecnicos."
          options={recommendationReportModeOptions.map((option) => [option.value, option.label])}
        />

        <TextField
          label="Valor de compra da loja"
          name="compareCost"
          value={cost}
          onChange={setCost}
          onBlur={() => setCost(formatCurrencyInput(cost))}
          placeholder="Ex: R$ 95.000,00"
          help="Desembolso total que a loja pretende assumir: proposta ao vendedor, preparacao prevista, taxas e custos antes do anuncio."
        />
        {purchaseRecommendation ? (
          <PurchaseRecommendationHint recommendation={purchaseRecommendation} />
        ) : null}
        <TextField
          label="Preço atual FIPE"
          name="compareSalePrice"
          value={salePrice}
          onChange={setSalePrice}
          onBlur={() => setSalePrice(formatCurrencyInput(salePrice))}
          placeholder="Preenchido ao selecionar"
          help="Referencia FIPE/FipeX do modelo e ano-modelo selecionados. Pode ser ajustada manualmente."
        />
      </div> : null}
      {formOpen ? (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <p className="text-xs leading-5 text-slate-500 sm:mr-auto">
            O campo Modelo apenas busca sugestoes. A recomendacao e recalculada quando voce clica em Gerar recomendacao.
          </p>
          <button className="admin-action-button w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-64">
            {comparing ? "Gerando..." : "Gerar recomendacao"}
          </button>
          <Link
            href="/admin/promotions"
            aria-disabled={!hasAnyValue}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition sm:w-40 ${
              hasAnyValue
                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <X className="h-4 w-4" />
            Limpar
          </Link>
        </div>
      ) : null}

      {formOpen ? (
        <CompareProcessGuide
          vehicleType={vehicleType}
          conditionLabel={selectedConditionOption.optionLabel}
          targetMargin={selectedMargin}
          hasPurchaseValue={Boolean(cost.trim())}
        />
      ) : null}

      {formOpen ? <div className="grid min-w-0 gap-3 text-xs leading-5 text-slate-600 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <HelpBox title="Valor de compra da loja" text="Custo que a loja pagou ou quer pagar antes de cadastrar no estoque. O sistema compara esse valor ao teto para preservar a margem minima." />
        <HelpBox title="Margem minima desejada" text={`Meta atual: ${selectedMargin}%. O teto de compra e calculado para preservar essa margem sobre o preco sugerido.`} />
        <HelpBox title="Conservacao do veiculo" text={`${selectedConditionOption.optionLabel}: ${selectedConditionOption.effect} Ajuste interno pelo estado real do veiculo, nao por UF.`} />
        <HelpBox title="Janela do grafico FIPE" text="Mostra historico mensal FIPE quando existir serie do provedor. Nao e ano de fabricacao nem projecao futura." />
        <HelpBox title="Preco sugerido para anunciar" text="Referencia comercial para anuncio e negociacao agora. Nao e previsao de venda futura nem garantia de fechamento." />
        <HelpBox title="FIPE por estado/UF" text="O provider atual retorna referencia FIPE/FipeX nacional. Regionalizacao por UF exigiria outra fonte de mercado ou regra local separada." />
        <HelpBox title="Relatorio" text="Basico mostra decisao enxuta. Plus e Avancado liberam mais contexto, funil e graficos quando houver resultado." />
      </div> : null}
    </form>
  );
}

function StructuredItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <span className="min-w-0">
      <span className="font-semibold text-slate-500">{label}: </span>
      <span className="font-semibold text-slate-900">{value || "Nao informado"}</span>
    </span>
  );
}

function TextField({
  label,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  help,
}: {
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  help?: string;
}) {
  const inputStateProps =
    value !== undefined
      ? { value, onChange: onChange ? (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) : undefined }
      : { defaultValue };
  const inputId = `field-${name}`;

  return (
    <div className="min-w-0 text-sm font-medium text-slate-700">
      <label htmlFor={inputId} className="admin-field-label inline-flex max-w-full">
        <LabelWithHelp label={label} />
      </label>
      <input
        id={inputId}
        name={name}
        {...inputStateProps}
        onBlur={onBlur}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      <FieldHelp>{help}</FieldHelp>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  defaultValue,
  onChange,
  options,
  help,
}: {
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<[string, string]>;
  help?: string;
}) {
  const selectStateProps =
    value !== undefined
      ? { value, onChange: onChange ? (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value) : undefined }
      : { defaultValue };
  const selectId = `field-${name}`;

  return (
    <div className="min-w-0 text-sm font-medium text-slate-700">
      <label htmlFor={selectId} className="admin-field-label inline-flex max-w-full">
        <LabelWithHelp label={label} />
      </label>
      <select
        id={selectId}
        name={name}
        {...selectStateProps}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      <FieldHelp>{help}</FieldHelp>
    </div>
  );
}

function FieldHelp({ children }: { children?: ReactNode }) {
  if (!children) return null;

  return (
    <p className="admin-field-help mt-1 text-[11px] font-medium leading-4 text-slate-500">
      {children}
    </p>
  );
}

function CompareProcessGuide({
  vehicleType,
  conditionLabel,
  targetMargin,
  hasPurchaseValue,
}: {
  vehicleType: VehicleType;
  conditionLabel: string;
  targetMargin: number;
  hasPurchaseValue: boolean;
}) {
  const vehicleLabel = vehicleType === "MOTORCYCLE" ? "moto" : "carro";
  const VehicleIcon = vehicleType === "MOTORCYCLE" ? Bike : Car;
  const steps: Array<{ icon: LucideIcon; title: string; detail: string; active?: boolean }> = [
    {
      icon: VehicleIcon,
      title: "1. FIPE",
      detail: `Seleciona a referencia do ${vehicleLabel}, ano-modelo, combustivel e preco atual.`,
      active: true,
    },
    {
      icon: CheckCircle2,
      title: "2. Conservacao",
      detail: `${conditionLabel} ajusta a FIPE conforme o estado real informado.`,
      active: true,
    },
    {
      icon: BadgePercent,
      title: "3. Margem",
      detail: `${targetMargin}% define o lucro minimo e o teto recomendado de compra.`,
      active: true,
    },
    {
      icon: CircleDollarSign,
      title: "4. Compra",
      detail: hasPurchaseValue
        ? "Valor da loja sera comparado ao teto para mostrar folga ou risco."
        : "Informe o valor que a loja quer pagar para fechar a leitura de margem.",
      active: hasPurchaseValue,
    },
    {
      icon: Target,
      title: "5. Recomendacao",
      detail: "Gera preco sugerido para anunciar, lucro bruto, margem e qualidade da referencia.",
    },
  ];

  return (
    <div className="grid min-w-0 gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2 xl:grid-cols-5">
      {steps.map((step) => {
        const StepIcon = step.icon;

        return (
          <div
            key={step.title}
            className={`min-w-0 rounded-lg border px-3 py-2 ${
              step.active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${step.active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                <StepIcon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block font-black text-slate-950">{step.title}</span>
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{step.detail}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type PurchaseRecommendation = {
  adjustedFipe: number;
  conditionLabel: string;
  margin: number;
  bestPayment: number;
  maxPayment: number;
  intendedPayment: number;
  liquidityScore: number;
  resaleLikelihoodPercent: number;
  referenceMonth?: string;
};

function PurchaseRecommendationHint({ recommendation }: { recommendation: PurchaseRecommendation }) {
  const hasPayment = recommendation.intendedPayment > 0;
  const delta = recommendation.bestPayment - recommendation.intendedPayment;
  const isAbove = hasPayment && delta < 0;
  const toneClass = isAbove
    ? "border-red-200 bg-red-50"
    : hasPayment
      ? "border-emerald-200 bg-emerald-50"
      : "border-amber-200 bg-amber-50";

  return (
    <div className={`sm:col-span-2 lg:col-span-3 2xl:col-span-4 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Melhor preco para comprar</p>
          <p className="mt-1 font-semibold leading-6 text-slate-950">
            Para preservar margem e liquidez, a loja deveria comprar ate <span className="font-black text-emerald-700">{formatCurrency(recommendation.bestPayment)}</span>. Teto tecnico: {formatCurrency(recommendation.maxPayment)}.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Base: FIPE/FipeX nacional, conservacao ({recommendation.conditionLabel}), margem {recommendation.margin}%, liquidez {recommendation.liquidityScore}/100 e referencia {recommendation.referenceMonth || "mais recente"}.
          </p>
        </div>
        <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-xs leading-5 text-slate-700 lg:w-72">
          <p className="font-semibold text-slate-950">Como ler</p>
          <p className="mt-1">
            FIPE ajustada: <span className="font-semibold">{formatCurrency(recommendation.adjustedFipe)}</span>
          </p>
          {isAbove ? (
            <p className="mt-1 font-semibold text-red-700">
              Valor de compra da loja esta {formatCurrency(Math.abs(delta))} acima do melhor preco.
            </p>
          ) : hasPayment ? (
            <p className="mt-1 font-semibold text-emerald-700">
              Valor de compra da loja esta dentro da faixa, com folga de {formatCurrency(delta)}. Revenda relativa: {recommendation.resaleLikelihoodPercent}%.
            </p>
          ) : (
            <p className="mt-1 text-slate-600">Preencha o valor de compra da loja para comparar contra o teto.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareLoadingOverlay({ vehicleType, slow }: { vehicleType: VehicleType; slow: boolean }) {
  const VehicleIcon = vehicleType === "MOTORCYCLE" ? Bike : Car;
  const vehicleLabel = vehicleType === "MOTORCYCLE" ? "moto" : "carro";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const overlay = (
    <div
      data-visual-check="compare-loading"
      className="fixed inset-0 z-[9999] flex h-dvh w-full items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/97 p-3 text-white backdrop-blur-2xl sm:p-4"
    >
      <div className="absolute inset-0 bg-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.22),transparent_24rem),radial-gradient(circle_at_78%_78%,rgba(15,23,42,0.92),transparent_30rem)]" />
      <div className="relative my-3 w-[min(56rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-emerald-300/30 bg-slate-950/97 p-4 text-center shadow-2xl shadow-emerald-950/40 sm:w-[min(56rem,calc(100vw-2rem))] sm:p-5 lg:p-6">
        <div className="mb-5 flex min-w-0 items-center justify-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lime-300/70 bg-lime-400/10 text-lime-300 shadow-lg shadow-lime-500/15">
            <span className="absolute h-7 w-7 rounded-full border-2 border-lime-300/80" />
            <span className="absolute h-0.5 w-7 bg-lime-300/70" />
            <span className="absolute h-7 w-0.5 bg-lime-300/70" />
            <span className="absolute h-7 w-0.5 rotate-45 bg-lime-300/70" />
            <span className="absolute h-7 w-0.5 -rotate-45 bg-lime-300/70" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-xl font-black leading-tight tracking-normal sm:text-2xl">
              <span className="text-lime-300">Lima</span> Automotiva
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-300 sm:text-sm">Inteligencia para valorizar seu negocio.</p>
          </div>
        </div>
        <div className="relative mx-auto min-h-28 overflow-hidden rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-7">
          <div className="absolute inset-x-5 top-1/2 h-0.5 bg-emerald-200/60" />
          <div className="absolute top-1/2 -mt-5 animate-[compareDrive_2.4s_ease-in-out_infinite] text-lime-300">
            <VehicleIcon className="h-10 w-10 drop-shadow-[0_0_16px_rgba(132,204,22,0.65)]" />
          </div>
          <div className="relative grid grid-cols-5 items-center gap-2 text-lime-300/85">
            <VehicleIcon className="mx-auto h-8 w-8 opacity-90" />
            <BadgePercent className="mx-auto h-8 w-8 opacity-70" />
            <CircleDollarSign className="mx-auto h-8 w-8 opacity-70" />
            <Target className="mx-auto h-8 w-8 opacity-70" />
            <CheckCircle2 className="mx-auto h-8 w-8 opacity-70" />
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-5">
          <LoadingStep icon={VehicleIcon} label="FIPE" detail={`Referencia do ${vehicleLabel}`} active />
          <LoadingStep icon={CheckCircle2} label="Conservacao" detail="Ajuste pelo estado real" active />
          <LoadingStep icon={BadgePercent} label="Margem" detail="Meta minima desejada" active />
          <LoadingStep icon={CircleDollarSign} label="Compra" detail="Valor de entrada da loja" />
          <LoadingStep icon={Target} label="Preco" detail="Recomendacao comercial" />
        </div>
        <p className="mt-5 text-lg font-black leading-tight text-white sm:text-xl">Analisando dados para gerar sua recomendacao.</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Estamos comparando FIPE, conservacao do {vehicleLabel}, margem e valor de compra da loja para encontrar o melhor preco de anuncio.
        </p>
        {slow ? (
          <p className="mt-4 rounded-lg border border-amber-300/50 bg-amber-300/12 px-3 py-2 text-xs font-semibold leading-5 text-amber-100">
            Esta comparacao esta demorando mais que o normal. Se a tela nao avancar, atualize a pagina e tente novamente.
          </p>
        ) : null}
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-2/5 animate-[compareProgress_2.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300 shadow-lg shadow-lime-400/30" />
        </div>
      </div>
      <style jsx>{`
        @keyframes compareDrive {
          0% {
            left: 1.25rem;
            opacity: 0.65;
          }
          50% {
            left: calc(100% - 4rem);
            opacity: 1;
          }
          100% {
            left: 1.25rem;
            opacity: 0.65;
          }
        }

        @keyframes compareProgress {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(220%);
          }
        }

        @keyframes vehiclePrimary {
          0%, 48% {
            transform: scale(1);
            opacity: 1;
          }
          50%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
        }

        @keyframes vehicleSecondary {
          0%, 48% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50%, 100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(overlay, document.body);
}

function LoadingStep({
  icon: Icon,
  label,
  detail,
  active,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className="relative z-[1] flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-slate-900/72 p-3 sm:flex-col sm:text-center">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${active ? "border-lime-300/70 bg-lime-400/10 text-lime-300 shadow-lg shadow-lime-400/15" : "border-slate-500 bg-slate-800 text-slate-400"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-black ${active ? "text-lime-300" : "text-slate-300"}`}>{label}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{detail}</span>
      </span>
    </div>
  );
}

function LabelWithHelp({ label, help, htmlFor }: { label: string; help?: string; htmlFor?: string }) {
  const tooltipId = help ? `help-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
  const content = (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
      <span className="min-w-0 break-words">{label}</span>
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
            className="pointer-events-none invisible absolute left-1/2 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-normal break-words rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-left text-[11px] font-medium normal-case leading-4 text-white opacity-0 shadow-xl transition group-hover/help:visible group-hover/help:opacity-100 group-focus-within/help:visible group-focus-within/help:opacity-100"
          >
            {help}
          </span>
        </span>
      ) : null}
    </span>
  );

  return htmlFor ? (
    <label htmlFor={htmlFor} className="admin-field-label inline-flex max-w-full">
      {content}
    </label>
  ) : (
    content
  );
}

function HelpBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 break-words">
      <span className="font-semibold text-slate-950">{title}: </span>
      {text}
    </div>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCurrencyInput(value: string): string {
  const parsed = parseCurrencyValue(value);
  return parsed > 0 ? formatCurrency(parsed) : value;
}

function buildPurchaseRecommendation({
  fipePrice,
  condition,
  targetMargin,
  intendedPayment,
  marketUf,
  vehicleType,
  referenceMonth,
}: {
  fipePrice: number;
  condition: string;
  targetMargin: string;
  intendedPayment: string;
  marketUf: string;
  vehicleType: VehicleType;
  referenceMonth?: string;
}): PurchaseRecommendation {
  const conditionConfig = getPriceConditionOption(condition);
  const margin = normalizeTargetMargin(targetMargin);
  const adjustedFipe = Math.round(fipePrice * conditionConfig.factor);
  const maxPayment = Math.round(adjustedFipe * (1 - margin / 100));
  const liquidity = buildMarketLiquidityInsight({
    marketUf: normalizeMarketUf(marketUf),
    vehicleType,
    referencePrice: fipePrice,
    adjustedFipe,
    suggestedPrice: fipePrice,
    purchasePrice: parseCurrencyValue(intendedPayment),
    maxRecommendedPurchasePrice: maxPayment,
    targetMargin: margin,
  });

  return {
    adjustedFipe,
    conditionLabel: conditionConfig.optionLabel,
    margin,
    bestPayment: liquidity.bestPurchasePrice ?? maxPayment,
    maxPayment,
    intendedPayment: parseCurrencyValue(intendedPayment),
    liquidityScore: liquidity.score,
    resaleLikelihoodPercent: liquidity.resaleLikelihoodPercent,
    referenceMonth,
  };
}

function parseCurrencyValue(value: string): number {
  const clean = value.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return 0;

  if (clean.includes(",")) {
    return Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
  }

  const dotCount = clean.split(".").length - 1;
  if (dotCount > 1) return Number(clean.replace(/\./g, "")) || 0;

  return Number(clean) || 0;
}
