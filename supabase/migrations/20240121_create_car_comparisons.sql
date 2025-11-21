-- Create car_comparisons table for saved comparisons
CREATE TABLE IF NOT EXISTS car_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User who created the comparison (optional - can be anonymous)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cars being compared (array of car IDs)
  car_ids UUID[] NOT NULL,
  
  -- Metadata
  title VARCHAR(200),
  notes TEXT,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(50) UNIQUE,
  
  -- Stats
  view_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_car_comparisons_user_id ON car_comparisons(user_id);
CREATE INDEX idx_car_comparisons_share_token ON car_comparisons(share_token);
CREATE INDEX idx_car_comparisons_created_at ON car_comparisons(created_at DESC);

-- Enable RLS
ALTER TABLE car_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view public comparisons
CREATE POLICY "Anyone can view public comparisons"
  ON car_comparisons FOR SELECT
  USING (is_public = true);

-- Users can view their own comparisons
CREATE POLICY "Users can view own comparisons"
  ON car_comparisons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can create comparisons
CREATE POLICY "Authenticated users can create comparisons"
  ON car_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comparisons
CREATE POLICY "Users can update own comparisons"
  ON car_comparisons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comparisons
CREATE POLICY "Users can delete own comparisons"
  ON car_comparisons FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(8), 'hex');
    SELECT EXISTS(SELECT 1 FROM car_comparisons WHERE share_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_car_comparisons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_car_comparisons_updated_at_trigger
BEFORE UPDATE ON car_comparisons
FOR EACH ROW
EXECUTE FUNCTION update_car_comparisons_updated_at();
