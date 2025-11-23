-- ============================================
-- COMPREHENSIVE DATABASE FIX
-- Fixes all user_id references for Clerk auth
-- Run this to fix comments, reviews, bookings
-- ============================================

-- WARNING: This will recreate blog_comments and reviews tables
-- Existing data will be lost unless you backup first!

-- 1. Fix blog_comments table
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;

CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Post reference
  post_id TEXT NOT NULL,
  
  -- User info (from Clerk)
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  
  -- Moderation
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  
  -- Engagement
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE
);

-- Indexes for blog_comments
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- Comment likes table
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for blog_comments
CREATE POLICY "Anyone can read approved comments"
  ON blog_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create comments"
  ON blog_comments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  USING (auth.uid()::text = user_id);

-- Policies for comment_likes
CREATE POLICY "Anyone can read likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid()::text = user_id);

-- 2. Fix reviews table
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Car reference
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  
  -- User info (from Clerk)
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  user_email TEXT,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  
  -- Verification
  verified_rental BOOLEAN DEFAULT FALSE,
  booking_id UUID,
  
  -- Moderation
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0
);

-- Indexes for reviews
CREATE INDEX idx_reviews_car_id ON reviews(car_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 3. Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User info (from Clerk)
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  user_whatsapp TEXT,
  
  -- Car reference
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_name TEXT NOT NULL,
  
  -- Booking details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location TEXT,
  dropoff_location TEXT,
  
  -- Pricing
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Extras
  extras JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  
  -- Notes
  special_requests TEXT,
  admin_notes TEXT
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for bookings
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'kerryngong@gmail.com',
      'mathiasngongngai@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'kerryngong@gmail.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- 4. Sync loyalty_members with user_profiles
CREATE OR REPLACE FUNCTION sync_loyalty_member()
RETURNS TRIGGER AS $$
BEGIN
  -- When user_profile is created, create loyalty member if loyalty_members table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loyalty_members') THEN
    INSERT INTO loyalty_members (
      user_id,
      email,
      full_name,
      phone,
      points_balance,
      tier_id,
      status
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.full_name,
      NEW.phone,
      COALESCE(NEW.loyalty_points, 0),
      (SELECT id FROM loyalty_tiers WHERE tier_name = 'Bronze' LIMIT 1),
      'active'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      points_balance = EXCLUDED.points_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync loyalty member
DROP TRIGGER IF EXISTS sync_loyalty_member_trigger ON user_profiles;
CREATE TRIGGER sync_loyalty_member_trigger
  AFTER INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_loyalty_member();

-- 5. Add helpful functions
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_comments
  SET likes = likes + 1
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_comments
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Comments
COMMENT ON TABLE blog_comments IS 'Blog comments with Clerk user authentication';
COMMENT ON TABLE reviews IS 'Car reviews with Clerk user authentication';
COMMENT ON TABLE bookings IS 'Car rental bookings with Clerk user authentication';

-- Done!
SELECT 'Database comprehensive fix complete! Comments, reviews, and bookings are now working.' as status;
