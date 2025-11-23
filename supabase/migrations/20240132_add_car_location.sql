-- Add current_city field to cars table
-- This allows showing where each car is currently located
-- and calculating delivery times

-- Add current_city column
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS current_city VARCHAR(100) DEFAULT 'Yaoundé';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_cars_current_city ON cars(current_city);

-- Add comment
COMMENT ON COLUMN cars.current_city IS 'Current location of the car (city name)';

-- Update existing cars to have Yaoundé as default location
UPDATE cars 
SET current_city = 'Yaoundé' 
WHERE current_city IS NULL;

-- Sample data: Set some cars to different cities for demonstration
-- Uncomment and adjust IDs as needed:
/*
UPDATE cars SET current_city = 'Yaoundé' WHERE id IN (SELECT id FROM cars LIMIT 3);
UPDATE cars SET current_city = 'Bamenda' WHERE id IN (SELECT id FROM cars OFFSET 3 LIMIT 2);
UPDATE cars SET current_city = 'Bafoussam' WHERE id IN (SELECT id FROM cars OFFSET 5 LIMIT 2);
*/
