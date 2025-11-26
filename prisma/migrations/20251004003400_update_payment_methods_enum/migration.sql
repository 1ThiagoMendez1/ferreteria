-- Alter the enum to add new values (PostgreSQL syntax)
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CASH_ON_DELIVERY';