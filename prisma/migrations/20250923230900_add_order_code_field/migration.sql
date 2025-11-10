-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderCode" TEXT;

-- Update existing orders with unique codes
UPDATE "orders" SET "orderCode" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) WHERE "orderCode" IS NULL;

-- Make orderCode unique and not null
ALTER TABLE "orders" ALTER COLUMN "orderCode" SET NOT NULL;
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderCode_key" UNIQUE ("orderCode");