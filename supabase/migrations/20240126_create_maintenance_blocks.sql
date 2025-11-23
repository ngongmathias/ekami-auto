-- Create maintenance_blocks table
CREATE TABLE IF NOT EXISTS maintenance_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Create index for faster queries
CREATE INDEX idx_maintenance_blocks_car_id ON maintenance_blocks(car_id);
CREATE INDEX idx_maintenance_blocks_dates ON maintenance_blocks(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE maintenance_blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view maintenance blocks (to check availability)
CREATE POLICY "Anyone can view maintenance blocks"
  ON maintenance_blocks
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert maintenance blocks
CREATE POLICY "Admins can insert maintenance blocks"
  ON maintenance_blocks
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Policy: Only admins can update maintenance blocks
CREATE POLICY "Admins can update maintenance blocks"
  ON maintenance_blocks
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Policy: Only admins can delete maintenance blocks
CREATE POLICY "Admins can delete maintenance blocks"
  ON maintenance_blocks
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_maintenance_blocks_timestamp
  BEFORE UPDATE ON maintenance_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_blocks_updated_at();

-- Comment on table
COMMENT ON TABLE maintenance_blocks IS 'Stores maintenance and unavailability periods for cars';
COMMENT ON COLUMN maintenance_blocks.car_id IS 'Reference to the car being maintained';
COMMENT ON COLUMN maintenance_blocks.start_date IS 'Start date of maintenance period';
COMMENT ON COLUMN maintenance_blocks.end_date IS 'End date of maintenance period';
COMMENT ON COLUMN maintenance_blocks.reason IS 'Reason for blocking dates (e.g., maintenance, repairs)';
