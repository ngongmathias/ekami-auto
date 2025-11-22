-- Add 360 images column to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS images_360 TEXT[];

-- Add comment
COMMENT ON COLUMN cars.images_360 IS 'Array of image URLs for 360° view, ordered sequentially for rotation';

-- Example update for testing (optional - you can add real images later)
-- UPDATE cars 
-- SET images_360 = ARRAY[
--   'https://example.com/car-360-1.jpg',
--   'https://example.com/car-360-2.jpg',
--   'https://example.com/car-360-3.jpg'
-- ]
-- WHERE id = 'some-car-id';
