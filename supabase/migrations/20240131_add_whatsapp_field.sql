-- Add WhatsApp field to bookings table and make email optional
-- This aligns with Cameroon's preference for WhatsApp over email

-- Add whatsapp column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Make email nullable (optional)
ALTER TABLE bookings 
ALTER COLUMN customer_email DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN bookings.whatsapp IS 'Customer WhatsApp number for notifications (required)';
COMMENT ON COLUMN bookings.customer_email IS 'Customer email (optional)';

-- Update existing bookings to have a placeholder WhatsApp if needed
-- (In production, you might want to handle this differently)
UPDATE bookings 
SET whatsapp = '+237600000000' 
WHERE whatsapp IS NULL;
