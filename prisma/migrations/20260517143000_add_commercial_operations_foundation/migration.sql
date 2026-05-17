-- Extend lead intent to cover the WhatsApp-led customer journey.
ALTER TYPE "SellLeadIntent" ADD VALUE IF NOT EXISTS 'PURCHASE';
ALTER TYPE "SellLeadIntent" ADD VALUE IF NOT EXISTS 'FINANCING_INTEREST';
ALTER TYPE "SellLeadIntent" ADD VALUE IF NOT EXISTS 'CONTACT_REQUEST';

-- Commercial events are first-party operational metrics for the admin dashboard.
CREATE TYPE "CommercialEventType" AS ENUM (
  'VEHICLE_VIEW',
  'WHATSAPP_CLICK',
  'FINANCING_INTEREST',
  'SELL_LEAD_SUBMITTED',
  'CONTACT_INTENT',
  'PURCHASE_INTENT'
);

ALTER TABLE "SellLead"
  ADD COLUMN "sourcePath" TEXT,
  ADD COLUMN "sourceType" TEXT,
  ADD COLUMN "vehicleSlug" TEXT,
  ADD COLUMN "carId" TEXT;

CREATE TABLE "CommercialEvent" (
  "id" TEXT NOT NULL,
  "type" "CommercialEventType" NOT NULL,
  "channel" "SellLeadChannel" NOT NULL DEFAULT 'UNDEFINED',
  "sourcePath" TEXT NOT NULL,
  "ctaLabel" TEXT,
  "vehicleSlug" TEXT,
  "vehicleTitle" TEXT,
  "metadata" JSONB,
  "carId" TEXT,
  "leadId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CommercialEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SellLead_sourcePath_createdAt_idx" ON "SellLead"("sourcePath", "createdAt");
CREATE INDEX "SellLead_vehicleSlug_createdAt_idx" ON "SellLead"("vehicleSlug", "createdAt");
CREATE INDEX "SellLead_carId_createdAt_idx" ON "SellLead"("carId", "createdAt");

CREATE INDEX "CommercialEvent_type_createdAt_idx" ON "CommercialEvent"("type", "createdAt");
CREATE INDEX "CommercialEvent_channel_createdAt_idx" ON "CommercialEvent"("channel", "createdAt");
CREATE INDEX "CommercialEvent_sourcePath_createdAt_idx" ON "CommercialEvent"("sourcePath", "createdAt");
CREATE INDEX "CommercialEvent_vehicleSlug_createdAt_idx" ON "CommercialEvent"("vehicleSlug", "createdAt");
CREATE INDEX "CommercialEvent_carId_createdAt_idx" ON "CommercialEvent"("carId", "createdAt");
CREATE INDEX "CommercialEvent_leadId_createdAt_idx" ON "CommercialEvent"("leadId", "createdAt");

ALTER TABLE "SellLead"
  ADD CONSTRAINT "SellLead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommercialEvent"
  ADD CONSTRAINT "CommercialEvent_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommercialEvent"
  ADD CONSTRAINT "CommercialEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SellLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
