-- Create car_history table for tracking vehicle history
CREATE TABLE IF NOT EXISTS car_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Car reference
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  
  -- History type
  type VARCHAR(50) NOT NULL, -- 'maintenance', 'accident', 'ownership', 'inspection', 'repair', 'upgrade'
  
  -- Event details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  mileage INTEGER,
  
  -- Location
  location VARCHAR(255),
  
  -- Cost
  cost NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'XAF',
  
  -- Service provider
  service_provider VARCHAR(255),
  service_provider_contact VARCHAR(100),
  
  -- Documents
  documents JSONB DEFAULT '[]', -- Array of document URLs
  
  -- Severity (for accidents/repairs)
  severity VARCHAR(20), -- 'minor', 'moderate', 'major'
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'pending', 'scheduled'
  
  -- Notes
  notes TEXT,
  
  -- Admin/User who added
  added_by TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_car_history_car_id ON car_history(car_id);
CREATE INDEX idx_car_history_type ON car_history(type);
CREATE INDEX idx_car_history_date ON car_history(date DESC);
CREATE INDEX idx_car_history_status ON car_history(status);

-- Create ownership_history table
CREATE TABLE IF NOT EXISTS ownership_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Car reference
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Owner details
  owner_number INTEGER NOT NULL, -- 1st owner, 2nd owner, etc.
  owner_name VARCHAR(255),
  ownership_start DATE,
  ownership_end DATE,
  
  -- Purchase details
  purchase_price NUMERIC(10, 2),
  purchase_mileage INTEGER,
  
  -- Sale details
  sale_price NUMERIC(10, 2),
  sale_mileage INTEGER,
  
  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_ownership_history_car_id ON ownership_history(car_id);
CREATE INDEX idx_ownership_history_owner_number ON ownership_history(owner_number);

-- Create inspection_reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Car reference
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Inspection details
  inspection_date DATE NOT NULL,
  inspector_name VARCHAR(255),
  inspector_license VARCHAR(100),
  
  -- Mileage at inspection
  mileage INTEGER,
  
  -- Overall condition
  overall_condition VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor'
  
  -- Component ratings (1-10)
  engine_condition INTEGER CHECK (engine_condition BETWEEN 1 AND 10),
  transmission_condition INTEGER CHECK (transmission_condition BETWEEN 1 AND 10),
  brake_condition INTEGER CHECK (brake_condition BETWEEN 1 AND 10),
  suspension_condition INTEGER CHECK (suspension_condition BETWEEN 1 AND 10),
  tire_condition INTEGER CHECK (tire_condition BETWEEN 1 AND 10),
  body_condition INTEGER CHECK (body_condition BETWEEN 1 AND 10),
  interior_condition INTEGER CHECK (interior_condition BETWEEN 1 AND 10),
  electrical_condition INTEGER CHECK (electrical_condition BETWEEN 1 AND 10),
  
  -- Issues found
  issues JSONB DEFAULT '[]', -- Array of issues
  
  -- Recommendations
  recommendations TEXT,
  
  -- Documents
  report_url VARCHAR(500),
  photos JSONB DEFAULT '[]',
  
  -- Pass/Fail
  passed BOOLEAN,
  
  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_inspection_reports_car_id ON inspection_reports(car_id);
CREATE INDEX idx_inspection_reports_date ON inspection_reports(inspection_date DESC);

-- Enable Row Level Security
ALTER TABLE car_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for car_history
CREATE POLICY "Anyone can view car history"
  ON car_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert car history"
  ON car_history FOR INSERT
  WITH CHECK (
    added_by IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

CREATE POLICY "Admins can update car history"
  ON car_history FOR UPDATE
  USING (
    added_by IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

CREATE POLICY "Admins can delete car history"
  ON car_history FOR DELETE
  USING (
    added_by IN ('kerryngong@ekamiauto.com', 'mathiasngongngai@gmail.com')
  );

-- RLS Policies for ownership_history
CREATE POLICY "Anyone can view ownership history"
  ON ownership_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage ownership history"
  ON ownership_history FOR ALL
  USING (true);

-- RLS Policies for inspection_reports
CREATE POLICY "Anyone can view inspection reports"
  ON inspection_reports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage inspection reports"
  ON inspection_reports FOR ALL
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_car_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_car_history_timestamp
  BEFORE UPDATE ON car_history
  FOR EACH ROW
  EXECUTE FUNCTION update_car_history_updated_at();

-- Add comments
COMMENT ON TABLE car_history IS 'Tracks all history events for vehicles including maintenance, accidents, repairs, etc.';
COMMENT ON TABLE ownership_history IS 'Tracks ownership changes for vehicles';
COMMENT ON TABLE inspection_reports IS 'Stores detailed inspection reports for vehicles';
