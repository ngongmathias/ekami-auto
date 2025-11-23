-- Create loyalty_members table
CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  
  -- Points
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0, -- Points not yet redeemed
  lifetime_points INTEGER DEFAULT 0, -- All points ever earned
  
  -- Tier
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  tier_progress INTEGER DEFAULT 0, -- Points towards next tier
  
  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'inactive'
  
  -- Dates
  tier_achieved_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Member reference
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  
  -- Transaction details
  type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'expire', 'adjust'
  source VARCHAR(50) NOT NULL, -- 'booking', 'referral', 'review', 'bonus', 'redemption'
  
  -- Points
  points INTEGER NOT NULL, -- Positive for earn, negative for redeem
  
  -- Reference
  reference_type VARCHAR(50), -- 'booking', 'referral', 'review'
  reference_id TEXT,
  
  -- Description
  description TEXT,
  
  -- Balance after transaction
  balance_after INTEGER NOT NULL,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin
  created_by TEXT
);

-- Create loyalty_rewards table (catalog of available rewards)
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reward details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Cost
  points_required INTEGER NOT NULL,
  
  -- Type
  reward_type VARCHAR(50) NOT NULL, -- 'discount', 'upgrade', 'freebie', 'voucher'
  
  -- Value
  discount_percentage INTEGER, -- For discount type
  discount_amount NUMERIC(10, 2), -- Fixed discount amount
  
  -- Availability
  available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER, -- NULL for unlimited
  
  -- Restrictions
  min_tier VARCHAR(20), -- Minimum tier required
  max_redemptions_per_user INTEGER, -- NULL for unlimited
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Display
  image_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE
);

-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Member reference
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  
  -- Reward reference
  reward_id UUID REFERENCES loyalty_rewards(id),
  
  -- Points used
  points_used INTEGER NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'used', 'expired', 'cancelled'
  
  -- Usage
  used_at TIMESTAMP WITH TIME ZONE,
  used_on_booking_id TEXT,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Code (for vouchers)
  redemption_code VARCHAR(50) UNIQUE,
  
  -- Admin
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create loyalty_tiers table (tier definitions)
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tier details
  tier_name VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  
  -- Requirements
  points_required INTEGER NOT NULL,
  
  -- Benefits
  points_multiplier NUMERIC(3, 2) DEFAULT 1.00, -- 1.0 = 100%, 1.5 = 150%
  discount_percentage INTEGER DEFAULT 0,
  
  -- Perks (JSON array of benefits)
  perks JSONB DEFAULT '[]',
  
  -- Display
  color VARCHAR(20),
  icon_url VARCHAR(500),
  display_order INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_loyalty_members_user_id ON loyalty_members(user_id);
CREATE INDEX idx_loyalty_members_tier ON loyalty_members(tier);
CREATE INDEX idx_loyalty_members_email ON loyalty_members(email);

CREATE INDEX idx_loyalty_transactions_member_id ON loyalty_transactions(member_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);

CREATE INDEX idx_loyalty_rewards_available ON loyalty_rewards(available);
CREATE INDEX idx_loyalty_rewards_points ON loyalty_rewards(points_required);

CREATE INDEX idx_loyalty_redemptions_member_id ON loyalty_redemptions(member_id);
CREATE INDEX idx_loyalty_redemptions_status ON loyalty_redemptions(status);
CREATE INDEX idx_loyalty_redemptions_code ON loyalty_redemptions(redemption_code);

-- Enable Row Level Security
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_members
CREATE POLICY "Users can view their own loyalty profile"
  ON loyalty_members FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can view all loyalty profiles"
  ON loyalty_members FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

CREATE POLICY "Admins can manage loyalty profiles"
  ON loyalty_members FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_transactions
CREATE POLICY "Users can view their own transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM loyalty_members 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

CREATE POLICY "Admins can manage transactions"
  ON loyalty_transactions FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_rewards
CREATE POLICY "Anyone can view available rewards"
  ON loyalty_rewards FOR SELECT
  USING (available = true);

CREATE POLICY "Admins can manage rewards"
  ON loyalty_rewards FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM loyalty_members 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Users can create redemptions"
  ON loyalty_redemptions FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM loyalty_members 
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Admins can manage redemptions"
  ON loyalty_redemptions FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for loyalty_tiers
CREATE POLICY "Anyone can view tiers"
  ON loyalty_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tiers"
  ON loyalty_tiers FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email') IN 
    ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loyalty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_loyalty_members_timestamp
  BEFORE UPDATE ON loyalty_members
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_updated_at();

CREATE TRIGGER update_loyalty_rewards_timestamp
  BEFORE UPDATE ON loyalty_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_updated_at();

-- Insert default tier definitions
INSERT INTO loyalty_tiers (tier_name, display_name, points_required, points_multiplier, discount_percentage, perks, color, display_order) VALUES
('bronze', 'Bronze', 0, 1.00, 0, '["Welcome bonus: 100 points", "Birthday bonus", "Exclusive offers"]', '#CD7F32', 1),
('silver', 'Silver', 1000, 1.25, 5, '["25% bonus points", "5% discount on all bookings", "Priority support", "Free car wash"]', '#C0C0C0', 2),
('gold', 'Gold', 5000, 1.50, 10, '["50% bonus points", "10% discount on all bookings", "Free upgrades (subject to availability)", "VIP support", "Free delivery"]', '#FFD700', 3),
('platinum', 'Platinum', 15000, 2.00, 15, '["100% bonus points", "15% discount on all bookings", "Guaranteed free upgrades", "Dedicated account manager", "Free insurance", "Airport pickup"]', '#E5E4E2', 4);

-- Insert sample rewards
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, discount_percentage, available, min_tier, display_order, featured) VALUES
('5% Discount Voucher', 'Get 5% off your next booking', 500, 'discount', 5, true, 'bronze', 1, true),
('10% Discount Voucher', 'Get 10% off your next booking', 1000, 'discount', 10, true, 'silver', 2, true),
('Free Car Wash', 'Complimentary car wash service', 300, 'freebie', NULL, true, 'bronze', 3, false),
('Free Upgrade', 'Upgrade to the next car category', 1500, 'upgrade', NULL, true, 'silver', 4, true),
('20% Discount Voucher', 'Get 20% off your next booking', 2000, 'discount', 20, true, 'gold', 5, true),
('Weekend Special', 'Free weekend rental (Friday-Sunday)', 5000, 'freebie', NULL, true, 'gold', 6, true),
('VIP Package', 'Premium service package with all perks', 10000, 'freebie', NULL, true, 'platinum', 7, true);

-- Add comments
COMMENT ON TABLE loyalty_members IS 'Stores loyalty program member information and points balance';
COMMENT ON TABLE loyalty_transactions IS 'Records all points earning and redemption transactions';
COMMENT ON TABLE loyalty_rewards IS 'Catalog of available rewards that can be redeemed';
COMMENT ON TABLE loyalty_redemptions IS 'Tracks reward redemptions by members';
COMMENT ON TABLE loyalty_tiers IS 'Defines loyalty tier levels and their benefits';
