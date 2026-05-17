import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const carSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5),
  price: z.coerce.number().positive(),
  year: z.coerce.number().int().min(1900).max(2100),
  mileage: z.coerce.number().int().nonnegative().nullable().optional(),
  fuelType: z.string().trim().max(60).nullable().optional(),
  transmission: z.string().trim().max(60).nullable().optional(),
  color: z.string().trim().max(60).nullable().optional(),
  doors: z.coerce.number().int().min(1).max(10).nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(20).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(80)).optional(),
  isSold: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).optional(),
});

export const carToggleSchema = z.object({
  carId: z.string().min(1),
});

export const sellLeadIntentEnum = z.enum([
  "DIRECT_SALE",
  "CONSIGNMENT",
  "EVALUATE_BOTH",
  "PURCHASE",
  "FINANCING_INTEREST",
  "CONTACT_REQUEST",
]);

export const sellLeadChannelEnum = z.enum(["UNDEFINED", "WHATSAPP", "PHONE", "IN_PERSON", "EMAIL"]);

export const commercialEventTypeEnum = z.enum([
  "VEHICLE_VIEW",
  "WHATSAPP_CLICK",
  "FINANCING_INTEREST",
  "SELL_LEAD_SUBMITTED",
  "CONTACT_INTENT",
  "PURCHASE_INTENT",
]);

export type SellLeadIntentType = z.infer<typeof sellLeadIntentEnum>;
export type SellLeadChannelType = z.infer<typeof sellLeadChannelEnum>;
export type CommercialEventType = z.infer<typeof commercialEventTypeEnum>;

export const sellLeadIntentLabels: Record<SellLeadIntentType, string> = {
  DIRECT_SALE: "Venda direta",
  CONSIGNMENT: "Consignacao",
  EVALUATE_BOTH: "Quero avaliar as duas",
  PURCHASE: "Compra de veiculo",
  FINANCING_INTEREST: "Interesse em financiamento",
  CONTACT_REQUEST: "Contato geral",
};

export const commercialEventTypeLabels: Record<CommercialEventType, string> = {
  VEHICLE_VIEW: "Visualizacao de veiculo",
  WHATSAPP_CLICK: "Clique no WhatsApp",
  FINANCING_INTEREST: "Interesse em financiamento",
  SELL_LEAD_SUBMITTED: "Lead de venda enviado",
  CONTACT_INTENT: "Intencao de contato",
  PURCHASE_INTENT: "Intencao de compra",
};

/** Transform empty string to undefined so optional fields remain absent. */
function blankToOptional(val: unknown) {
  return val === "" ? undefined : val;
}

const commercialMetadataValue = z.union([z.string().max(300), z.number(), z.boolean(), z.null()]);

const safeMetadataSchema = z
  .record(z.string().min(1).max(40), commercialMetadataValue)
  .refine((value) => Object.keys(value).length <= 12, "Metadados excedem o limite permitido.");

export const sellLeadSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo.").max(120),
  email: z.string().email("Informe um e-mail valido."),
  phone: z.string().trim().max(30).optional().default(""),
  vehicleModel: z.string().trim().min(2, "Informe o modelo do veiculo.").max(200),
  year: z.preprocess(
    blankToOptional,
    z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  ),
  mileage: z.preprocess(
    blankToOptional,
    z.coerce.number().int().nonnegative().max(9_999_999).optional().nullable(),
  ),
  intent: sellLeadIntentEnum,
  contactChannel: sellLeadChannelEnum.optional().default("UNDEFINED"),
  sourcePath: z.preprocess(blankToOptional, z.string().trim().min(1).max(200).optional()),
  sourceType: z.preprocess(blankToOptional, z.string().trim().min(1).max(80).optional()),
  vehicleSlug: z.preprocess(blankToOptional, z.string().trim().min(1).max(120).optional()),
  carId: z.preprocess(blankToOptional, z.string().trim().min(1).max(120).optional()),
  notes: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true, {
    message: "E necessario autorizar o tratamento de dados conforme a LGPD.",
  }),
});

export type SellLeadInput = z.infer<typeof sellLeadSchema>;

export function parseSellLeadInput(data: unknown) {
  return sellLeadSchema.safeParse(data);
}

export const commercialEventSchema = z.object({
  type: commercialEventTypeEnum,
  channel: sellLeadChannelEnum.optional().default("UNDEFINED"),
  sourcePath: z.string().trim().min(1).max(200),
  ctaLabel: z.preprocess(blankToOptional, z.string().trim().min(1).max(100).optional()),
  vehicleSlug: z.preprocess(blankToOptional, z.string().trim().min(1).max(120).optional()),
  vehicleTitle: z.preprocess(blankToOptional, z.string().trim().min(1).max(180).optional()),
  carId: z.preprocess(blankToOptional, z.string().trim().min(1).max(120).optional()),
  leadId: z.preprocess(blankToOptional, z.string().trim().min(1).max(120).optional()),
  metadata: safeMetadataSchema.optional(),
});

export type CommercialEventInput = z.infer<typeof commercialEventSchema>;

export function parseCommercialEventInput(data: unknown) {
  return commercialEventSchema.safeParse(data);
}
