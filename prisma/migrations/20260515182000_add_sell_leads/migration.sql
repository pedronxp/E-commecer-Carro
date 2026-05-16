-- CreateEnum
CREATE TYPE "SellLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'EVALUATING', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "SellLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "vehicleModel" TEXT NOT NULL,
    "year" INTEGER,
    "mileage" INTEGER,
    "notes" TEXT,
    "status" "SellLeadStatus" NOT NULL DEFAULT 'NEW',
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellLead_status_createdAt_idx" ON "SellLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SellLead_email_idx" ON "SellLead"("email");
