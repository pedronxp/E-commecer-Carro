"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bike, Car, ChevronDown, Loader2, Search, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

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

const CONDITION_ADJUSTMENTS: Record<string, { label: string; factor: number }> = {
  "": { label: "Sem ajuste", factor: 1 },
  excellent: { label: "Excelente", factor: 1.03 },
  good: { label: "Bom", factor: 1 },
  attention: { label: "Com detalhes", factor: 0.95 },
  repair: { label: "Reparos", factor: 0.9 },
};

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
  const summaryTitle = title.trim() || "Nova comparacao avulsa";
  const hasStructuredSelection = Boolean(selectedFipeMeta.modelId || selectedFipeMeta.modelSlug);
  const selectedFipePrice = parseCurrencyValue(salePrice) || selectedFipeMeta.price || 0;
  const purchaseRecommendation = hasStructuredSelection && selectedFipePrice > 0
    ? buildPurchaseRecommendation({
        fipePrice: selectedFipePrice,
        condition: selectedCondition,
        targetMargin: selectedTargetMargin,
        intendedPayment: cost,
        referenceMonth: selectedFipeMeta.referenceMonth,
      })
    : null;
  const summaryMeta = [
    year.trim() ? `Ano-modelo ${year.trim()}` : null,
    vehicleType === "MOTORCYCLE" ? "Moto" : "Carro",
    selectedFipeMeta.fuelName ? selectedFipeMeta.fuelName : null,
    cost.trim() ? `Valor pretendido ${cost.trim()}` : null,
    salePrice.trim() ? `FIPE ${salePrice.trim()}` : null,
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
          <span className="block text-sm font-semibold text-slate-950">Campos da comparação</span>
          <span className="mt-1 block truncate text-xs text-slate-500">
            {formOpen ? "Preencha ou ajuste os dados antes de comparar." : summaryTitle}
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
            <span>Abra os campos para iniciar uma nova comparação.</span>
          )}
        </div>
      ) : null}

      {formOpen ? <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <div ref={fieldRef} className="relative min-w-0 text-sm font-medium text-slate-700 sm:col-span-2 xl:col-span-2">
          <LabelWithHelp label="Modelo" help="Digite marca, modelo e, para veiculos antigos, inclua o ano-modelo. Exemplo: XRE 300 2010. Ao selecionar uma sugestao FIPE/FipeX, o sistema preenche ano-modelo e preco atual FIPE." htmlFor="compareTitle" />
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
          help="Ano-modelo do veículo na tabela FIPE, não a data da pesquisa."
        />

        <label className="text-sm font-medium text-slate-700">
          <LabelWithHelp label="Tipo" help="Define se a busca FIPE/FipeX deve procurar em carros ou motos." />
          <select
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
        </label>

        <SelectField
          label="Conservacao do veiculo"
          name="condition"
          value={selectedCondition}
          onChange={setSelectedCondition}
          help="Opcional. Ajusta a FIPE pelo estado real do veiculo: excelente pode aceitar preco maior; reparos reduzem a referencia. Se nao souber, deixe sem ajuste."
          options={[
            ["", "Sem ajuste"],
            ["excellent", "Excelente"],
            ["good", "Bom"],
            ["attention", "Com detalhes"],
            ["repair", "Reparos"],
          ]}
        />
        <SelectField
          label="Margem minima desejada"
          name="targetMargin"
          value={selectedTargetMargin}
          onChange={setSelectedTargetMargin}
          help="Opcional. Percentual minimo de lucro sobre o preco sugerido para o negocio fazer sentido. O sistema usa isso para calcular quanto voce pode pagar no veiculo."
          options={[
            ["", "Padrao 12%"],
            ["8", "8%"],
            ["12", "12%"],
            ["15", "15%"],
            ["20", "20%"],
          ]}
        />
        <SelectField
          label="Janela do grafico FIPE"
          name="historyRange"
          defaultValue={historyRange}
          help="Nao e o ano-modelo. Define quantos meses do historico mensal FIPE entram no grafico quando o provedor retorna essa serie."
          options={[
            ["12", "Ultimos 12 meses"],
            ["24", "Ultimos 24 meses"],
            ["60", "Ultimos 5 anos"],
            ["all", "Todo historico"],
          ]}
        />

        <TextField
          label="Valor pretendido de compra"
          name="compareCost"
          value={cost}
          onChange={setCost}
          onBlur={() => setCost(formatCurrencyInput(cost))}
          placeholder="Ex: R$ 95.000,00"
          help="Valor que a loja pagou ou pretende pagar no veiculo. Ele interfere no lucro bruto, margem percentual e teto maximo recomendado de compra."
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
          help="Referência FIPE/FipeX do modelo e ano-modelo selecionados. Pode ser ajustado manualmente."
        />

        <div className="flex items-end">
          <button className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
            {comparing ? "Comparando..." : "Comparar"}
          </button>
        </div>
        <div className="flex items-end">
          <Link
            href="/admin/promotions"
            aria-disabled={!hasAnyValue}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              hasAnyValue
                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <X className="h-4 w-4" />
            Limpar
          </Link>
        </div>
      </div> : null}
      {formOpen ? <p className="text-xs leading-5 text-slate-500">
        Digitar no campo Modelo apenas busca sugestões. A simulação e os KPIs avulsos só são recalculados quando você clica em Comparar.
      </p> : null}

      {formOpen ? <div className="grid min-w-0 gap-3 text-xs leading-5 text-slate-600 lg:grid-cols-4">
        <HelpBox title="Valor pretendido de compra" text="Valor que voce pagou ou pretende pagar. O sistema calcula se esse valor cabe na margem minima e mostra um teto recomendado." />
        <HelpBox title="Conservacao do veiculo" text="Campo opcional para ajustar a FIPE pelo estado real. Se nao souber, deixe sem ajuste." />
        <HelpBox title="Janela do grafico FIPE" text="Mostra historico mensal FIPE quando existir serie do provedor. Nao e ano de fabricacao nem projecao futura." />
        <HelpBox title="Preco sugerido para anunciar" text="Referencia comercial para anuncio e negociacao agora. Nao e previsao de venda futura nem garantia de fechamento." />
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

  return (
    <label className="min-w-0 text-sm font-medium text-slate-700">
      <LabelWithHelp label={label} help={help} />
      <input
        name={name}
        {...inputStateProps}
        onBlur={onBlur}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
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

  return (
    <label className="min-w-0 text-sm font-medium text-slate-700">
      <LabelWithHelp label={label} help={help} />
      <select
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
    </label>
  );
}

type PurchaseRecommendation = {
  adjustedFipe: number;
  conditionLabel: string;
  margin: number;
  maxPayment: number;
  intendedPayment: number;
  referenceMonth?: string;
};

function PurchaseRecommendationHint({ recommendation }: { recommendation: PurchaseRecommendation }) {
  const hasPayment = recommendation.intendedPayment > 0;
  const delta = recommendation.maxPayment - recommendation.intendedPayment;
  const isAbove = hasPayment && delta < 0;
  const toneClass = isAbove
    ? "border-red-200 bg-red-50"
    : hasPayment
      ? "border-emerald-200 bg-emerald-50"
      : "border-amber-200 bg-amber-50";

  return (
    <div className={`sm:col-span-2 xl:col-span-4 2xl:col-span-6 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Recomendacao de compra</p>
          <p className="mt-1 font-semibold leading-6 text-slate-950">
            O sistema propoe pagar ate <span className="font-black text-emerald-700">{formatCurrency(recommendation.maxPayment)}</span>. Acima disso talvez nao valha a pena para a margem minima de {recommendation.margin}%.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Base: API interna de consulta FIPE/FipeX, FIPE ajustada por conservacao ({recommendation.conditionLabel}) e referencia {recommendation.referenceMonth || "mais recente"}. Confirme a FIPE oficial no fechamento.
          </p>
        </div>
        <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-xs leading-5 text-slate-700 lg:w-72">
          <p className="font-semibold text-slate-950">Como ler</p>
          <p className="mt-1">
            FIPE ajustada: <span className="font-semibold">{formatCurrency(recommendation.adjustedFipe)}</span>
          </p>
          {isAbove ? (
            <p className="mt-1 font-semibold text-red-700">
              Valor informado esta {formatCurrency(Math.abs(delta))} acima do teto.
            </p>
          ) : hasPayment ? (
            <p className="mt-1 font-semibold text-emerald-700">
              Valor informado esta dentro do teto, com folga de {formatCurrency(delta)}.
            </p>
          ) : (
            <p className="mt-1 text-slate-600">Preencha o valor pretendido para comparar contra o teto.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareLoadingOverlay({ vehicleType, slow }: { vehicleType: VehicleType; slow: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-slate-950/45 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-2xl shadow-slate-950/20">
        <div className="relative mx-auto h-28 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
          <div className="absolute inset-x-5 top-1/2 h-0.5 bg-emerald-200" />
          <div className="absolute left-7 top-1/2 -mt-8 flex animate-[compareDrive_2.2s_ease-in-out_infinite] items-center gap-7 text-emerald-800">
            <Car className={`h-11 w-11 animate-[vehiclePrimary_2.2s_ease-in-out_infinite] ${vehicleType === "CAR" ? "opacity-100" : "opacity-45"}`} />
            <Bike className={`h-11 w-11 animate-[vehicleSecondary_2.2s_ease-in-out_infinite] ${vehicleType === "MOTORCYCLE" ? "opacity-100" : "opacity-45"}`} />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-950">Comparando FIPE, margem e valor pretendido</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Aguarde enquanto o painel monta a recomendação comercial.</p>
        {slow ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
            Esta comparacao esta demorando mais que o normal. Se a tela nao avancar, atualize a pagina e tente novamente.
          </p>
        ) : null}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-[compareProgress_2.2s_ease-in-out_infinite] rounded-full bg-emerald-700" />
        </div>
      </div>
      <style jsx>{`
        @keyframes compareDrive {
          0% {
            transform: translateX(-28px);
            opacity: 0.65;
          }
          50% {
            transform: translateX(170px);
            opacity: 1;
          }
          100% {
            transform: translateX(-28px);
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
}

function LabelWithHelp({ label, help, htmlFor }: { label: string; help?: string; htmlFor?: string }) {
  const tooltipId = help ? `help-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
  const content = (
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
  );

  return htmlFor ? (
    <label htmlFor={htmlFor} className="inline-flex">
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
  referenceMonth,
}: {
  fipePrice: number;
  condition: string;
  targetMargin: string;
  intendedPayment: string;
  referenceMonth?: string;
}): PurchaseRecommendation {
  const conditionConfig = CONDITION_ADJUSTMENTS[condition] ?? CONDITION_ADJUSTMENTS[""];
  const margin = normalizeMargin(targetMargin);
  const adjustedFipe = Math.round(fipePrice * conditionConfig.factor);
  const maxPayment = Math.round(adjustedFipe * (1 - margin / 100));

  return {
    adjustedFipe,
    conditionLabel: conditionConfig.label,
    margin,
    maxPayment,
    intendedPayment: parseCurrencyValue(intendedPayment),
    referenceMonth,
  };
}

function normalizeMargin(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 80 ? parsed : 12;
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
