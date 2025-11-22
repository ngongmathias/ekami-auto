-- Add car_number field for easy identification
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS car_number VARCHAR(20);

-- Generate car numbers for existing cars (format: EK-001, EK-002, etc.)
WITH numbered_cars AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM cars
  WHERE car_number IS NULL
)
UPDATE cars
SET car_number = 'EK-' || LPAD(numbered_cars.row_num::TEXT, 3, '0')
FROM numbered_cars
WHERE cars.id = numbered_cars.id;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cars_car_number ON cars(car_number);

-- Update column comment to clarify location meaning
COMMENT ON COLUMN cars.location IS 'Pickup location - where customer collects the car (e.g., "Douala Airport", "Bonapriso Showroom")';

-- Add comment for car_number
COMMENT ON COLUMN cars.car_number IS 'Unique car identifier for easy reference (e.g., EK-001, EK-002)';
