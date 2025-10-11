-- Add package_slug column to notifications table
-- This allows us to navigate directly to the trip details page

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS package_slug VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_package_slug ON notifications(package_slug);

-- Add comment
COMMENT ON COLUMN notifications.package_slug IS 'Package slug for direct navigation to trip details page';
