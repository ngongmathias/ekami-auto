-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS service_reviews CASCADE;
DROP TABLE IF EXISTS service_history CASCADE;
DROP TABLE IF EXISTS repair_requests CASCADE;
DROP TABLE IF EXISTS mechanics CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;

-- Create service_packages table
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  category TEXT NOT NULL,
  includes TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mechanics table
CREATE TABLE mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repair_requests table
CREATE TABLE repair_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  estimated_cost NUMERIC(10, 2),
  final_cost NUMERIC(10, 2),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create service_history table
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date TIMESTAMP WITH TIME ZONE NOT NULL,
  services_performed TEXT[] DEFAULT '{}',
  parts_replaced TEXT[] DEFAULT '{}',
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  cost NUMERIC(10, 2) NOT NULL,
  mileage_at_service INTEGER,
  next_service_due DATE,
  warranty_expires DATE,
  service_report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_reviews table
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_request_id UUID REFERENCES repair_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  mechanic_rating INTEGER CHECK (mechanic_rating >= 1 AND mechanic_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN DEFAULT true,
  photo_urls TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_repair_requests_user_id ON repair_requests(user_id);
CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_appointment_date ON repair_requests(appointment_date);
CREATE INDEX idx_repair_requests_assigned_mechanic ON repair_requests(assigned_mechanic_id);
CREATE INDEX idx_service_history_user_id ON service_history(user_id);
CREATE INDEX idx_service_reviews_repair_request ON service_reviews(repair_request_id);
CREATE INDEX idx_service_reviews_approved ON service_reviews(is_approved);

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_packages
CREATE POLICY "Service packages viewable by everyone"
  ON service_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage service packages"
  ON service_packages FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

-- RLS Policies for mechanics
CREATE POLICY "Active mechanics viewable by everyone"
  ON mechanics FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage mechanics"
  ON mechanics FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

-- RLS Policies for repair_requests
CREATE POLICY "Users view own repair requests"
  ON repair_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create repair requests"
  ON repair_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending requests"
  ON repair_requests FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('received', 'scheduled'));

CREATE POLICY "Admins view all repair requests"
  ON repair_requests FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

CREATE POLICY "Admins manage all repair requests"
  ON repair_requests FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

-- RLS Policies for service_history
CREATE POLICY "Users view own service history"
  ON service_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage service history"
  ON service_history FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

-- RLS Policies for service_reviews
CREATE POLICY "Approved reviews viewable by everyone"
  ON service_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users view own reviews"
  ON service_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create reviews"
  ON service_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all reviews"
  ON service_reviews FOR ALL
  USING (auth.jwt() ->> 'email' IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com'));

-- Insert default service packages
INSERT INTO service_packages (name, description, price, duration_minutes, category, includes) VALUES
('Oil Change Package', 'Complete oil change service with premium oil and filter replacement', 15000, 45, 'Maintenance', ARRAY['Premium engine oil', 'Oil filter replacement', 'Fluid level check', 'Tire pressure check']),
('Brake Service', 'Comprehensive brake inspection and service', 25000, 90, 'Brakes', ARRAY['Brake pad inspection', 'Rotor inspection', 'Brake fluid check', 'Test drive']),
('Full Vehicle Inspection', 'Complete 50-point vehicle inspection', 35000, 120, 'Inspection', ARRAY['Engine diagnostics', 'Brake system check', 'Suspension inspection', 'Electrical system check', 'Fluid levels', 'Tire condition', 'Detailed report']),
('Engine Diagnostics', 'Advanced computer diagnostics for engine issues', 40000, 60, 'Engine', ARRAY['OBD-II scan', 'Error code analysis', 'Performance testing', 'Detailed diagnostic report']),
('AC Service', 'Air conditioning system service and recharge', 20000, 75, 'Electrical', ARRAY['AC system inspection', 'Refrigerant recharge', 'Leak detection', 'Performance test']),
('Transmission Service', 'Complete transmission fluid change and inspection', 50000, 120, 'Transmission', ARRAY['Transmission fluid replacement', 'Filter replacement', 'System inspection', 'Test drive']),
('Tire Rotation & Balance', 'Professional tire rotation and balancing service', 12000, 45, 'Tires', ARRAY['Tire rotation', 'Wheel balancing', 'Pressure adjustment', 'Visual inspection']),
('Battery Replacement', 'Battery testing and replacement service', 30000, 30, 'Electrical', ARRAY['Battery testing', 'New battery installation', 'Terminal cleaning', 'Charging system check']);

-- Insert sample mechanics
INSERT INTO mechanics (name, email, phone, specialties, years_experience, certifications, rating) VALUES
('Jean-Paul Mbarga', 'jp.mbarga@ekamiauto.com', '+237 6 70 12 34 56', ARRAY['Engine', 'Transmission', 'Diagnostics'], 12, ARRAY['ASE Master Technician', 'Toyota Certified'], 4.8),
('Marie Nguema', 'marie.nguema@ekamiauto.com', '+237 6 71 23 45 67', ARRAY['Brakes', 'Suspension', 'Electrical'], 8, ARRAY['ASE Certified', 'BMW Specialist'], 4.9),
('Paul Essomba', 'paul.essomba@ekamiauto.com', '+237 6 72 34 56 78', ARRAY['AC', 'Electrical', 'Diagnostics'], 10, ARRAY['ASE Certified', 'Mercedes-Benz Certified'], 4.7),
('Sophie Kamga', 'sophie.kamga@ekamiauto.com', '+237 6 73 45 67 89', ARRAY['Maintenance', 'Inspection', 'Tires'], 6, ARRAY['ASE Certified'], 4.8);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON service_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON mechanics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_requests_updated_at BEFORE UPDATE ON repair_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at BEFORE UPDATE ON service_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
