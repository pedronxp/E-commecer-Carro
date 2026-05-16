-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE', 'ELECTRIC_BIKE');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "Car"
ADD COLUMN "fipePrice" DOUBLE PRECISION,
ADD COLUMN "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR',
ADD COLUMN "condition" "VehicleCondition" NOT NULL DEFAULT 'USED',
ADD COLUMN "isPromotion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "promotionNote" TEXT;
