-- Complete Setup Script - Run this ONCE to set up everything
-- This combines all necessary migrations into one script

-- ============================================
-- 1. ADD WHATSAPP FIELD TO BOOKINGS
-- ============================================

-- Add whatsapp column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE bookings ADD COLUMN whatsapp VARCHAR(20);
  END IF;
END $$;

-- Make email optional
ALTER TABLE bookings ALTER COLUMN customer_email DROP NOT NULL;

-- Update existing bookings with placeholder WhatsApp
UPDATE bookings 
SET whatsapp = '+237600000000' 
WHERE whatsapp IS NULL;

-- ============================================
-- 2. ADD CAR LOCATION FIELD
-- ============================================

-- Add current_city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cars' AND column_name = 'current_city'
  ) THEN
    ALTER TABLE cars ADD COLUMN current_city VARCHAR(100) DEFAULT 'Yaoundé';
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cars_current_city ON cars(current_city);

-- Update existing cars
UPDATE cars 
SET current_city = 'Yaoundé' 
WHERE current_city IS NULL;

-- ============================================
-- 3. CREATE LOYALTY PROGRAM TABLES
-- ============================================

-- Create loyalty_tiers table
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  points_required INTEGER NOT NULL,
  points_multiplier DECIMAL(3,2) DEFAULT 1.0,
  discount_percentage INTEGER DEFAULT 0,
  perks TEXT[],
  color VARCHAR(50),
  display_order INTEGER,
  active BOOLEAN DEFAULT true
);

-- Create loyalty_members table
CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',
  tier_progress INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'adjust')),
  source VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  balance_after INTEGER,
  booking_id UUID,
  created_by VARCHAR(255)
);

-- Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  min_tier VARCHAR(50) DEFAULT 'bronze',
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  terms TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER
);

-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'used', 'expired', 'cancelled')),
  code VARCHAR(50) UNIQUE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  booking_id UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_members_user_id ON loyalty_members(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_email ON loyalty_members(email);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_tier ON loyalty_members(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_member_id ON loyalty_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_member_id ON loyalty_redemptions(member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_status ON loyalty_redemptions(status);

-- Insert default tiers
INSERT INTO loyalty_tiers (tier_name, display_name, points_required, points_multiplier, discount_percentage, perks, color, display_order)
VALUES 
  ('bronze', 'Bronze', 0, 1.0, 5, ARRAY['5% discount on rentals', 'Birthday bonus points', 'Priority support'], '#CD7F32', 1),
  ('silver', 'Silver', 1000, 1.25, 10, ARRAY['10% discount on rentals', 'Free GPS rental', 'Early access to new cars', 'Birthday bonus points'], '#C0C0C0', 2),
  ('gold', 'Gold', 5000, 1.5, 15, ARRAY['15% discount on rentals', 'Free insurance upgrade', 'Priority booking', 'Exclusive offers'], '#FFD700', 3),
  ('platinum', 'Platinum', 15000, 2.0, 20, ARRAY['20% discount on rentals', 'Free chauffeur service', 'VIP lounge access', 'Concierge service'], '#E5E4E2', 4)
ON CONFLICT (tier_name) DO NOTHING;

-- Insert sample rewards
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, discount_percentage, min_tier, available, featured, display_order)
VALUES 
  ('10% Off Next Rental', 'Get 10% off your next car rental', 500, 'discount', 10, 'bronze', true, true, 1),
  ('Free Weekend Upgrade', 'Upgrade to a premium car for the weekend', 1000, 'upgrade', 0, 'silver', true, true, 2),
  ('Free GPS for a Month', 'Get free GPS navigation for 30 days', 750, 'addon', 0, 'bronze', true, false, 3),
  ('20% Off Next Rental', 'Get 20% off your next car rental', 1500, 'discount', 20, 'silver', true, true, 4),
  ('Free Insurance Upgrade', 'Premium insurance coverage at no cost', 2000, 'insurance', 0, 'gold', true, false, 5)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_members
CREATE POLICY "Users can view own member profile" ON loyalty_members
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own member profile" ON loyalty_members
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Anyone can insert member profile" ON loyalty_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all members" ON loyalty_members
  FOR SELECT USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_transactions
CREATE POLICY "Users can view own transactions" ON loyalty_transactions
  FOR SELECT USING (
    member_id IN (SELECT id FROM loyalty_members WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Anyone can insert transactions" ON loyalty_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for loyalty_rewards
CREATE POLICY "Anyone can view available rewards" ON loyalty_rewards
  FOR SELECT USING (available = true);

CREATE POLICY "Admins can manage rewards" ON loyalty_rewards
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'kerryngong@gmail.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_redemptions
CREATE POLICY "Users can view own redemptions" ON loyalty_redemptions
  FOR SELECT USING (
    member_id IN (SELECT id FROM loyalty_members WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Users can create redemptions" ON loyalty_redemptions
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM loyalty_members WHERE user_id = auth.uid()::text)
  );

-- RLS Policies for loyalty_tiers
CREATE POLICY "Anyone can view tiers" ON loyalty_tiers
  FOR SELECT USING (active = true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check what was created
DO $$ 
BEGIN
  RAISE NOTICE 'Setup complete! Created tables:';
  RAISE NOTICE '- loyalty_tiers: % rows', (SELECT COUNT(*) FROM loyalty_tiers);
  RAISE NOTICE '- loyalty_members: % rows', (SELECT COUNT(*) FROM loyalty_members);
  RAISE NOTICE '- loyalty_rewards: % rows', (SELECT COUNT(*) FROM loyalty_rewards);
  RAISE NOTICE '- Bookings have whatsapp field: %', (
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'whatsapp'
    )
  );
  RAISE NOTICE '- Cars have current_city field: %', (
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'cars' AND column_name = 'current_city'
    )
  );
END $$;
