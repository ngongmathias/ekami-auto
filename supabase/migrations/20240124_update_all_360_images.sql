-- Update ALL cars with demo 360° images (overwrites existing)
-- This will give each car type consistent demo images

-- Clear all existing 360 images first (optional - remove if you want to keep EK-001's images)
-- UPDATE cars SET images_360 = NULL;

-- For sedans - Use consistent sedan images
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80&sat=-100',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80&flip=h',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80&flip=h&sat=-100',
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80',
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80&flip=h'
]
WHERE body_type = 'sedan';

-- For SUVs - Use consistent SUV images
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&sat=-100',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&flip=h',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&flip=h&sat=-100',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80&flip=h'
]
WHERE body_type = 'suv';

-- For trucks - Use consistent truck images
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&sat=-100',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&flip=h',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80&flip=h&sat=-100',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&flip=h'
]
WHERE body_type = 'truck';

-- For vans - Use consistent van images
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80',
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80&sat=-100',
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80&flip=h',
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80&flip=h&sat=-100',
  'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&q=80',
  'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&q=80&flip=h'
]
WHERE body_type = 'van';

-- For coupes and convertibles - Use consistent sports car images
UPDATE cars 
SET images_360 = ARRAY[
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&sat=-100',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&flip=h',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&flip=h&sat=-100',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800&q=80',
  'https://images.unsplash.com/photo-1542362567-b07e54a88620?w=800&q=80&flip=h'
]
WHERE body_type IN ('coupe', 'convertible');

-- Verify the updates - should show 6 images for each car now
SELECT 
  car_number,
  make,
  model,
  body_type,
  CASE 
    WHEN images_360 IS NOT NULL THEN array_length(images_360, 1)
    ELSE 0
  END as image_count,
  CASE 
    WHEN images_360 IS NOT NULL THEN '✓ Has 360° images'
    ELSE '✗ No 360° images'
  END as status
FROM cars
ORDER BY car_number;
