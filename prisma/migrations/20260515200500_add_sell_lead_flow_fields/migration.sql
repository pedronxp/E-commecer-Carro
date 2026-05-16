-- CreateEnum
CREATE TYPE "SellLeadChannel" AS ENUM ('UNDEFINED', 'WHATSAPP', 'PHONE', 'IN_PERSON', 'EMAIL');

-- AlterTable
ALTER TABLE "SellLead"
  ADD COLUMN "contactChannel" "SellLeadChannel" NOT NULL DEFAULT 'UNDEFINED',
  ADD COLUMN "nextActionAt" TIMESTAMP(3),
  ADD COLUMN "adminNotes" TEXT,
  ADD COLUMN "closedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SellLead_contactChannel_nextActionAt_idx" ON "SellLead"("contactChannel", "nextActionAt");
