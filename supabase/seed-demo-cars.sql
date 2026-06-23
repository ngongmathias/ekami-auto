-- =====================================================================
-- DEMO CARS — sample inventory so the site isn't empty at launch.
-- Run in Supabase SQL Editor. Safe to re-run (skips if EK-001 exists).
-- Replace with real inventory via the Admin Dashboard when ready.
-- Prices are in XAF. Images are royalty-free Unsplash photos.
-- =====================================================================
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM cars WHERE car_number = 'EK-001') THEN

INSERT INTO cars
  (car_number, make, model, year, body_type, fuel_type, transmission, seats, doors, color,
   mileage, price_rent_daily, price_rent_weekly, price_rent_monthly, price_sale,
   available_for_rent, available_for_sale, status, condition, location, city, current_city,
   features, images, description, slug, is_verified)
VALUES
  ('EK-001','Toyota','Corolla',2020,'sedan','petrol','automatic',5,4,'Silver',
   42000, 25000, 150000, 550000, 12000000,
   true, true, 'available', 'Excellent', 'Bonapriso Showroom', 'Douala', 'Douala',
   '["Air Conditioning","Bluetooth","Reverse Camera","USB","Power Windows"]'::jsonb,
   '["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80"]'::jsonb,
   'Reliable and fuel-efficient Toyota Corolla, perfect for city driving and long trips. Well maintained with full service history.',
   'toyota-corolla-2020-ek001', true),

  ('EK-002','Toyota','RAV4',2021,'suv','petrol','automatic',5,5,'White',
   31000, 45000, 270000, 980000, 22000000,
   true, true, 'available', 'Excellent', 'Douala International Airport', 'Douala', 'Douala',
   '["4WD","Air Conditioning","Bluetooth","Reverse Camera","Cruise Control","Leather Seats"]'::jsonb,
   '["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80"]'::jsonb,
   'Spacious and capable Toyota RAV4 SUV, ideal for families and rough roads. Excellent condition.',
   'toyota-rav4-2021-ek002', true),

  ('EK-003','Toyota','Hilux',2019,'pickup','diesel','manual',5,4,'Grey',
   68000, 50000, 300000, 1100000, 28000000,
   true, true, 'available', 'Good', 'Akwa Business District', 'Douala', 'Douala',
   '["4WD","Air Conditioning","Tow Bar","Bluetooth","Bull Bar"]'::jsonb,
   '["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80"]'::jsonb,
   'Tough and dependable Toyota Hilux double-cab pickup. Great for work and adventure across Cameroon.',
   'toyota-hilux-2019-ek003', true),

  ('EK-004','Mercedes-Benz','C-Class',2020,'luxury','petrol','automatic',5,4,'Black',
   38000, 90000, 540000, 1900000, 35000000,
   true, true, 'available', 'Excellent', 'Bonanjo', 'Douala', 'Douala',
   '["Leather Seats","Sunroof","Navigation","Air Conditioning","Premium Sound","Cruise Control"]'::jsonb,
   '["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80"]'::jsonb,
   'Elegant Mercedes-Benz C-Class for executives and special occasions. Premium comfort and style.',
   'mercedes-benz-c-class-2020-ek004', true),

  ('EK-005','Honda','CR-V',2021,'suv','petrol','automatic',5,5,'Blue',
   27000, 40000, 240000, 880000, 20000000,
   true, true, 'available', 'Excellent', 'Yaoundé Centre', 'Yaoundé', 'Yaoundé',
   '["Air Conditioning","Bluetooth","Reverse Camera","Cruise Control","Apple CarPlay"]'::jsonb,
   '["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=80"]'::jsonb,
   'Comfortable and economical Honda CR-V. A great all-round family SUV with low mileage.',
   'honda-cr-v-2021-ek005', true),

  ('EK-006','Toyota','Coaster',2018,'bus','diesel','manual',30,4,'White',
   95000, 80000, 480000, 1700000, NULL,
   true, false, 'available', 'Good', 'Douala', 'Douala', 'Douala',
   '["Air Conditioning","High Roof","PA System","Comfortable Seating"]'::jsonb,
   '["https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=900&q=80"]'::jsonb,
   '30-seater Toyota Coaster bus, perfect for group travel, events, and shuttle services.',
   'toyota-coaster-2018-ek006', true);

  RAISE NOTICE 'Inserted 6 demo cars (EK-001 .. EK-006).';
ELSE
  RAISE NOTICE 'Demo cars already present — skipped.';
END IF;
END $$;

SELECT car_number, make, model, year, body_type, price_rent_daily FROM cars ORDER BY car_number;
