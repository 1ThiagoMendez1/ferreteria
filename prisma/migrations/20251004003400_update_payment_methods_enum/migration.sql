-- Drop the old enum
DROP TYPE "PaymentMethod";

-- Create the new enum with all values
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'NEQUI', 'DAVIPLATA', 'TARJETA', 'CASH_ON_DELIVERY');

-- Update existing payment methods to new values
UPDATE "orders" SET "paymentMethod" = 'EFECTIVO' WHERE "paymentMethod" = 'STORE_PICKUP';