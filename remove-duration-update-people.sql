-- Migration: Remove duration field and update people field
-- This migration makes duration nullable and changes people to INTEGER

-- Make duration column nullable (in case you want to keep it for existing data)
-- Or you can drop it completely if no longer needed
ALTER TABLE packages ALTER COLUMN duration DROP NOT NULL;

-- Change people from VARCHAR to INTEGER
-- First, add a new column
ALTER TABLE packages ADD COLUMN people_count INTEGER;

-- Migrate existing data (extract numbers from text like "2-4 People")
-- This will take the first number found in the string
UPDATE packages 
SET people_count = CAST(
  REGEXP_REPLACE(people, '[^0-9]', '', 'g') AS INTEGER
)
WHERE people IS NOT NULL AND people != '';

-- For records where conversion failed or empty, set a default
UPDATE packages 
SET people_count = 4
WHERE people_count IS NULL;

-- Drop old people column
ALTER TABLE packages DROP COLUMN people;

-- Rename new column to people
ALTER TABLE packages RENAME COLUMN people_count TO people;

-- Add NOT NULL constraint
ALTER TABLE packages ALTER COLUMN people SET NOT NULL;

-- Add check constraint to ensure people is positive
ALTER TABLE packages ADD CONSTRAINT check_people_positive CHECK (people > 0);

-- Optional: Drop duration column entirely if not needed
-- Uncomment the line below if you want to completely remove duration
-- ALTER TABLE packages DROP COLUMN duration;

-- Note: After running this migration:
-- 1. Duration field is now nullable (or removed if you uncommented the DROP line)
-- 2. People field is now INTEGER type with NOT NULL and CHECK constraint
-- 3. Existing data has been migrated (first number extracted from text)
