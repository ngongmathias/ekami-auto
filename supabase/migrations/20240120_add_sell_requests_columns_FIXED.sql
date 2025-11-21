-- Add missing columns to sell_requests table (FIXED VERSION)

-- Add seats and doors if they don't exist
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 5;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS doors INTEGER DEFAULT 4;

-- Add location if it doesn't exist
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Add notes field if it doesn't exist (for service history, accidents, modifications)
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add seller fields if they don't exist (instead of renaming)
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS seller_name VARCHAR(200);
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(50);
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS seller_email VARCHAR(200);

-- Copy data from owner fields to seller fields if owner fields exist
DO $$
BEGIN
  -- Check if owner_name column exists and copy data
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sell_requests' AND column_name = 'owner_name') THEN
    UPDATE sell_requests SET seller_name = owner_name WHERE seller_name IS NULL;
  END IF;
  
  -- Check if owner_phone column exists and copy data
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sell_requests' AND column_name = 'owner_phone') THEN
    UPDATE sell_requests SET seller_phone = owner_phone WHERE seller_phone IS NULL;
  END IF;
  
  -- Check if owner_email column exists and copy data
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sell_requests' AND column_name = 'owner_email') THEN
    UPDATE sell_requests SET seller_email = owner_email WHERE seller_email IS NULL;
  END IF;
END $$;
