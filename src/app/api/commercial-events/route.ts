import { prisma } from "@/lib/prisma";
import { parseCommercialEventInput } from "@/lib/schemas";
import { apiCreated, handleApiError, validationError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = parseCommercialEventInput(await readJson(request));

    if (!parsed.success) {
      return validationError("Evento comercial invalido.", parsed.error.flatten());
    }

    const data = parsed.data;
    const [car, lead] = await Promise.all([
      data.carId ? prisma.car.findUnique({ where: { id: data.carId }, select: { id: true } }) : null,
      data.leadId ? prisma.sellLead.findUnique({ where: { id: data.leadId }, select: { id: true } }) : null,
    ]);

    const event = await prisma.commercialEvent.create({
      data: {
        type: data.type,
        channel: data.channel,
        sourcePath: data.sourcePath,
        ctaLabel: data.ctaLabel,
        vehicleSlug: data.vehicleSlug,
        vehicleTitle: data.vehicleTitle,
        metadata: data.metadata,
        carId: car?.id,
        leadId: lead?.id,
      },
      select: { id: true },
    });

    return apiCreated({ id: event.id });
  } catch (error) {
    return handleApiError(error, "commercial-events.POST");
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
