-- Add slug column to packages table for SEO-friendly URLs
-- This migration adds a unique slug column and generates slugs for existing packages

-- Step 1: Add slug column (nullable first to allow data population)
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Step 2: Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) 
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
    slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
    slug := TRIM(BOTH '-' FROM slug);
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Generate slugs for existing packages
-- This will create unique slugs by appending numbers if needed
DO $$
DECLARE
    pkg RECORD;
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER;
BEGIN
    FOR pkg IN SELECT id, title FROM packages WHERE slug IS NULL LOOP
        base_slug := generate_slug(pkg.title);
        final_slug := base_slug;
        counter := 1;
        
        -- Check if slug exists, append number if needed
        WHILE EXISTS (SELECT 1 FROM packages WHERE slug = final_slug AND id != pkg.id) LOOP
            final_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        -- Update the package with the unique slug
        UPDATE packages SET slug = final_slug WHERE id = pkg.id;
    END LOOP;
END $$;

-- Step 4: Make slug column NOT NULL and UNIQUE after population
ALTER TABLE packages 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT packages_slug_unique UNIQUE (slug);

-- Step 5: Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages(slug);

-- Step 6: Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Only generate if slug is NULL or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.title);
        final_slug := base_slug;
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM packages WHERE slug = final_slug AND id != NEW.id) LOOP
            final_slug := base_slug || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- Verification query (optional - comment out in production)
-- SELECT id, title, slug FROM packages ORDER BY created_at DESC;
