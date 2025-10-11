-- =============================================
-- DUPLICATE PAYMENT PREVENTION
-- =============================================
-- This migration adds a unique constraint on the transaction_id column
-- to prevent duplicate payment records at the database level.

-- Add unique index on transaction_id (ignoring NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_id 
ON payments(transaction_id) 
WHERE transaction_id IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON INDEX unique_transaction_id IS 'Prevents duplicate payment records with the same transaction ID from payment gateways';

-- Verify the constraint was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'payments' 
  AND indexname = 'unique_transaction_id';

-- This constraint ensures:
-- 1. Each transaction_id can only appear once in the payments table
-- 2. NULL transaction_ids are allowed (for manual/cash payments)
-- 3. Database-level protection against duplicate payments
-- 4. Works in conjunction with application-level idempotency checks

-- Note: Run this in your Supabase SQL Editor
