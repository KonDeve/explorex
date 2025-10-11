-- Migration Script: Update Database Schema to Match New Form Structure
-- This script safely migrates the existing database to the new simplified structure
-- Run this script on your Supabase database via SQL Editor

-- =============================================
-- STEP 1: BACKUP IMPORTANT DATA
-- =============================================
-- Before running this migration, ensure you have backups!
-- You can create a backup view of packages with their old prices:
CREATE OR REPLACE VIEW packages_backup AS
SELECT id, title, people, price, price_value, rating, reviews_count, highlights, features
FROM packages;

-- =============================================
-- STEP 2: ADD NEW COLUMNS TO PACKAGE_DEALS
-- =============================================
-- Add deal_price column to package_deals (individual pricing per deal)
ALTER TABLE package_deals 
ADD COLUMN IF NOT EXISTS deal_price DECIMAL(10,2);

-- Migrate existing prices from packages table to deal_price
-- This sets the deal_price for all existing deals based on the package's price_value
UPDATE package_deals pd
SET deal_price = p.price_value
FROM packages p
WHERE pd.package_id = p.id 
AND pd.deal_price IS NULL;

-- Set default price for any deals without a package reference
UPDATE package_deals 
SET deal_price = 25000.00 
WHERE deal_price IS NULL;

-- Make deal_price required after migration
ALTER TABLE package_deals 
ALTER COLUMN deal_price SET NOT NULL;

-- =============================================
-- STEP 3: UPDATE PAYMENTS TABLE DEFAULT CURRENCY
-- =============================================
-- Change default currency from USD to PHP
ALTER TABLE payments 
ALTER COLUMN currency SET DEFAULT 'PHP';

-- Update existing payments (if you want to convert USD to PHP)
-- Note: This just changes the label, not the actual amount
-- UPDATE payments SET currency = 'PHP' WHERE currency = 'USD';

-- =============================================
-- STEP 4: REMOVE UNUSED COLUMNS FROM PACKAGES
-- =============================================
-- These columns are no longer used in the new form structure

-- Drop people column (now handled per-deal via slots_available)
ALTER TABLE packages 
DROP COLUMN IF EXISTS people CASCADE;

-- Drop global price columns (now handled per-deal via deal_price)
ALTER TABLE packages 
DROP COLUMN IF EXISTS price CASCADE;

ALTER TABLE packages 
DROP COLUMN IF EXISTS price_value CASCADE;

-- Drop rating and reviews_count (can be calculated from reviews table)
ALTER TABLE packages 
DROP COLUMN IF EXISTS rating CASCADE;

ALTER TABLE packages 
DROP COLUMN IF EXISTS reviews_count CASCADE;

-- Drop highlights field (not used in current form)
ALTER TABLE packages 
DROP COLUMN IF EXISTS highlights CASCADE;

-- Drop features field (not used in current form)
ALTER TABLE packages 
DROP COLUMN IF EXISTS features CASCADE;

-- Drop duration if it exists (not needed)
ALTER TABLE packages 
DROP COLUMN IF EXISTS duration CASCADE;

-- =============================================
-- STEP 5: ENSURE REQUIRED COLUMNS EXIST
-- =============================================
-- Make sure all columns used in the new form exist

-- Ensure category column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='packages' AND column_name='category') THEN
        ALTER TABLE packages ADD COLUMN category VARCHAR(100) DEFAULT 'International';
    END IF;
END $$;

-- Ensure hero_type column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='packages' AND column_name='hero_type') THEN
        ALTER TABLE packages ADD COLUMN hero_type VARCHAR(50) DEFAULT 'beach';
    END IF;
END $$;

-- Ensure popular column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='packages' AND column_name='popular') THEN
        ALTER TABLE packages ADD COLUMN popular BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Ensure featured column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='packages' AND column_name='featured') THEN
        ALTER TABLE packages ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Ensure availability column exists with proper constraint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='packages' AND column_name='availability') THEN
        ALTER TABLE packages ADD COLUMN availability VARCHAR(50) DEFAULT 'Available';
        ALTER TABLE packages ADD CONSTRAINT packages_availability_check 
            CHECK (availability IN ('Available', 'Limited', 'Sold Out'));
    END IF;
END $$;

-- =============================================
-- STEP 6: UPDATE NOT NULL CONSTRAINTS
-- =============================================
-- Ensure required fields are marked as NOT NULL

ALTER TABLE packages 
ALTER COLUMN title SET NOT NULL;

ALTER TABLE packages 
ALTER COLUMN category SET NOT NULL;

ALTER TABLE packages 
ALTER COLUMN hero_type SET NOT NULL;

ALTER TABLE packages 
ALTER COLUMN location SET NOT NULL;

ALTER TABLE packages 
ALTER COLUMN country SET NOT NULL;

-- =============================================
-- STEP 7: VERIFY MIGRATION
-- =============================================
-- Check the new structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'packages'
ORDER BY ordinal_position;

-- Check package_deals has deal_price
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'package_deals'
ORDER BY ordinal_position;

-- =============================================
-- STEP 8: UPDATE INDEXES (if needed)
-- =============================================
-- Drop indexes on removed columns (if they exist)
DROP INDEX IF EXISTS idx_packages_rating;
DROP INDEX IF EXISTS idx_packages_price;
DROP INDEX IF EXISTS idx_packages_people;

-- Ensure indexes on new/important columns exist
CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_availability ON packages(availability);
CREATE INDEX IF NOT EXISTS idx_packages_popular ON packages(popular);
CREATE INDEX IF NOT EXISTS idx_packages_featured ON packages(featured);
CREATE INDEX IF NOT EXISTS idx_packages_hero_type ON packages(hero_type);
CREATE INDEX IF NOT EXISTS idx_packages_country ON packages(country);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Summary of changes:
-- 1. Added deal_price to package_deals (migrated from packages.price_value)
-- 2. Removed unused columns: people, price, price_value, rating, reviews_count, highlights, features, duration
-- 3. Ensured all new form fields exist: category, hero_type, popular, featured, availability
-- 4. Updated default currency to PHP
-- 5. Updated indexes for better performance
--
-- Next steps:
-- 1. Test creating a new package via the admin form
-- 2. Test editing an existing package
-- 3. Test that customer pages still display packages correctly
-- 4. Update customer-facing pages to use new structure (deal_price instead of price)
