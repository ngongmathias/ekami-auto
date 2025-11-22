-- Add demo 360° images to existing cars
-- This uses free Unsplash images for demonstration

-- For sedans (Toyota, Honda, etc.)
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&flip=h',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&flip=h',
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&flip=h'
]
WHERE body_type = 'sedan' AND images_360 IS NULL;

-- For SUVs
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&flip=h',
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&flip=h',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&flip=h'
]
WHERE body_type = 'suv' AND images_360 IS NULL;

-- For trucks
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&flip=h',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&flip=h',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&flip=h'
]
WHERE body_type = 'truck' AND images_360 IS NULL;

-- For vans
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800',
  'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&flip=h',
  'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&flip=h',
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&flip=h'
]
WHERE body_type = 'van' AND images_360 IS NULL;

-- For coupes and convertibles
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800',
  'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800',
  'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&flip=h',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800&flip=h',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&flip=h'
]
WHERE body_type IN ('coupe', 'convertible') AND images_360 IS NULL;

-- Verify the updates
SELECT 
  car_number,
  make,
  model,
  body_type,
  CASE 
    WHEN images_360 IS NOT NULL THEN array_length(images_360, 1)
    ELSE 0
  END as image_count
FROM cars
ORDER BY car_number;
