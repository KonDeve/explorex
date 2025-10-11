-- ==============================================
-- FIX EXISTING BOOKINGS DATA
-- ==============================================
-- This script fixes existing bookings that have:
-- 1. Incorrect total_guests format ("undefined Adults")
-- 2. Incorrect remaining_balance and payment_status
-- 3. Missing or incorrect payment tracking
--
-- IMPORTANT: Backup your database before running!
-- ==============================================

-- Step 1: Fix total_guests formatting
-- Updates all bookings with "undefined" or NULL total_guests
-- to use the adults_count and children_count columns
UPDATE bookings
SET total_guests = CONCAT(
  COALESCE(adults_count, 1), ' ',
  CASE WHEN COALESCE(adults_count, 1) = 1 THEN 'Adult' ELSE 'Adults' END,
  CASE 
    WHEN COALESCE(children_count, 0) > 0 
    THEN CONCAT(', ', children_count, ' ', 
         CASE WHEN children_count = 1 THEN 'Child' ELSE 'Children' END)
    ELSE ''
  END
),
updated_at = NOW()
WHERE total_guests LIKE '%undefined%' 
   OR total_guests IS NULL 
   OR total_guests = '';

-- Step 2: Recalculate remaining_balance and payment_status
-- Based on actual amount_paid vs total_amount
UPDATE bookings
SET 
  remaining_balance = GREATEST(0, total_amount - COALESCE(amount_paid, 0)),
  payment_status = CASE
    WHEN total_amount - COALESCE(amount_paid, 0) <= 0 THEN 'paid'
    WHEN COALESCE(amount_paid, 0) > 0 THEN 'partial'
    ELSE 'pending'
  END,
  updated_at = NOW()
WHERE amount_paid IS NOT NULL;

-- Step 3: Fix bookings where amount_paid is NULL but should be 0
UPDATE bookings
SET 
  amount_paid = 0.00,
  remaining_balance = total_amount,
  payment_status = 'pending',
  updated_at = NOW()
WHERE amount_paid IS NULL;

-- Step 4 (Optional): Set default adults_count if missing
UPDATE bookings
SET 
  adults_count = 1,
  updated_at = NOW()
WHERE adults_count IS NULL OR adults_count = 0;

-- Step 5 (Optional): Set default children_count if missing  
UPDATE bookings
SET 
  children_count = 0,
  updated_at = NOW()
WHERE children_count IS NULL;

-- Verification queries (run these to check results)
-- ============================================

-- Check total_guests formatting
SELECT 
  booking_number,
  adults_count,
  children_count,
  total_guests
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Check payment tracking
SELECT 
  booking_number,
  total_amount,
  amount_paid,
  remaining_balance,
  payment_status,
  CASE 
    WHEN remaining_balance = (total_amount - amount_paid) THEN '✓ Correct'
    ELSE '✗ Mismatch'
  END as calculation_check
FROM bookings
WHERE amount_paid > 0
ORDER BY created_at DESC
LIMIT 10;

-- Check for any remaining issues
SELECT 
  COUNT(*) as count,
  'Undefined total_guests' as issue
FROM bookings
WHERE total_guests LIKE '%undefined%'
UNION ALL
SELECT 
  COUNT(*) as count,
  'NULL total_guests' as issue
FROM bookings
WHERE total_guests IS NULL
UNION ALL
SELECT 
  COUNT(*) as count,
  'Incorrect remaining_balance' as issue
FROM bookings
WHERE remaining_balance != (total_amount - COALESCE(amount_paid, 0))
UNION ALL
SELECT 
  COUNT(*) as count,
  'NULL amount_paid' as issue
FROM bookings
WHERE amount_paid IS NULL;
