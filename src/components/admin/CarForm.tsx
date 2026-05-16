"use client";

import { FipeLookupPlan } from "@/components/admin/FipeLookupPlan";
import { BadgePercent, Bike, Calculator, Car, HelpCircle, ImagePlus, Info, Loader2, MapPin, Plus, Sparkles, Star, X } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };
type VehicleType = "CAR" | "MOTORCYCLE" | "ELECTRIC_BIKE";

type PriceInsight = {
  fipeEstimate: number | null;
  averageSalePrice: number | null;
  sampleCount: number;
  confidence?: string;
  source: string;
  externalProviderConfigured?: boolean;
  matches: Array<{
    title: string;
    year: number;
    price: number;
    fipePrice: number | null;
    purchasePrice: number | null;
  }>;
};

type FipeSuggestion = {
  title: string;
  makeName: string;
  modelName: string;
  fuelName?: string;
  year: number;
  price: number;
  referenceMonth: string;
  provider: "FipeX";
};

const vehicleTypeOptions: Array<{
  value: VehicleType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "CAR", label: "Carro", description: "FIPE automática", icon: Car },
  { value: "MOTORCYCLE", label: "Moto", description: "FIPE automática", icon: Bike },
  { value: "ELECTRIC_BIKE", label: "Bike elétrica", description: "Preço manual", icon: Bike },
];

const vehicleCopy: Record<
  VehicleType,
  {
    titlePlaceholder: string;
    titleHelper: string;
    fipeLabel: string;
    fipePlaceholder: string;
    fipeHelper: string;
    mileageLabel: string;
    mileagePlaceholder: string;
    fuelLabel: string;
    fuelPlaceholder: string;
    transmissionLabel: string;
    transmissionPlaceholder: string;
    showDoors: boolean;
    showCapacity: boolean;
    defaultInsightSource: string;
  }
> = {
  CAR: {
    titlePlaceholder: "Ex: Honda Civic EXL 2024",
    titleHelper: "Use marca, modelo, versão e ano para melhorar a busca FipeX.",
    fipeLabel: "Tabela FIPE / referência (R$)",
    fipePlaceholder: "Ex: R$ 165.000,00",
    fipeHelper: "Pode ser sugerido automaticamente pela FipeX para carros ou ajustado manualmente.",
    mileageLabel: "Quilometragem",
    mileagePlaceholder: "Ex: 0",
    fuelLabel: "Combustível / energia",
    fuelPlaceholder: "Ex: Flex, Diesel, Elétrico, Híbrido",
    transmissionLabel: "Câmbio / transmissão",
    transmissionPlaceholder: "Ex: Automático, Manual, CVT",
    showDoors: true,
    showCapacity: true,
    defaultInsightSource: "Digite o título para buscar FipeX e veículos parecidos no estoque local.",
  },
  MOTORCYCLE: {
    titlePlaceholder: "Ex: Honda CG 160 Fan 2024",
    titleHelper: "Use marca, modelo, cilindrada/versão e ano para melhorar a busca FipeX.",
    fipeLabel: "Tabela FIPE / referência (R$)",
    fipePlaceholder: "Ex: R$ 17.500,00",
    fipeHelper: "Pode ser sugerido automaticamente pela FipeX para motos ou ajustado manualmente.",
    mileageLabel: "Quilometragem",
    mileagePlaceholder: "Ex: 12000",
    fuelLabel: "Combustível",
    fuelPlaceholder: "Ex: Flex, Gasolina, Elétrica",
    transmissionLabel: "Câmbio / partida",
    transmissionPlaceholder: "Ex: Manual, CVT, Elétrica",
    showDoors: false,
    showCapacity: true,
    defaultInsightSource: "Digite o título para buscar FipeX e motos parecidas no estoque local.",
  },
  ELECTRIC_BIKE: {
    titlePlaceholder: "Ex: Caloi E-Vibe Easy Rider 2024",
    titleHelper: "Use marca, modelo, bateria e ano. Bike elétrica será precificada manualmente.",
    fipeLabel: "Preço manual de referência (R$)",
    fipePlaceholder: "Ex: R$ 8.500,00",
    fipeHelper: "Bike elétrica não tem preenchimento FIPE automático neste fluxo; informe a referência manual.",
    mileageLabel: "Uso estimado / km",
    mileagePlaceholder: "Ex: 500",
    fuelLabel: "Bateria / autonomia",
    fuelPlaceholder: "Ex: 500Wh, autonomia 60 km",
    transmissionLabel: "Sistema de assistência",
    transmissionPlaceholder: "Ex: pedal assistido, 5 níveis",
    showDoors: false,
    showCapacity: false,
    defaultInsightSource: "Bike elétrica usa preço manual. Informe uma referência baseada no estado e mercado local.",
  },
};

const vehicleFeatureOptions: Record<Exclude<VehicleType, "ELECTRIC_BIKE">, Array<{ value: string; label: string; helper: string }>> = {
  CAR: [
    { value: "Ar-condicionado", label: "Ar-condicionado", helper: "Conforto essencial para venda." },
    { value: "Central multimídia", label: "Central multimídia", helper: "Tela, conexão ou sistema de entretenimento." },
    { value: "Câmera de ré", label: "Câmera de ré", helper: "Ajuda em manobras e avaliação comercial." },
    { value: "Sensor de estacionamento", label: "Sensor de estacionamento", helper: "Diferencial para uso urbano." },
    { value: "Bancos em couro", label: "Bancos em couro", helper: "Acabamento interno valorizado." },
    { value: "Rodas de liga leve", label: "Rodas de liga leve", helper: "Detalhe visual e de versão." },
  ],
  MOTORCYCLE: [
    { value: "Freio ABS", label: "Freio ABS", helper: "Item relevante para segurança." },
    { value: "Partida elétrica", label: "Partida elétrica", helper: "Facilita uso diário." },
    { value: "Carregador USB", label: "Carregador USB", helper: "Acessório útil para trabalho e viagem." },
    { value: "Baú ou suporte", label: "Baú ou suporte", helper: "Indica preparo para entrega ou deslocamento." },
    { value: "Iluminação LED", label: "Iluminação LED", helper: "Diferencial de versão e conservação." },
    { value: "Controle de tração", label: "Controle de tração", helper: "Item presente em motos mais completas." },
  ],
};

const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function CarForm({
  action,
  brands,
  categories,
}: {
  action: (formData: FormData) => Promise<string | void>;
  brands: Brand[];
  categories: Category[];
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [brandOptions, setBrandOptions] = useState(brands);
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [priceWasManual, setPriceWasManual] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [fipePrice, setFipePrice] = useState("");
  const [fipeWasManual, setFipeWasManual] = useState(false);
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandToCreate, setBrandToCreate] = useState("");
  const [categoryToCreate, setCategoryToCreate] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("MG");
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [insight, setInsight] = useState<PriceInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<FipeSuggestion[]>([]);
  const [titleSuggestionOpen, setTitleSuggestionOpen] = useState(false);
  const [titleSuggestionLoading, setTitleSuggestionLoading] = useState(false);
  const [includeOlderModels, setIncludeOlderModels] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const copy = vehicleCopy[vehicleType];
  const locationValue = locationCity.trim() ? `${locationCity.trim()}, ${locationState}` : "";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.localStorage.getItem("admin-cars-new-help-seen") !== "true") {
        setHelpOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (vehicleType === "ELECTRIC_BIKE" || title.trim().length < 2) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setTitleSuggestionLoading(true);
      try {
        const params = new URLSearchParams({ q: title.trim(), vehicleType });
        if (includeOlderModels) params.set("includeOlderModels", "1");
        const response = await fetch(`/api/admin/fipe-suggestions?${params.toString()}`);
        if (!response.ok) return;

        const data = (await response.json()) as { suggestions?: FipeSuggestion[] };
        setTitleSuggestions(data.suggestions ?? []);
      } finally {
        setTitleSuggestionLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [includeOlderModels, title, vehicleType]);

  useEffect(() => {
    if (vehicleType === "ELECTRIC_BIKE") {
      return;
    }

    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 4) return;

    const timeout = window.setTimeout(async () => {
      setInsightLoading(true);
      try {
        const params = new URLSearchParams({ title: normalizedTitle, year, vehicleType });
        const response = await fetch(`/api/admin/price-insights?${params.toString()}`);
        if (!response.ok) return;

        const data = (await response.json()) as PriceInsight;
        setInsight(data);

        if (!fipeWasManual && data.fipeEstimate) {
          setFipePrice(formatCurrencyInput(data.fipeEstimate));
        }

        if (!priceWasManual && data.fipeEstimate) {
          setPrice(formatCurrencyInput(getSuggestedSalePrice(data.fipeEstimate)));
        }
      } finally {
        setInsightLoading(false);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [fipeWasManual, priceWasManual, title, vehicleType, year]);

  const previewImages = useMemo(() => localImages, [localImages]);

  const priceNumber = parseCurrencyValue(price);
  const purchaseNumber = parseCurrencyValue(purchasePrice);
  const fipeNumber = parseCurrencyValue(fipePrice);
  const discount =
    priceNumber > 0 && fipeNumber > priceNumber
      ? Math.round(((fipeNumber - priceNumber) / fipeNumber) * 100)
      : 0;
  const grossMargin = priceNumber > 0 && purchaseNumber > 0 ? priceNumber - purchaseNumber : 0;
  const marginPercent = priceNumber > 0 && purchaseNumber > 0 ? Math.round((grossMargin / priceNumber) * 100) : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrls", previewImages.join("\n"));
    formData.set("price", normalizeCurrencyForSubmit(price));
    formData.set("purchasePrice", normalizeCurrencyForSubmit(purchasePrice));
    formData.set("fipePrice", normalizeCurrencyForSubmit(fipePrice));
    const result = await action(formData);

    setSubmitting(false);
    if (result) setError(result);
  }

  function handleImageFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 8);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((images) => setLocalImages(images))
      .catch(() => setError("Não foi possível importar as imagens selecionadas."));
  }

  function handleVehicleTypeChange(nextVehicleType: VehicleType) {
    setVehicleType(nextVehicleType);
    setInsight(null);
    setInsightLoading(false);
    setTitleSuggestions([]);
    setTitleSuggestionOpen(false);
    setIncludeOlderModels(false);

    if (nextVehicleType === "ELECTRIC_BIKE" && !fipeWasManual) {
      setFipePrice("");
    }
  }

  async function createBrandNow() {
    const name = brandToCreate.trim();
    if (!name || brandId) return;

    const existingBrand = findOptionByName(brandOptions, name);
    if (existingBrand) {
      setBrandId(existingBrand.id);
      setBrandToCreate("");
      return;
    }

    setCreatingBrand(true);
    setError("");
    try {
      const created = await createTaxonomyOption("/api/brands", name);
      setBrandOptions((current) => upsertOption(current, created));
      setBrandId(created.id);
      setBrandToCreate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a marca agora.");
    } finally {
      setCreatingBrand(false);
    }
  }

  async function createCategoryNow() {
    const name = categoryToCreate.trim();
    if (!name || categoryId) return;

    const existingCategory = findOptionByName(categoryOptions, name);
    if (existingCategory) {
      setCategoryId(existingCategory.id);
      setCategoryToCreate("");
      return;
    }

    setCreatingCategory(true);
    setError("");
    try {
      const created = await createTaxonomyOption("/api/categories", name);
      setCategoryOptions((current) => upsertOption(current, created));
      setCategoryId(created.id);
      setCategoryToCreate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a categoria agora.");
    } finally {
      setCreatingCategory(false);
    }
  }

  function closeHelpPopup() {
    window.localStorage.setItem("admin-cars-new-help-seen", "true");
    setHelpOpen(false);
  }

  function handleSuggestionSelect(suggestion: FipeSuggestion) {
    setTitle(suggestion.title);
    setYear(String(suggestion.year));
    setFipePrice(formatCurrencyInput(suggestion.price));
    setFipeWasManual(false);
    setFuelType(suggestion.fuelName ?? "");
    setTransmission(inferTransmission(suggestion.title));
    setDescription(buildCommercialDescription(suggestion, vehicleType));
    setTitleSuggestions([]);
    setTitleSuggestionOpen(false);

    const existingBrand = findOptionByName(brandOptions, suggestion.makeName);
    if (existingBrand) {
      setBrandId(existingBrand.id);
      setBrandToCreate("");
    } else {
      setBrandId("");
      setBrandToCreate(suggestion.makeName);
    }

    const suggestedCategory = inferCategoryName(suggestion.title, vehicleType);
    const existingCategory = findOptionByName(categoryOptions, suggestedCategory);
    if (existingCategory) {
      setCategoryId(existingCategory.id);
      setCategoryToCreate("");
    } else {
      setCategoryId("");
      setCategoryToCreate(suggestedCategory);
    }

    if (!priceWasManual) {
      setPrice(formatCurrencyInput(getSuggestedSalePrice(suggestion.price)));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <section className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="font-semibold text-slate-950">Cadastro autoexplicativo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Escolha o tipo do veículo primeiro. O formulário adapta campos e a regra de FIPE para carro, moto ou bike elétrica.
            </p>
          </div>
        </div>
      </section>

      <FipeLookupPlan vehicleType={vehicleType} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <HelpCircle className="h-4 w-4" />
          Como usar esta página
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VehicleTypeField value={vehicleType} onChange={handleVehicleTypeChange} />
        {vehicleType === "ELECTRIC_BIKE" ? <BikeManualPanel /> : null}
        <SelectField
          label="Status do veículo"
          name="condition"
          helper="Use novo apenas quando o veículo nunca foi transferido/rodado como usado."
          required
        >
          <option value="USED">Usado / seminovo</option>
          <option value="NEW">Novo / zero km</option>
        </SelectField>
        <TitleAutocompleteField
          label="Título"
          name="title"
          required
          placeholder={copy.titlePlaceholder}
          helper={copy.titleHelper}
          value={title}
          suggestions={titleSuggestions}
          suggestionsOpen={titleSuggestionOpen}
          loading={titleSuggestionLoading}
          includeOlderModels={includeOlderModels}
          onFocus={() => setTitleSuggestionOpen(true)}
          onToggleOlderModels={() => setIncludeOlderModels((current) => !current)}
          onSuggestionSelect={handleSuggestionSelect}
          onChange={(value) => {
            setTitle(value);
            setTitleSuggestionOpen(true);
            if (value.trim().length < 2) setTitleSuggestions([]);
            if (value.trim().length < 4) setInsight(null);
          }}
        />
        <MoneyField
          label="Preço de venda (R$)"
          name="price"
          required
          placeholder="Ex: R$ 150.000,00"
          helper={
            !priceWasManual && fipeNumber > 0
              ? `Sugestão automática 5% abaixo da referência: ${formatCurrency(getSuggestedSalePrice(fipeNumber))}.`
              : "Ao informar o custo de compra, o painel calcula a margem bruta estimada."
          }
          value={price}
          onChange={(value) => {
            setPriceWasManual(true);
            setPrice(value);
          }}
        />
        <MoneyField
          label="Custo de compra / entrada (R$)"
          name="purchasePrice"
          placeholder="Ex: R$ 135.000,00"
          helper="Use o valor pago no veículo, repasse, troca ou aquisição. Não aparece na vitrine pública."
          value={purchasePrice}
          onChange={setPurchasePrice}
        />
        <MoneyField
          label={copy.fipeLabel}
          name="fipePrice"
          placeholder={copy.fipePlaceholder}
          helper={copy.fipeHelper}
          value={fipePrice}
          onChange={(value) => {
            setFipeWasManual(true);
            setFipePrice(value);
          }}
          onBlurParsed={(value) => {
            if (!priceWasManual && value > 0) {
              setPrice(formatCurrencyInput(getSuggestedSalePrice(value)));
            }
          }}
        />
        <InputField label="Ano" name="year" type="number" required placeholder="Ex: 2024" value={year} onChange={setYear} />
        <InputField label={copy.mileageLabel} name="mileage" type="number" placeholder={copy.mileagePlaceholder} />
        <InputField label={copy.fuelLabel} name="fuelType" placeholder={copy.fuelPlaceholder} value={fuelType} onChange={setFuelType} />
        <InputField label={copy.transmissionLabel} name="transmission" placeholder={copy.transmissionPlaceholder} value={transmission} onChange={setTransmission} />
        <InputField label="Cor" name="color" placeholder="Ex: Preto, Branco, Prata" />
        {copy.showDoors ? <InputField label="Portas" name="doors" type="number" placeholder="Ex: 4" /> : null}
        {copy.showCapacity ? (
          <InputField label="Lugares" name="capacity" type="number" placeholder={vehicleType === "MOTORCYCLE" ? "Ex: 2" : "Ex: 5"} />
        ) : null}
        <LocationField
          city={locationCity}
          stateValue={locationState}
          value={locationValue}
          onCityChange={setLocationCity}
          onStateChange={setLocationState}
        />

        <TaxonomyField
          label="Marca / fabricante"
          name="brandId"
          helper="A marca é preenchida pela FIPE quando o fabricante já existe no cadastro."
          options={brandOptions}
          value={brandId}
          onChange={setBrandId}
          createValue={brandToCreate}
          onCreateValueChange={setBrandToCreate}
          onCreate={createBrandNow}
          creating={creatingBrand}
          createLabel="Criar marca"
          placeholder="Selecione a marca"
        />
        <TaxonomyField
          label="Categoria / segmento"
          name="categoryId"
          helper="O sistema sugere a categoria mais provável pelo tipo/modelo; ajuste se necessário."
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          createValue={categoryToCreate}
          onCreateValueChange={setCategoryToCreate}
          onCreate={createCategoryNow}
          creating={creatingCategory}
          createLabel="Criar categoria"
          placeholder="Selecione a categoria"
        />
        {vehicleType !== "ELECTRIC_BIKE" ? <VehicleFeaturesField vehicleType={vehicleType} /> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            {insightLoading ? (
              <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-emerald-700" />
            ) : (
              <Calculator className="mt-0.5 h-5 w-5 text-emerald-700" />
            )}
            <div>
              <p className="font-semibold text-slate-950">Precificação assistida</p>
              <p className="mt-1 text-sm text-slate-600">{insight?.source ?? copy.defaultInsightSource}</p>
              {insight?.fipeEstimate ? (
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  Referência sugerida: {formatCurrency(insight.fipeEstimate)} - confiança {insight.confidence}
                </p>
              ) : null}
              {insight?.averageSalePrice ? (
                <p className="mt-1 text-xs text-slate-500">
                  Média de venda interna: {formatCurrency(insight.averageSalePrice)} em {insight.sampleCount} referência(s).
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <BadgePercent className="mt-0.5 h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-semibold text-slate-950">Margem bruta prevista</p>
              {grossMargin ? (
                <>
                  <p className={grossMargin >= 0 ? "mt-1 text-sm font-semibold text-emerald-700" : "mt-1 text-sm font-semibold text-red-700"}>
                    {formatCurrency(grossMargin)} - {marginPercent}% sobre o preço de venda
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Cálculo: preço de venda menos custo de compra/entrada. Não inclui impostos, comissão, revisão ou mídia.
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-600">
                  Informe preço de venda e custo de compra para calcular a possível margem de lucro.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {discount > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <BadgePercent className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="font-semibold text-slate-950">{discount}% abaixo da referência</p>
              <p className="mt-1 text-sm text-slate-600">
                Esse comparativo poderá aparecer na vitrine como argumento de promoção abaixo do preço.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <label className="text-sm font-semibold text-slate-950">Descrição comercial</label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Texto que ajuda o vendedor a explicar estado, diferenciais, histórico e condição de negociação.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setDescription(
                buildCommercialDescription(
                  {
                    title: title || "Veículo selecionado",
                    makeName: brandOptions.find((brand) => brand.id === brandId)?.name ?? "",
                    modelName: title,
                    fuelName: fuelType || undefined,
                    year: Number(year) || new Date().getFullYear(),
                    price: fipeNumber || priceNumber || 0,
                    referenceMonth: "referência atual",
                    provider: "FipeX",
                  },
                  vehicleType,
                ),
              )
            }
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sugerir descrição
          </button>
        </div>
        <textarea
          name="description"
          required
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Explique estado, diferenciais, histórico, revisões, garantia e motivo da oferta."
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-900">Imagens do veículo</label>
          <p className="text-sm text-slate-500">
            A primeira imagem vira capa na vitrine. Use fotos reais e bem iluminadas na ordem em que devem aparecer.
          </p>
        </div>
        <label className="flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-5 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-900/10">
          <ImagePlus className="h-5 w-5" />
          Selecionar fotos do veículo
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />
        </label>
        {previewImages.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previewImages.slice(0, 8).map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${url}-${index}`}
                src={url}
                alt=""
                className="h-24 w-full rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-950">Publicação e campanha</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Defina como o veículo aparece na operação comercial e na vitrine pública.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
        <label className="flex min-h-24 items-start gap-3 rounded-lg border border-amber-200 bg-white p-4 text-sm transition hover:border-amber-300 hover:bg-amber-50">
          <input type="checkbox" name="isFeatured" className="mt-1 h-4 w-4 rounded border-amber-300 text-emerald-700 focus:ring-emerald-600" />
          <span className="text-slate-700">
            <span className="flex items-center gap-2 font-semibold text-slate-950">
              <Star className="h-4 w-4 text-amber-600" />
              Destaque na vitrine
            </span>
            <span className="mt-1 block">Prioriza o veículo nos blocos de destaque da página pública.</span>
          </span>
        </label>

        <label className="flex min-h-24 items-start gap-3 rounded-lg border border-emerald-200 bg-white p-4 text-sm transition hover:border-emerald-300 hover:bg-emerald-50">
          <input type="checkbox" name="isPromotion" className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600" />
          <span className="text-slate-700">
            <span className="flex items-center gap-2 font-semibold text-slate-950">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              Marcar como promoção
            </span>
            <span className="mt-1 block">Use quando o preço estiver competitivo, abaixo da referência ou com condição especial.</span>
          </span>
        </label>
        </div>

        <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Mensagem da promoção</label>
        <input
          name="promotionNote"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Ex: Abaixo da FIPE, revisado e pronto para transferência."
        />
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-700 px-6 py-2.5 font-semibold text-white shadow-md shadow-emerald-700/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Criando..." : "Criar veículo"}
        </button>
      </div>

      <CarsNewHelpPopup open={helpOpen} onClose={closeHelpPopup} />
    </form>
  );
}

function CarsNewHelpPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-4">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Novo veículo</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Como usar esta página</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Siga a ordem do formulário para evitar retrabalho e deixar FIPE, preço e margem coerentes antes de salvar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Fechar ajuda"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6">
          <HelpStep
            number="1"
            title="Escolha o tipo"
            text="Carro e moto usam sugestão FIPE automática. Bike elétrica fica com preço manual."
          />
          <HelpStep
            number="2"
            title="Busque pelo título"
          text="Digite modelo e ano, como Civic 2020, e selecione uma sugestão FIPE para preencher título, ano e referência."
        />
          <HelpStep
            number="3"
            title="Revise os valores"
          text="A FIPE aparece em reais com centavos. O preço de venda pode ser sugerido automaticamente abaixo da referência."
        />
          <HelpStep
            number="4"
            title="Modelos antigos"
            text="Ative modelos antigos quando o veículo não aparecer nos primeiros resultados; a cotação continua usando a referência FIPE atual retornada pela FipeX."
          />
          <HelpStep
            number="5"
            title="Complete o cadastro"
            text="Informe custo de compra, marca, categoria, descrição e imagens antes de criar o veículo."
          />
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-6">
          <p className="text-sm leading-6 text-slate-600">
            Dica: se o autocomplete não encontrar exatamente o veículo, escolha o modelo mais próximo e ajuste manualmente título, ano ou valor FIPE antes de salvar.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/15 transition hover:bg-emerald-800"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
          {number}
        </span>
        <div>
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function VehicleTypeField({
  value,
  onChange,
}: {
  value: VehicleType;
  onChange: (value: VehicleType) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <input type="hidden" name="vehicleType" value={value} />
      <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de veículo</label>
      <div className="grid gap-3 md:grid-cols-3">
        {vehicleTypeOptions.map((option) => {
          const Icon = option.icon;
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-h-20 items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                active
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">O formulário muda automaticamente os campos e a regra de preço conforme o tipo escolhido.</p>
    </div>
  );
}

function BikeManualPanel() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 lg:col-span-2">
      <div className="flex items-start gap-3">
        <Bike className="mt-0.5 h-5 w-5 text-amber-700" />
        <div>
          <p className="font-semibold text-slate-950">Cadastro específico para bike elétrica</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Bike elétrica não usa FIPE automática. Informe preço de referência manual, bateria/autonomia,
            sistema de assistência e estado geral para orientar a negociação.
          </p>
        </div>
      </div>
    </div>
  );
}

function TitleAutocompleteField({
  label,
  name,
  placeholder,
  helper,
  required,
  value,
  suggestions,
  suggestionsOpen,
  loading,
  includeOlderModels,
  onFocus,
  onChange,
  onToggleOlderModels,
  onSuggestionSelect,
}: {
  label: string;
  name: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  value: string;
  suggestions: FipeSuggestion[];
  suggestionsOpen: boolean;
  loading: boolean;
  includeOlderModels: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
  onToggleOlderModels: () => void;
  onSuggestionSelect: (suggestion: FipeSuggestion) => void;
}) {
  const showSuggestions = suggestionsOpen && (loading || suggestions.length > 0);

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        autoComplete="off"
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleOlderModels}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            includeOlderModels
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800"
          }`}
        >
          {includeOlderModels ? "Ocultar modelos antigos" : "Ver modelos antigos"}
        </button>
        <span className="text-xs leading-5 text-slate-500">
          {includeOlderModels
            ? "Busca ampliada com anos anteriores e cotação FIPE atualizada."
            : "Mostra primeiro os anos mais recentes."}
        </span>
      </div>
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-[108px] z-20 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {loading ? <p className="px-4 py-3 text-sm text-slate-500">Buscando modelos FIPE...</p> : null}
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.title}-${suggestion.year}-${suggestion.price}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSuggestionSelect(suggestion)}
              className="flex w-full items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm transition first:border-t-0 hover:bg-emerald-50"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-950">{suggestion.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Ano {suggestion.year} - {suggestion.provider} {suggestion.referenceMonth}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-emerald-700">{formatCurrency(suggestion.price)}</span>
            </button>
          ))}
        </div>
      ) : null}
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function MoneyField({
  label,
  name,
  placeholder,
  helper,
  required,
  value,
  onChange,
  onBlurParsed,
}: {
  label: string;
  name: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlurParsed?: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onBlur={() => {
          const parsed = parseCurrencyValue(value);
          if (parsed > 0) {
            onChange(formatCurrencyInput(parsed));
            onBlurParsed?.(parsed);
          }
        }}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function TaxonomyField({
  label,
  name,
  helper,
  options,
  value,
  onChange,
  createValue,
  onCreateValueChange,
  onCreate,
  creating,
  createLabel,
  placeholder,
}: {
  label: string;
  name: string;
  helper?: string;
  options: Array<{ id: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
  createValue: string;
  onCreateValueChange: (value: string) => void;
  onCreate: () => void;
  creating: boolean;
  createLabel: string;
  placeholder: string;
}) {
  const existingOption = findOptionByName(options, createValue);
  const selectedOption = options.find((option) => option.id === value);
  const canCreate = !value && createValue.trim().length >= 2 && !existingOption;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        required
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          if (nextValue) onCreateValueChange("");
        }}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
      {value ? (
        <div className="mt-2 flex flex-col gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{selectedOption ? `${selectedOption.name} selecionada. Para criar outra, limpe a seleção atual.` : "Item selecionado."}</span>
          <button type="button" onClick={() => onChange("")} className="font-semibold text-emerald-900 underline-offset-2 hover:underline">
            Limpar seleção
          </button>
        </div>
      ) : (
        <>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={createValue}
              onChange={(event) => onCreateValueChange(event.target.value)}
              placeholder={createLabel === "Criar marca" ? "Ex: Honda" : "Ex: Sedan"}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="button"
              disabled={!canCreate || creating}
              onClick={onCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Criando..." : createLabel}
            </button>
          </div>
          {existingOption ? (
            <p className="mt-1 text-xs leading-5 text-amber-700">
              {existingOption.name} já existe. Selecione no campo acima em vez de criar duplicado.
            </p>
          ) : createValue ? (
            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Sugestão pronta para criação: {createValue}. Crie agora ou selecione uma opção existente.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function LocationField({
  city,
  stateValue,
  value,
  onCityChange,
  onStateChange,
}: {
  city: string;
  stateValue: string;
  value: string;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
}) {
  return (
    <div>
      <input type="hidden" name="location" value={value} />
      <label className="mb-1 block text-sm font-medium text-slate-700">Localização do veículo</label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            placeholder="Ex: Cataguases"
            autoComplete="address-level2"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={stateValue}
          onChange={(event) => onStateChange(event.target.value)}
          autoComplete="address-level1"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {brazilianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Informe cidade e UF onde o veículo está disponível para visita, retirada ou avaliação. Será salvo como {value || "Cidade, UF"}.
      </p>
    </div>
  );
}

function VehicleFeaturesField({ vehicleType }: { vehicleType: Exclude<VehicleType, "ELECTRIC_BIKE"> }) {
  const options = vehicleFeatureOptions[vehicleType];
  const title = vehicleType === "CAR" ? "Detalhes do carro" : "Detalhes da moto";
  const helper =
    vehicleType === "CAR"
      ? "Marque itens como ar-condicionado e multimídia para qualificar o anúncio e a negociação."
      : "Marque equipamentos e acessórios importantes para avaliar e vender a moto.";

  return (
    <div className="lg:col-span-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex min-h-20 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <input type="checkbox" name="features" value={option.value} className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600" />
              <span>
                <span className="block font-semibold text-slate-950">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{option.helper}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  helper,
  icon: Icon,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  icon?: ComponentType<{ className?: string }>;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className={`w-full rounded-lg border border-slate-300 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            Icon ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  helper,
  required,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  helper?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        required={required}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm transition focus:-translate-y-0.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {children}
      </select>
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCurrencyInput(value: number): string {
  return formatCurrency(value);
}

function normalizeCurrencyForSubmit(value: string): string {
  const parsed = parseCurrencyValue(value);
  return parsed > 0 ? parsed.toFixed(2) : "";
}

function parseCurrencyValue(value: string): number {
  const clean = value.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return 0;

  if (clean.includes(",")) {
    return Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
  }

  const dotCount = clean.split(".").length - 1;
  if (dotCount > 1) {
    return Number(clean.replace(/\./g, "")) || 0;
  }

  return Number(clean) || 0;
}

function getSuggestedSalePrice(fipePrice: number): number {
  return Number((fipePrice * 0.95).toFixed(2));
}

async function createTaxonomyOption(endpoint: "/api/brands" | "/api/categories", name: string): Promise<{ id: string; name: string }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar o item. Verifique se ele já existe ou tente novamente.");
  }

  return (await response.json()) as { id: string; name: string };
}

function upsertOption<T extends { id: string; name: string }>(options: T[], option: T): T[] {
  if (options.some((item) => item.id === option.id)) return options;
  return [...options, option].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function findOptionByName<T extends { id: string; name: string }>(options: T[], name: string): T | undefined {
  const normalizedName = normalizeName(name);
  return options.find((option) => normalizeName(option.name) === normalizedName);
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferTransmission(title: string): string {
  const normalizedTitle = normalizeName(title);
  if (normalizedTitle.includes("automatico") || normalizedTitle.includes("aut")) return "Automático";
  if (normalizedTitle.includes("manual") || normalizedTitle.includes("mecanico") || normalizedTitle.includes("mec")) return "Manual";
  if (normalizedTitle.includes("cvt")) return "CVT";
  return "";
}

function inferCategoryName(title: string, vehicleType: VehicleType): string {
  if (vehicleType === "MOTORCYCLE") return "Moto";
  if (vehicleType === "ELECTRIC_BIKE") return "Bike elétrica";

  const normalizedTitle = normalizeName(title);
  if (normalizedTitle.includes("suv") || normalizedTitle.includes("tracker") || normalizedTitle.includes("compass")) return "SUV";
  if (normalizedTitle.includes("hatch")) return "Hatch";
  if (normalizedTitle.includes("pickup") || normalizedTitle.includes("cabine") || normalizedTitle.includes("ranger")) return "Picape";
  if (normalizedTitle.includes("coupe") || normalizedTitle.includes("cupe")) return "Cupê";
  if (normalizedTitle.includes("sedan") || normalizedTitle.includes("sed")) return "Sedan";

  return "Carro";
}

function buildCommercialDescription(suggestion: FipeSuggestion, vehicleType: VehicleType): string {
  const typeLabel =
    vehicleType === "MOTORCYCLE" ? "moto" : vehicleType === "ELECTRIC_BIKE" ? "bike elétrica" : "veículo";
  const fuel = suggestion.fuelName ? `, motorização/combustível ${suggestion.fuelName}` : "";

  return `${suggestion.title} ${suggestion.year}, ${typeLabel} com referência FIPE ${suggestion.referenceMonth}${fuel}. Unidade cadastrada com preço competitivo, pronta para análise comercial, negociação e avaliação de troca. Consulte disponibilidade, condições, documentação e detalhes de garantia antes da finalização.`;
}
