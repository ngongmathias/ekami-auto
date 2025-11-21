-- Add missing columns to bookings table

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(200);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(200);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- Create index on booking_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
