-- Create user_profiles table to store customer information
-- This syncs with Clerk authentication

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID (not UUID)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  full_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Loyalty Program
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze',
  
  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": true}'::jsonb,
  
  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_loyalty_points ON user_profiles(loyalty_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'kerryngong@gmail.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Function to automatically create user profile on first login
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, created_at)
  VALUES (NEW.id::text, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
-- Note: This works with Supabase Auth, but Clerk users need manual sync
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();

-- Function to update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points(
  user_id_param TEXT,
  points_to_add INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    loyalty_points = loyalty_points + points_to_add,
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats after booking
CREATE OR REPLACE FUNCTION update_user_stats_after_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total bookings and spent
  UPDATE user_profiles
  SET 
    total_bookings = total_bookings + 1,
    total_spent = total_spent + COALESCE(NEW.total_amount, 0),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE user_profiles IS 'Customer profiles synced from Clerk authentication';
