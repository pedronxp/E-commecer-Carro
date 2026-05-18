import { prisma } from "@/lib/prisma";
import { apiCreated, handleApiError, validationError } from "@/lib/api";
import { parseSellLeadInput } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = parseSellLeadInput(await readJson(request));

    if (!parsed.success) {
      return validationError("Lead comercial invalido.", parsed.error.flatten());
    }

    const input = parsed.data;
    const car = input.carId
      ? await prisma.car.findUnique({ where: { id: input.carId }, select: { id: true, slug: true, title: true } })
      : null;

    const lead = await prisma.sellLead.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase().trim(),
        phone: input.phone || null,
        vehicleModel: input.vehicleModel,
        year: input.year ?? null,
        mileage: input.mileage ?? null,
        intent: input.intent,
        contactChannel: input.contactChannel,
        sourcePath: input.sourcePath,
        sourceType: input.sourceType,
        vehicleSlug: input.vehicleSlug ?? car?.slug,
        carId: car?.id,
        notes: input.notes || null,
        consent: true,
        consentAt: new Date(),
      },
      select: { id: true, intent: true, sourcePath: true, contactChannel: true },
    });

    await prisma.commercialEvent.create({
      data: {
        type: input.intent === "FINANCING_INTEREST" ? "FINANCING_INTEREST" : input.intent === "PURCHASE" ? "PURCHASE_INTENT" : input.intent === "CONTACT_REQUEST" ? "CONTACT_INTENT" : "SELL_LEAD_SUBMITTED",
        channel: input.contactChannel,
        sourcePath: input.sourcePath ?? "/api/sales-leads",
        ctaLabel: "Lead comercial",
        vehicleSlug: input.vehicleSlug ?? car?.slug,
        vehicleTitle: input.vehicleModel || car?.title,
        carId: car?.id,
        leadId: lead.id,
        metadata: { intent: lead.intent },
      },
    });

    return apiCreated({ id: lead.id });
  } catch (error) {
    return handleApiError(error, "sales-leads.POST");
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
