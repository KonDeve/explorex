-- Add date_added and slots_available columns to packages table
-- date_added will store the date range when the package is available
-- slots_available will store the number of customers allowed to book

-- Add new columns to packages table
ALTER TABLE packages 
ADD COLUMN deal_start_date DATE,
ADD COLUMN deal_end_date DATE,
ADD COLUMN slots_available INTEGER DEFAULT 0,
ADD COLUMN slots_booked INTEGER DEFAULT 0;

-- Add a check constraint to ensure deal_end_date is after deal_start_date
ALTER TABLE packages
ADD CONSTRAINT check_deal_dates CHECK (deal_end_date >= deal_start_date);

-- Add a check constraint to ensure slots_booked doesn't exceed slots_available
ALTER TABLE packages
ADD CONSTRAINT check_slots CHECK (slots_booked <= slots_available);

-- Create index for date queries
CREATE INDEX idx_packages_deal_dates ON packages(deal_start_date, deal_end_date);

-- Create a function to update slots_booked when a booking is confirmed
CREATE OR REPLACE FUNCTION update_package_slots()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND (NEW.status = 'confirmed' OR NEW.status = 'pending') THEN
        -- Increment slots_booked
        UPDATE packages 
        SET slots_booked = slots_booked + 1
        WHERE id = NEW.package_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- If status changed from pending/confirmed to cancelled, decrement
        IF (OLD.status = 'confirmed' OR OLD.status = 'pending') AND NEW.status = 'cancelled' THEN
            UPDATE packages 
            SET slots_booked = GREATEST(0, slots_booked - 1)
            WHERE id = NEW.package_id;
        END IF;
        
        -- If status changed from cancelled to pending/confirmed, increment
        IF OLD.status = 'cancelled' AND (NEW.status = 'confirmed' OR NEW.status = 'pending') THEN
            UPDATE packages 
            SET slots_booked = slots_booked + 1
            WHERE id = NEW.package_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' AND (OLD.status = 'confirmed' OR OLD.status = 'pending') THEN
        -- Decrement slots_booked
        UPDATE packages 
        SET slots_booked = GREATEST(0, slots_booked - 1)
        WHERE id = OLD.package_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
CREATE TRIGGER update_package_slots_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_package_slots();

-- Add a helper function to check if a package has available slots
CREATE OR REPLACE FUNCTION check_package_availability(package_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    pkg RECORD;
BEGIN
    SELECT slots_available, slots_booked, deal_start_date, deal_end_date
    INTO pkg
    FROM packages
    WHERE id = package_uuid;
    
    -- Check if package exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if dates are set and valid
    IF pkg.deal_start_date IS NULL OR pkg.deal_end_date IS NULL THEN
        RETURN TRUE; -- No date restrictions
    END IF;
    
    -- Check if current date is within deal dates
    IF CURRENT_DATE < pkg.deal_start_date OR CURRENT_DATE > pkg.deal_end_date THEN
        RETURN FALSE;
    END IF;
    
    -- Check if slots are available
    IF pkg.slots_available > 0 AND pkg.slots_booked >= pkg.slots_available THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN packages.deal_start_date IS 'Start date of the package availability period';
COMMENT ON COLUMN packages.deal_end_date IS 'End date of the package availability period';
COMMENT ON COLUMN packages.slots_available IS 'Total number of booking slots available for this package deal';
COMMENT ON COLUMN packages.slots_booked IS 'Number of slots already booked (auto-updated by trigger)';
