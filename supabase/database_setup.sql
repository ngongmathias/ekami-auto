-- =====================================================================
-- EKAMI AUTO — COMPLETE DATABASE SETUP (single file)
-- Replaces the old 41-file migration history with ONE clean script.
--
-- HOW TO USE:
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this entire file
--   3. Click "Run"
--   Expected result: "Success. No rows returned"
--
-- Safe to run more than once (idempotent): tables use IF NOT EXISTS,
-- policies are dropped/recreated, functions use CREATE OR REPLACE.
--
-- DESIGN NOTES:
--   * Auth is handled by Clerk, not Supabase Auth. All user IDs are TEXT
--     (Clerk IDs look like "user_2 abc..."), NOT uuid, and there are no
--     foreign keys to auth.users.
--   * RLS is enabled but permissive (the app filters data by user_id).
--     The anon key is public, so do not store secrets in these tables.
-- =====================================================================

-- Needed for uuid_generate_v4(); gen_random_uuid() is built in.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shared helper: keep updated_at fresh on UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to (re)attach the updated_at trigger to a table.
CREATE OR REPLACE FUNCTION attach_updated_at(p_table TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON %1$s', p_table);
  EXECUTE format(
    'CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON %1$s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', p_table);
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
-- CARS
-- =====================================================================
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  car_number VARCHAR(20),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(17),
  price_sale DECIMAL(12,2),
  price_rent_daily DECIMAL(12,2),
  price_rent_weekly DECIMAL(12,2),
  price_rent_monthly DECIMAL(12,2),
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  body_type VARCHAR(50),
  seats INTEGER,
  doors INTEGER,
  color VARCHAR(50),
  engine_size VARCHAR(50),
  features JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'available',
  available_for_rent BOOLEAN DEFAULT false,
  available_for_sale BOOLEAN DEFAULT false,
  location VARCHAR(200),
  city VARCHAR(100),
  current_city VARCHAR(100) DEFAULT 'Yaoundé',
  images JSONB DEFAULT '[]'::jsonb,
  images_360 TEXT[],
  video_url TEXT,
  description TEXT,
  condition VARCHAR(50),
  owner_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  slug VARCHAR(200)
);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_available_rent ON cars(available_for_rent);
CREATE INDEX IF NOT EXISTS idx_cars_available_sale ON cars(available_for_sale);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_car_number ON cars(car_number);
SELECT attach_updated_at('cars');


-- =====================================================================
-- BOOKINGS (rentals) — union of every column the app touches
-- =====================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  booking_reference VARCHAR(50),
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_name TEXT,
  user_id TEXT,
  -- Customer contact (both naming styles are used across the app)
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  customer_phone VARCHAR(50),
  whatsapp VARCHAR(30),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location VARCHAR(200),
  dropoff_location VARCHAR(200),
  daily_rate DECIMAL(12,2),
  total_days INTEGER,
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2) DEFAULT 0,
  insurance DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2),
  extras JSONB DEFAULT '{}'::jsonb,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id TEXT,
  stripe_payment_intent_id VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending',
  driver_name VARCHAR(200),
  driver_license VARCHAR(100),
  driver_phone VARCHAR(50),
  special_requests TEXT,
  admin_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
SELECT attach_updated_at('bookings');


-- =====================================================================
-- PURCHASES (car sales)
-- =====================================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  buyer_id TEXT,
  purchase_price DECIMAL(12,2),
  tax DECIMAL(12,2) DEFAULT 0,
  fees DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  deposit_amount DECIMAL(12,2),
  stripe_payment_intent_id VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending',
  buyer_name VARCHAR(200),
  buyer_phone VARCHAR(50),
  buyer_address TEXT,
  delivery_method VARCHAR(50),
  delivery_address TEXT,
  delivery_date DATE,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_car ON purchases(car_id);
SELECT attach_updated_at('purchases');


-- =====================================================================
-- SELL REQUESTS (users selling their cars)
-- =====================================================================
CREATE TABLE IF NOT EXISTS sell_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  seller_name VARCHAR(200),
  seller_phone VARCHAR(50),
  seller_email VARCHAR(200),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(17),
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  body_type VARCHAR(50),
  color VARCHAR(50),
  seats INTEGER DEFAULT 5,
  doors INTEGER DEFAULT 4,
  asking_price DECIMAL(12,2),
  negotiable BOOLEAN DEFAULT true,
  condition VARCHAR(50),
  description TEXT,
  service_history TEXT,
  accident_history TEXT,
  location VARCHAR(200),
  notes TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  car_id UUID REFERENCES cars(id)
);
CREATE INDEX IF NOT EXISTS idx_sell_requests_user ON sell_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sell_requests_status ON sell_requests(status);
SELECT attach_updated_at('sell_requests');


-- =====================================================================
-- REPAIR SERVICES: packages, mechanics, requests, history, reviews
-- =====================================================================
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  category TEXT NOT NULL,
  includes TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
SELECT attach_updated_at('service_packages');

CREATE TABLE IF NOT EXISTS mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
SELECT attach_updated_at('mechanics');

CREATE TABLE IF NOT EXISTS repair_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  service_package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  mileage INTEGER,
  license_plate TEXT,
  vin TEXT,
  problem_description TEXT,
  urgency_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'received',
  appointment_date DATE,
  appointment_time TEXT,
  preferred_mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  assigned_mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  service_location TEXT DEFAULT 'drop-off',
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  estimated_cost NUMERIC(10,2),
  final_cost NUMERIC(10,2),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_repair_requests_user ON repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
SELECT attach_updated_at('repair_requests');

CREATE TABLE IF NOT EXISTS service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  user_id TEXT,
  service_date TIMESTAMPTZ NOT NULL,
  services_performed TEXT[] DEFAULT '{}',
  parts_replaced TEXT[] DEFAULT '{}',
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  cost NUMERIC(10,2),
  mileage_at_service INTEGER,
  next_service_due DATE,
  warranty_expires DATE,
  service_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_history_user ON service_history(user_id);

CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  user_id TEXT,
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  mechanic_rating INTEGER CHECK (mechanic_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  review_text TEXT,
  would_recommend BOOLEAN DEFAULT true,
  photo_urls TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
SELECT attach_updated_at('service_reviews');


-- =====================================================================
-- BLOG: posts, comments, comment likes
-- =====================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id TEXT,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  meta_title VARCHAR(200),
  meta_description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
SELECT attach_updated_at('blog_posts');

CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
SELECT attach_updated_at('blog_comments');

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Helpers used by the app to keep the likes counter in sync.
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_comments SET likes = likes + 1 WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_comments SET likes = GREATEST(likes - 1, 0) WHERE id = comment_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- CAR COMPARISONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS car_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  car_ids UUID[] NOT NULL,
  title VARCHAR(200),
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(50) UNIQUE,
  view_count INTEGER DEFAULT 0
);
SELECT attach_updated_at('car_comparisons');


-- =====================================================================
-- REVIEWS (car reviews)
-- =====================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  verified_rental BOOLEAN DEFAULT false,
  booking_id UUID,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_reviews_car ON reviews(car_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
SELECT attach_updated_at('reviews');


-- =====================================================================
-- CHAT SYSTEM (AI assistant)
-- =====================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  session_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','closed','transferred')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
SELECT attach_updated_at('chat_conversations');

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);


-- =====================================================================
-- PRICE ALERTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  target_price DECIMAL(12,2),
  current_price DECIMAL(12,2) NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'any_drop',
  percentage_threshold INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_price_alerts_car ON price_alerts(car_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(user_email);
SELECT attach_updated_at('price_alerts');

CREATE TABLE IF NOT EXISTS price_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES price_alerts(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  old_price DECIMAL(12,2) NOT NULL,
  new_price DECIMAL(12,2) NOT NULL,
  price_difference DECIMAL(12,2) NOT NULL,
  percentage_change DECIMAL(5,2) NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
-- MAINTENANCE BLOCKS (car unavailability)
-- =====================================================================
CREATE TABLE IF NOT EXISTS maintenance_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_maintenance_blocks_car ON maintenance_blocks(car_id);
SELECT attach_updated_at('maintenance_blocks');


-- =====================================================================
-- CAR HISTORY: events, ownership, inspections
-- =====================================================================
CREATE TABLE IF NOT EXISTS car_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  mileage INTEGER,
  location VARCHAR(255),
  cost NUMERIC(10,2),
  currency VARCHAR(3) DEFAULT 'XAF',
  service_provider VARCHAR(255),
  service_provider_contact VARCHAR(100),
  documents JSONB DEFAULT '[]'::jsonb,
  severity VARCHAR(20),
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  added_by TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_car_history_car ON car_history(car_id);
SELECT attach_updated_at('car_history');

CREATE TABLE IF NOT EXISTS ownership_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  owner_number INTEGER NOT NULL,
  owner_name VARCHAR(255),
  ownership_start DATE,
  ownership_end DATE,
  purchase_price NUMERIC(10,2),
  purchase_mileage INTEGER,
  sale_price NUMERIC(10,2),
  sale_mileage INTEGER,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_ownership_history_car ON ownership_history(car_id);

CREATE TABLE IF NOT EXISTS inspection_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  inspector_name VARCHAR(255),
  inspector_license VARCHAR(100),
  mileage INTEGER,
  overall_condition VARCHAR(20),
  engine_condition INTEGER CHECK (engine_condition BETWEEN 1 AND 10),
  transmission_condition INTEGER CHECK (transmission_condition BETWEEN 1 AND 10),
  brake_condition INTEGER CHECK (brake_condition BETWEEN 1 AND 10),
  suspension_condition INTEGER CHECK (suspension_condition BETWEEN 1 AND 10),
  tire_condition INTEGER CHECK (tire_condition BETWEEN 1 AND 10),
  body_condition INTEGER CHECK (body_condition BETWEEN 1 AND 10),
  interior_condition INTEGER CHECK (interior_condition BETWEEN 1 AND 10),
  electrical_condition INTEGER CHECK (electrical_condition BETWEEN 1 AND 10),
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT,
  report_url VARCHAR(500),
  photos JSONB DEFAULT '[]'::jsonb,
  passed BOOLEAN,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_car ON inspection_reports(car_id);


-- =====================================================================
-- LOYALTY PROGRAM: tiers, members, transactions, rewards, redemptions
-- =====================================================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  points_required INTEGER NOT NULL,
  points_multiplier NUMERIC(3,2) DEFAULT 1.00,
  discount_percentage INTEGER DEFAULT 0,
  perks JSONB DEFAULT '[]'::jsonb,
  color VARCHAR(20),
  icon_url VARCHAR(500),
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze',
  tier_progress INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  tier_achieved_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_user ON loyalty_members(user_id);
SELECT attach_updated_at('loyalty_members');

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id TEXT,
  description TEXT,
  balance_after INTEGER,
  expires_at TIMESTAMPTZ,
  created_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_member ON loyalty_transactions(member_id);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  discount_percentage INTEGER,
  discount_amount NUMERIC(10,2),
  available BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  min_tier VARCHAR(20),
  max_redemptions_per_user INTEGER,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  image_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false
);
SELECT attach_updated_at('loyalty_rewards');

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  member_id UUID REFERENCES loyalty_members(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES loyalty_rewards(id),
  points_used INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  used_at TIMESTAMPTZ,
  used_on_booking_id TEXT,
  expires_at TIMESTAMPTZ,
  redemption_code VARCHAR(50) UNIQUE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_member ON loyalty_redemptions(member_id);


-- =====================================================================
-- USER PROFILES (synced from Clerk; TEXT id)
-- =====================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze',
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": true}'::jsonb,
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
SELECT attach_updated_at('user_profiles');

CREATE OR REPLACE FUNCTION update_loyalty_points(user_id_param TEXT, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET loyalty_points = loyalty_points + points_to_add, updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- ROW LEVEL SECURITY
-- RLS is enabled on every table; policies are permissive because the
-- app authenticates with Clerk (not Supabase Auth) and filters by
-- user_id in application code. Public catalog tables allow read to all.
-- =====================================================================
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'cars','bookings','purchases','sell_requests',
    'service_packages','mechanics','repair_requests','service_history','service_reviews',
    'blog_posts','blog_comments','comment_likes','car_comparisons','reviews',
    'chat_conversations','chat_messages','price_alerts','price_alert_history',
    'maintenance_blocks','car_history','ownership_history','inspection_reports',
    'loyalty_tiers','loyalty_members','loyalty_transactions','loyalty_rewards','loyalty_redemptions',
    'user_profiles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "app_full_access" ON %I', t);
    -- Single permissive policy: app handles per-user filtering.
    EXECUTE format(
      'CREATE POLICY "app_full_access" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;


-- =====================================================================
-- STORAGE BUCKET for car images
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cars', 'cars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "cars_bucket_read"   ON storage.objects;
DROP POLICY IF EXISTS "cars_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "cars_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "cars_bucket_delete" ON storage.objects;
CREATE POLICY "cars_bucket_read"   ON storage.objects FOR SELECT USING (bucket_id = 'cars');
CREATE POLICY "cars_bucket_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cars');
CREATE POLICY "cars_bucket_update" ON storage.objects FOR UPDATE USING (bucket_id = 'cars');
CREATE POLICY "cars_bucket_delete" ON storage.objects FOR DELETE USING (bucket_id = 'cars');


-- =====================================================================
-- SEED DATA (only inserted when the table is empty)
-- =====================================================================

-- Loyalty tiers
INSERT INTO loyalty_tiers (tier_name, display_name, points_required, points_multiplier, discount_percentage, perks, color, display_order) VALUES
  ('bronze','Bronze',0,1.00,0,'["Welcome bonus","Birthday bonus","Exclusive offers"]','#CD7F32',1),
  ('silver','Silver',1000,1.25,5,'["25% bonus points","5% discount","Priority support","Free car wash"]','#C0C0C0',2),
  ('gold','Gold',5000,1.50,10,'["50% bonus points","10% discount","Free upgrades","VIP support","Free delivery"]','#FFD700',3),
  ('platinum','Platinum',15000,2.00,15,'["100% bonus points","15% discount","Guaranteed upgrades","Dedicated manager","Free insurance"]','#E5E4E2',4)
ON CONFLICT (tier_name) DO NOTHING;

-- Mechanics (email is unique, so safe to re-run)
INSERT INTO mechanics (name, email, phone, specialties, years_experience, certifications, rating) VALUES
  ('Jean-Paul Mbarga','jp.mbarga@ekamiauto.com','+237 6 70 12 34 56','{Engine,Transmission,Diagnostics}',12,'{"ASE Master Technician","Toyota Certified"}',4.8),
  ('Marie Nguema','marie.nguema@ekamiauto.com','+237 6 71 23 45 67','{Brakes,Suspension,Electrical}',8,'{"ASE Certified","BMW Specialist"}',4.9),
  ('Paul Essomba','paul.essomba@ekamiauto.com','+237 6 72 34 56 78','{AC,Electrical,Diagnostics}',10,'{"ASE Certified","Mercedes-Benz Certified"}',4.7),
  ('Sophie Kamga','sophie.kamga@ekamiauto.com','+237 6 73 45 67 89','{Maintenance,Inspection,Tires}',6,'{"ASE Certified"}',4.8)
ON CONFLICT (email) DO NOTHING;

-- Service packages (no natural key -> only seed when empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM service_packages) THEN
    INSERT INTO service_packages (name, description, price, duration_minutes, category, includes) VALUES
      ('Oil Change Package','Complete oil change with premium oil and filter',15000,45,'Maintenance','{"Premium engine oil","Oil filter replacement","Fluid level check","Tire pressure check"}'),
      ('Brake Service','Comprehensive brake inspection and service',25000,90,'Brakes','{"Brake pad inspection","Rotor inspection","Brake fluid check","Test drive"}'),
      ('Full Vehicle Inspection','Complete 50-point vehicle inspection',35000,120,'Inspection','{"Engine diagnostics","Brake system check","Suspension inspection","Electrical check","Detailed report"}'),
      ('Engine Diagnostics','Advanced computer diagnostics',40000,60,'Engine','{"OBD-II scan","Error code analysis","Performance testing","Diagnostic report"}'),
      ('AC Service','Air conditioning service and recharge',20000,75,'Electrical','{"AC inspection","Refrigerant recharge","Leak detection","Performance test"}'),
      ('Transmission Service','Transmission fluid change and inspection',50000,120,'Transmission','{"Fluid replacement","Filter replacement","System inspection","Test drive"}'),
      ('Tire Rotation & Balance','Professional tire rotation and balancing',12000,45,'Tires','{"Tire rotation","Wheel balancing","Pressure adjustment","Visual inspection"}'),
      ('Battery Replacement','Battery testing and replacement',30000,30,'Electrical','{"Battery testing","New battery installation","Terminal cleaning","Charging system check"}');
  END IF;
END $$;

-- Loyalty rewards (no natural key -> only seed when empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM loyalty_rewards) THEN
    INSERT INTO loyalty_rewards (name, description, points_required, reward_type, discount_percentage, available, min_tier, display_order, featured) VALUES
      ('5% Discount Voucher','Get 5% off your next booking',500,'discount',5,true,'bronze',1,true),
      ('10% Discount Voucher','Get 10% off your next booking',1000,'discount',10,true,'silver',2,true),
      ('Free Car Wash','Complimentary car wash service',300,'freebie',NULL,true,'bronze',3,false),
      ('Free Upgrade','Upgrade to the next car category',1500,'upgrade',NULL,true,'silver',4,true),
      ('20% Discount Voucher','Get 20% off your next booking',2000,'discount',20,true,'gold',5,true);
  END IF;
END $$;

-- Done. Tidy up the helper used during setup.
DROP FUNCTION IF EXISTS attach_updated_at(TEXT);

SELECT 'Ekami Auto database setup complete.' AS status;
