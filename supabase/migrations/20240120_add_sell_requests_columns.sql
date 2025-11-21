-- Add missing columns to sell_requests table

-- Add seats and doors
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 5;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS doors INTEGER DEFAULT 4;

-- Add location
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Add notes field (for service history, accidents, modifications)
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename owner fields to seller fields for consistency
ALTER TABLE sell_requests RENAME COLUMN owner_name TO seller_name;
ALTER TABLE sell_requests RENAME COLUMN owner_phone TO seller_phone;
ALTER TABLE sell_requests RENAME COLUMN owner_email TO seller_email;
