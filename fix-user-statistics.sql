-- =============================================
-- RECALCULATE USER STATISTICS
-- =============================================
-- This script manually updates total_bookings and total_spent
-- for all users based on their actual booking data.
-- Run this if the triggers weren't working or data is out of sync.

-- Update all user statistics based on actual booking data
UPDATE users
SET 
    total_bookings = COALESCE(booking_stats.booking_count, 0),
    total_spent = COALESCE(booking_stats.total_amount, 0),
    updated_at = NOW()
FROM (
    SELECT 
        user_id,
        COUNT(*) as booking_count,
        SUM(total_amount) as total_amount
    FROM bookings
    GROUP BY user_id
) as booking_stats
WHERE users.id = booking_stats.user_id;

-- Reset stats for users with no bookings
UPDATE users
SET 
    total_bookings = 0,
    total_spent = 0,
    updated_at = NOW()
WHERE id NOT IN (
    SELECT DISTINCT user_id 
    FROM bookings 
    WHERE user_id IS NOT NULL
);

-- Verify the update
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.total_bookings,
    u.total_spent,
    COUNT(b.id) as actual_bookings,
    COALESCE(SUM(b.total_amount), 0) as actual_spent
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.email, u.first_name, u.last_name, u.total_bookings, u.total_spent
ORDER BY u.created_at DESC;

-- =============================================
-- RE-CREATE TRIGGER (if it doesn't exist)
-- =============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_stats_trigger ON bookings;

-- Recreate the function
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET 
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Update spent amount if total_amount changed
        IF OLD.total_amount != NEW.total_amount THEN
            UPDATE users 
            SET 
                total_spent = total_spent - OLD.total_amount + NEW.total_amount,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET 
            total_bookings = GREATEST(total_bookings - 1, 0),
            total_spent = GREATEST(total_spent - OLD.total_amount, 0),
            updated_at = NOW()
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply user stats update trigger
CREATE TRIGGER update_user_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Confirm trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'update_user_stats_trigger';

-- =============================================
-- NOTES
-- =============================================
-- 1. Run the UPDATE statements first to sync existing data
-- 2. Run the trigger creation to ensure future bookings update stats automatically
-- 3. Check the verification query to confirm data is correct
