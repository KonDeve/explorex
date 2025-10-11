-- Create package_deals table for multiple date ranges per package
-- This replaces the single deal_start_date/deal_end_date columns approach

-- Drop old columns from packages table
ALTER TABLE packages 
DROP COLUMN IF EXISTS deal_start_date,
DROP COLUMN IF EXISTS deal_end_date,
DROP COLUMN IF EXISTS slots_available,
DROP COLUMN IF EXISTS slots_booked;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS update_package_slots_trigger ON bookings;
DROP FUNCTION IF EXISTS update_package_slots();
DROP FUNCTION IF EXISTS check_package_availability(UUID);

-- Create new package_deals table
CREATE TABLE package_deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    deal_start_date DATE NOT NULL,
    deal_end_date DATE NOT NULL,
    slots_available INTEGER DEFAULT 0,
    slots_booked INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_deal_dates CHECK (deal_end_date >= deal_start_date),
    CONSTRAINT check_slots CHECK (slots_booked <= slots_available)
);

-- Create indexes
CREATE INDEX idx_package_deals_package_id ON package_deals(package_id);
CREATE INDEX idx_package_deals_dates ON package_deals(deal_start_date, deal_end_date);
CREATE INDEX idx_package_deals_active ON package_deals(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_package_deals_updated_at 
    BEFORE UPDATE ON package_deals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update deal slots when a booking is made
CREATE OR REPLACE FUNCTION update_deal_slots()
RETURNS TRIGGER AS $$
DECLARE
    matching_deal_id UUID;
BEGIN
    -- Find matching deal for the booking based on check_in_date
    IF TG_OP = 'INSERT' AND (NEW.status = 'confirmed' OR NEW.status = 'pending') THEN
        -- Find the deal that covers this booking's check_in_date
        SELECT id INTO matching_deal_id
        FROM package_deals
        WHERE package_id = NEW.package_id
          AND NEW.check_in_date >= deal_start_date
          AND NEW.check_in_date <= deal_end_date
          AND is_active = TRUE
        LIMIT 1;
        
        IF matching_deal_id IS NOT NULL THEN
            -- Store deal_id in booking for future reference
            NEW.deal_id = matching_deal_id;
            
            -- Increment slots_booked
            UPDATE package_deals 
            SET slots_booked = slots_booked + 1
            WHERE id = matching_deal_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- If status changed from pending/confirmed to cancelled, decrement
        IF (OLD.status = 'confirmed' OR OLD.status = 'pending') AND NEW.status = 'cancelled' THEN
            IF OLD.deal_id IS NOT NULL THEN
                UPDATE package_deals 
                SET slots_booked = GREATEST(0, slots_booked - 1)
                WHERE id = OLD.deal_id;
            END IF;
        END IF;
        
        -- If status changed from cancelled to pending/confirmed, increment
        IF OLD.status = 'cancelled' AND (NEW.status = 'confirmed' OR NEW.status = 'pending') THEN
            IF OLD.deal_id IS NOT NULL THEN
                UPDATE package_deals 
                SET slots_booked = slots_booked + 1
                WHERE id = OLD.deal_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' AND (OLD.status = 'confirmed' OR OLD.status = 'pending') THEN
        -- Decrement slots_booked
        IF OLD.deal_id IS NOT NULL THEN
            UPDATE package_deals 
            SET slots_booked = GREATEST(0, slots_booked - 1)
            WHERE id = OLD.deal_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
CREATE TRIGGER update_deal_slots_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_deal_slots();

-- Add deal_id column to bookings table to track which deal was used
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES package_deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_deal_id ON bookings(deal_id);

-- Helper function to get available deals for a package
CREATE OR REPLACE FUNCTION get_available_deals(package_uuid UUID)
RETURNS TABLE (
    deal_id UUID,
    start_date DATE,
    end_date DATE,
    total_slots INTEGER,
    remaining_slots INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        deal_start_date,
        deal_end_date,
        slots_available,
        (slots_available - slots_booked) as remaining_slots,
        CASE 
            WHEN is_active = FALSE THEN FALSE
            WHEN CURRENT_DATE > deal_end_date THEN FALSE
            WHEN slots_available > 0 AND slots_booked >= slots_available THEN FALSE
            ELSE TRUE
        END as is_available
    FROM package_deals
    WHERE package_id = package_uuid
    ORDER BY deal_start_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if a specific deal has availability
CREATE OR REPLACE FUNCTION check_deal_availability(deal_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deal RECORD;
BEGIN
    SELECT 
        is_active,
        deal_start_date,
        deal_end_date,
        slots_available,
        slots_booked
    INTO deal
    FROM package_deals
    WHERE id = deal_uuid;
    
    -- Check if deal exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if deal is active
    IF deal.is_active = FALSE THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current date is within deal dates
    IF CURRENT_DATE < deal.deal_start_date OR CURRENT_DATE > deal.deal_end_date THEN
        RETURN FALSE;
    END IF;
    
    -- Check if slots are available
    IF deal.slots_available > 0 AND deal.slots_booked >= deal.slots_available THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Sample data (optional - for testing)
-- Example: Add multiple deals for Santorini Paradise package
/*
INSERT INTO package_deals (package_id, deal_start_date, deal_end_date, slots_available) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2025-10-03', '2025-10-06', 10),
('550e8400-e29b-41d4-a716-446655440001', '2025-09-04', '2025-09-07', 8),
('550e8400-e29b-41d4-a716-446655440001', '2025-12-02', '2025-12-05', 15);
*/

COMMENT ON TABLE package_deals IS 'Stores multiple deal periods for each package with date ranges and slot availability';
COMMENT ON COLUMN package_deals.deal_start_date IS 'Start date of the deal period';
COMMENT ON COLUMN package_deals.deal_end_date IS 'End date of the deal period';
COMMENT ON COLUMN package_deals.slots_available IS 'Total number of booking slots for this deal period';
COMMENT ON COLUMN package_deals.slots_booked IS 'Number of slots already booked (auto-updated by trigger)';
COMMENT ON COLUMN package_deals.is_active IS 'Whether this deal is currently active and bookable';
