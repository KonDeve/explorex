-- ==============================================
-- BOOKINGS TABLE SCHEMA CLEANUP
-- ==============================================
-- This migration removes unused columns from the bookings table
-- to simplify the schema and improve database performance.
--
-- UNUSED COLUMNS TO REMOVE:
-- - hotel_name: Not used in new schema (packages handle accommodation details)
-- - hotel_rating: Not used in new schema
-- - confirmation_number: Not used (we use booking_number instead)
-- - service_fee: Column exists but always set to 0.00 (not used)
--
-- Before running this migration:
-- 1. Backup your database
-- 2. Verify these columns are truly unused in your application
-- 3. Test with a staging database first
-- ==============================================

-- Remove unused columns from bookings table
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS hotel_name,
  DROP COLUMN IF EXISTS hotel_rating,
  DROP COLUMN IF EXISTS confirmation_number,
  DROP COLUMN IF EXISTS service_fee;

-- Add comment to document schema changes
COMMENT ON TABLE bookings IS 'Bookings table - cleaned up unused columns (hotel_name, hotel_rating, confirmation_number, service_fee) on 2024';

-- Verify the schema (optional - for debugging)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bookings'
-- ORDER BY ordinal_position;
