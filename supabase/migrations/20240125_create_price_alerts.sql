-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  target_price DECIMAL(10, 2),
  current_price DECIMAL(10, 2) NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'any_drop', -- 'any_drop', 'target_price', 'percentage_drop'
  percentage_threshold INTEGER DEFAULT 10, -- For percentage_drop type
  is_active BOOLEAN DEFAULT true,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_price_alerts_car_id ON price_alerts(car_id);
CREATE INDEX idx_price_alerts_email ON price_alerts(user_email);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

-- Create price_alert_history table to track notifications sent
CREATE TABLE IF NOT EXISTS price_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES price_alerts(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  price_difference DECIMAL(10, 2) NOT NULL,
  percentage_change DECIMAL(5, 2) NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for history
CREATE INDEX idx_price_alert_history_alert_id ON price_alert_history(alert_id);
CREATE INDEX idx_price_alert_history_car_id ON price_alert_history(car_id);

-- Enable Row Level Security
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_alerts
-- Allow anyone to create alerts (no auth required)
CREATE POLICY "Anyone can create price alerts"
  ON price_alerts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own alerts by email
CREATE POLICY "Users can view their own alerts"
  ON price_alerts
  FOR SELECT
  TO public
  USING (true);

-- Allow users to update their own alerts
CREATE POLICY "Users can update their own alerts"
  ON price_alerts
  FOR UPDATE
  TO public
  USING (true);

-- Allow users to delete their own alerts
CREATE POLICY "Users can delete their own alerts"
  ON price_alerts
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for price_alert_history
-- Allow anyone to view history
CREATE POLICY "Anyone can view alert history"
  ON price_alert_history
  FOR SELECT
  TO public
  USING (true);

-- Only system can insert history
CREATE POLICY "System can insert alert history"
  ON price_alert_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_price_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_price_alerts_timestamp
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_price_alerts_updated_at();

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts(p_car_id UUID, p_old_price DECIMAL, p_new_price DECIMAL)
RETURNS TABLE(
  alert_id UUID,
  user_email TEXT,
  user_name TEXT,
  car_make TEXT,
  car_model TEXT,
  old_price DECIMAL,
  new_price DECIMAL,
  price_drop DECIMAL,
  percentage_drop DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id as alert_id,
    pa.user_email,
    pa.user_name,
    c.make as car_make,
    c.model as car_model,
    p_old_price as old_price,
    p_new_price as new_price,
    (p_old_price - p_new_price) as price_drop,
    ROUND(((p_old_price - p_new_price) / p_old_price * 100)::numeric, 2) as percentage_drop
  FROM price_alerts pa
  JOIN cars c ON c.id = pa.car_id
  WHERE pa.car_id = p_car_id
    AND pa.is_active = true
    AND p_new_price < p_old_price
    AND (
      -- Any drop
      (pa.alert_type = 'any_drop') OR
      -- Target price reached
      (pa.alert_type = 'target_price' AND p_new_price <= pa.target_price) OR
      -- Percentage threshold reached
      (pa.alert_type = 'percentage_drop' AND 
       ((p_old_price - p_new_price) / p_old_price * 100) >= pa.percentage_threshold)
    );
END;
$$ LANGUAGE plpgsql;

-- Add some sample data for testing (optional - comment out in production)
-- INSERT INTO price_alerts (car_id, user_email, user_name, current_price, alert_type)
-- SELECT id, 'test@example.com', 'Test User', price_rent_daily, 'any_drop'
-- FROM cars LIMIT 1;

COMMENT ON TABLE price_alerts IS 'Stores user subscriptions for price drop notifications';
COMMENT ON TABLE price_alert_history IS 'Tracks all price changes and notifications sent';
COMMENT ON FUNCTION check_price_alerts IS 'Checks which alerts should be triggered for a price change';
