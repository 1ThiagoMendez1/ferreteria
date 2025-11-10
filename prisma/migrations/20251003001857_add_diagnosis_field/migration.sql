-- AlterTable
ALTER TABLE "public"."consultations" ADD COLUMN     "diagnosis" TEXT;

-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "orderCode" SET DEFAULT '';
