-- Ekami Auto Database Schema
-- Run this in your Supabase SQL Editor

-- Note: uuid-ossp extension is already enabled in Supabase by default

-- =====================================================
-- CARS TABLE
-- =====================================================
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(17) UNIQUE,
  
  -- Pricing
  price_sale DECIMAL(10, 2), -- Sale price (if for sale)
  price_rent_daily DECIMAL(10, 2), -- Daily rental rate
  price_rent_weekly DECIMAL(10, 2), -- Weekly rental rate
  price_rent_monthly DECIMAL(10, 2), -- Monthly rental rate
  
  -- Specifications
  mileage INTEGER,
  fuel_type VARCHAR(50), -- 'Petrol', 'Diesel', 'Electric', 'Hybrid'
  transmission VARCHAR(50), -- 'Automatic', 'Manual'
  body_type VARCHAR(50), -- 'Sedan', 'SUV', 'Pickup', 'Luxury', etc.
  seats INTEGER,
  doors INTEGER,
  color VARCHAR(50),
  engine_size VARCHAR(50),
  
  -- Features (JSON array)
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Availability
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'rented', 'sold', 'maintenance'
  available_for_rent BOOLEAN DEFAULT false,
  available_for_sale BOOLEAN DEFAULT false,
  
  -- Location
  location VARCHAR(100),
  city VARCHAR(100),
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  video_url TEXT,
  
  -- Description
  description TEXT,
  condition VARCHAR(50), -- 'New', 'Excellent', 'Good', 'Fair'
  
  -- Owner (if selling on behalf)
  owner_id UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  
  -- SEO
  slug VARCHAR(200) UNIQUE
);

-- =====================================================
-- BOOKINGS TABLE (Rentals)
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Booking Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location VARCHAR(200),
  dropoff_location VARCHAR(200),
  
  -- Pricing
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  insurance DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(200),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
  
  -- Driver Info
  driver_name VARCHAR(200),
  driver_license VARCHAR(100),
  driver_phone VARCHAR(50),
  
  -- Notes
  special_requests TEXT,
  admin_notes TEXT
);

-- =====================================================
-- PURCHASES TABLE (Car Sales)
-- =====================================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Purchase Details
  purchase_price DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  fees DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'deposit_paid', 'paid', 'failed'
  payment_method VARCHAR(50),
  deposit_amount DECIMAL(10, 2),
  stripe_payment_intent_id VARCHAR(200),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  
  -- Buyer Info
  buyer_name VARCHAR(200),
  buyer_phone VARCHAR(50),
  buyer_address TEXT,
  
  -- Delivery
  delivery_method VARCHAR(50), -- 'pickup', 'delivery'
  delivery_address TEXT,
  delivery_date DATE,
  
  -- Notes
  notes TEXT
);

-- =====================================================
-- REPAIR REQUESTS TABLE
-- =====================================================
CREATE TABLE repair_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer Info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(200),
  
  -- Vehicle Info
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  vin VARCHAR(17),
  mileage INTEGER,
  
  -- Repair Details
  service_type VARCHAR(100), -- 'Maintenance', 'Repair', 'Inspection', 'Body Work'
  description TEXT NOT NULL,
  urgency VARCHAR(50), -- 'Low', 'Medium', 'High', 'Emergency'
  
  -- Scheduling
  preferred_date DATE,
  scheduled_date DATE,
  completion_date DATE,
  
  -- Pricing
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'partial'
  
  -- Images
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Notes
  mechanic_notes TEXT,
  parts_needed TEXT
);

-- =====================================================
-- SELL CAR REQUESTS TABLE (Users selling their cars)
-- =====================================================
CREATE TABLE sell_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Owner Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name VARCHAR(200) NOT NULL,
  owner_phone VARCHAR(50) NOT NULL,
  owner_email VARCHAR(200),
  
  -- Vehicle Info
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR(17),
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  body_type VARCHAR(50),
  color VARCHAR(50),
  
  -- Pricing
  asking_price DECIMAL(10, 2) NOT NULL,
  negotiable BOOLEAN DEFAULT true,
  
  -- Condition
  condition VARCHAR(50),
  description TEXT,
  service_history TEXT,
  accident_history TEXT,
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected', 'sold'
  
  -- Admin Review
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- If approved, link to created car listing
  car_id UUID REFERENCES cars(id)
);

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Content
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  
  -- Media
  featured_image TEXT,
  
  -- Meta
  author_id UUID REFERENCES auth.users(id),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- SEO
  meta_title VARCHAR(200),
  meta_description TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  views INTEGER DEFAULT 0
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Review
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0
);

-- =====================================================
-- USER PROFILES TABLE (Extended user info)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Info
  full_name VARCHAR(200),
  phone VARCHAR(50),
  date_of_birth DATE,
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Driver License
  license_number VARCHAR(100),
  license_expiry DATE,
  license_image TEXT,
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'XAF',
  
  -- Loyalty
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(50) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  
  -- Avatar
  avatar_url TEXT
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_available_rent ON cars(available_for_rent);
CREATE INDEX idx_cars_available_sale ON cars(available_for_sale);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_slug ON cars(slug);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_car ON bookings(car_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_car ON purchases(car_id);
CREATE INDEX idx_purchases_status ON purchases(status);

CREATE INDEX idx_repair_requests_user ON repair_requests(user_id);
CREATE INDEX idx_repair_requests_status ON repair_requests(status);

CREATE INDEX idx_sell_requests_user ON sell_requests(user_id);
CREATE INDEX idx_sell_requests_status ON sell_requests(status);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

CREATE INDEX idx_reviews_car ON reviews(car_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Cars: Public read, authenticated users can create (for selling)
CREATE POLICY "Cars are viewable by everyone" ON cars FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create cars" ON cars FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own cars" ON cars FOR UPDATE USING (owner_id = auth.uid());

-- Bookings: Users can view and create their own bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (user_id = auth.uid());

-- Purchases: Users can view and create their own purchases
CREATE POLICY "Users can view their own purchases" ON purchases FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can create purchases" ON purchases FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Repair Requests: Users can view and create their own requests
CREATE POLICY "Users can view their own repair requests" ON repair_requests FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Anyone can create repair requests" ON repair_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own repair requests" ON repair_requests FOR UPDATE USING (user_id = auth.uid());

-- Sell Requests: Users can view and create their own requests
CREATE POLICY "Users can view their own sell requests" ON sell_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create sell requests" ON sell_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own sell requests" ON sell_requests FOR UPDATE USING (user_id = auth.uid());

-- Blog Posts: Public read, restricted write
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');

-- Reviews: Public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (user_id = auth.uid());

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can create their own profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_requests_updated_at BEFORE UPDATE ON repair_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sell_requests_updated_at BEFORE UPDATE ON sell_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
