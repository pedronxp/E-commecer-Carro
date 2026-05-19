export const marketUfOptions = [
  { value: "", label: "Brasil / FIPE nacional" },
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapa" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceara" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espirito Santo" },
  { value: "GO", label: "GO - Goias" },
  { value: "MA", label: "MA - Maranhao" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Para" },
  { value: "PB", label: "PB - Paraiba" },
  { value: "PR", label: "PR - Parana" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piaui" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondonia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - Sao Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
] as const;

export type MarketUf = (typeof marketUfOptions)[number]["value"];

export const recommendationReportModeOptions = [
  {
    value: "basic",
    label: "Basico - menos ruido",
    density: "focused",
    description: "Mostra decisao, teto, margem e fonte essencial.",
  },
  {
    value: "plus",
    label: "Plus - leitura gerencial",
    density: "balanced",
    description: "Inclui qualidade da referencia, tendencia e grafico principal.",
  },
  {
    value: "advanced",
    label: "Avancado - funil tecnico",
    density: "technical",
    description: "Inclui funil, formula, metricas FIPE e graficos tecnicos.",
  },
] as const;

export type RecommendationReportMode = (typeof recommendationReportModeOptions)[number]["value"];

export function normalizeMarketUf(value?: string | null): MarketUf {
  const normalized = String(value ?? "").trim().toUpperCase();
  const option = marketUfOptions.find((item) => item.value === normalized);
  return option?.value ?? "";
}

export function getMarketUfOption(value?: string | null) {
  const normalized = normalizeMarketUf(value);
  return marketUfOptions.find((item) => item.value === normalized) ?? marketUfOptions[0];
}

export function normalizeRecommendationReportMode(value?: string | null): RecommendationReportMode {
  const normalized = String(value ?? "").trim().toLowerCase();
  const option = recommendationReportModeOptions.find((item) => item.value === normalized);
  return option?.value ?? "basic";
}

export function getRecommendationReportModeOption(value?: string | null) {
  const normalized = normalizeRecommendationReportMode(value);
  return recommendationReportModeOptions.find((item) => item.value === normalized) ?? recommendationReportModeOptions[0];
}

export function buildMarketContext(value?: string | null) {
  const option = getMarketUfOption(value);
  const hasUf = option.value !== "";

  return {
    requestedUf: hasUf ? option.value : null,
    label: option.label,
    pricingScope: "national" as const,
    regionalPricingAvailable: false,
    regionalProviderStatus: "not-supported" as const,
    regionalPriceSource: null as string | null,
    source: "FIPE/FipeX nacional",
    note: hasUf
      ? `UF ${option.value} registrada para contexto comercial. O motor atual ainda nao entrega preco FIPE regional por UF.`
      : "Sem UF selecionada. A referencia usada e FIPE/FipeX nacional.",
  };
}
