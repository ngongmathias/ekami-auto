-- Add sample locations to cars for testing
-- This will add various Douala locations to existing cars

-- Update first batch with Airport location
UPDATE cars 
SET location = 'Douala International Airport, Cameroon'
WHERE id IN (
  SELECT id FROM cars 
  WHERE location IS NULL 
  LIMIT 5
);

-- Update second batch with Bonapriso location
UPDATE cars 
SET location = 'Bonapriso, Douala, Cameroon'
WHERE id IN (
  SELECT id FROM cars 
  WHERE location IS NULL 
  LIMIT 5
);

-- Update third batch with Akwa location
UPDATE cars 
SET location = 'Akwa Business District, Douala, Cameroon'
WHERE id IN (
  SELECT id FROM cars 
  WHERE location IS NULL 
  LIMIT 5
);

-- Update fourth batch with Bonanjo location
UPDATE cars 
SET location = 'Bonanjo, Douala, Cameroon'
WHERE id IN (
  SELECT id FROM cars 
  WHERE location IS NULL 
  LIMIT 5
);

-- Update remaining with general Douala location
UPDATE cars 
SET location = 'Douala, Cameroon'
WHERE location IS NULL;

-- Add comment to location column
COMMENT ON COLUMN cars.location IS 'Pickup location for the car - shown on map in car detail page';
