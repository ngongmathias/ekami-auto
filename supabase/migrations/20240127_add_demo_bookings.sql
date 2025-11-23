-- Add demo bookings for testing calendar features
-- This will create bookings across different cars and dates

-- First, let's get some car IDs (you'll need to adjust these based on your actual car IDs)
-- Run this query first to see your car IDs and car_numbers:
-- SELECT id, car_number, make, model, year FROM cars ORDER BY car_number LIMIT 5;

-- Demo Bookings Script
-- Replace the car_id values with actual IDs from your cars table

-- INSTRUCTIONS:
-- 1. First run: SELECT id, car_number, make, model, year FROM cars ORDER BY car_number LIMIT 5;
-- 2. Copy the IDs from the results
-- 3. Replace 'YOUR_CAR_ID_1', 'YOUR_CAR_ID_2', etc. below with actual UUIDs
-- 4. Then run this script

-- Example bookings for the next 2 months

-- Booking 1: Active booking (currently rented)
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_1', -- Replace with actual car ID
  'John Doe',
  'john.doe@example.com',
  '+237 6 12 34 56 78',
  CURRENT_DATE - INTERVAL '2 days', -- Started 2 days ago
  CURRENT_DATE + INTERVAL '5 days', -- Ends in 5 days
  'Douala Airport',
  'Douala Airport',
  350000,
  'active',
  'paid',
  NOW()
);

-- Booking 2: Confirmed booking (upcoming)
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_1', -- Same car, different dates
  'Jane Smith',
  'jane.smith@example.com',
  '+237 6 98 76 54 32',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '17 days',
  'Bonapriso Showroom',
  'Bonapriso Showroom',
  420000,
  'confirmed',
  'paid',
  NOW()
);

-- Booking 3: Pending booking (awaiting confirmation)
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_2', -- Different car
  'Alice Johnson',
  'alice.j@example.com',
  '+237 6 11 22 33 44',
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '8 days',
  'Douala Airport',
  'Douala Airport',
  300000,
  'pending',
  'pending',
  NOW()
);

-- Booking 4: Active booking on another car
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_2', -- Same car as booking 3
  'Bob Wilson',
  'bob.wilson@example.com',
  '+237 6 55 66 77 88',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '6 days',
  'Bonapriso Showroom',
  'Bonapriso Showroom',
  380000,
  'active',
  'paid',
  NOW()
);

-- Booking 5: Confirmed booking next month
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_3', -- Third car
  'Charlie Brown',
  'charlie.b@example.com',
  '+237 6 99 88 77 66',
  CURRENT_DATE + INTERVAL '25 days',
  CURRENT_DATE + INTERVAL '32 days',
  'Douala Airport',
  'Bonapriso Showroom',
  450000,
  'confirmed',
  'paid',
  NOW()
);

-- Booking 6: Week-long booking
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_3', -- Same car, different dates
  'Diana Prince',
  'diana.p@example.com',
  '+237 6 44 55 66 77',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '22 days',
  'Bonapriso Showroom',
  'Bonapriso Showroom',
  420000,
  'confirmed',
  'paid',
  NOW()
);

-- Booking 7: Pending booking
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_4', -- Fourth car
  'Eve Anderson',
  'eve.a@example.com',
  '+237 6 33 44 55 66',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '9 days',
  'Douala Airport',
  'Douala Airport',
  240000,
  'pending',
  'pending',
  NOW()
);

-- Booking 8: Long-term booking
INSERT INTO bookings (
  car_id,
  user_name,
  user_email,
  user_phone,
  start_date,
  end_date,
  pickup_location,
  dropoff_location,
  total_amount,
  status,
  payment_status,
  created_at
) VALUES (
  'YOUR_CAR_ID_5', -- Fifth car
  'Frank Miller',
  'frank.m@example.com',
  '+237 6 22 33 44 55',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '21 days', -- 2 weeks
  'Bonapriso Showroom',
  'Bonapriso Showroom',
  840000,
  'confirmed',
  'paid',
  NOW()
);

-- Add some maintenance blocks too
-- Replace car IDs with actual ones

-- Maintenance 1: Scheduled maintenance
INSERT INTO maintenance_blocks (
  car_id,
  start_date,
  end_date,
  reason
) VALUES (
  'YOUR_CAR_ID_1',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '22 days',
  'Scheduled maintenance and oil change'
);

-- Maintenance 2: Repair work
INSERT INTO maintenance_blocks (
  car_id,
  start_date,
  end_date,
  reason
) VALUES (
  'YOUR_CAR_ID_3',
  CURRENT_DATE + INTERVAL '35 days',
  CURRENT_DATE + INTERVAL '37 days',
  'Brake system inspection and repair'
);

-- Maintenance 3: Detailing
INSERT INTO maintenance_blocks (
  car_id,
  start_date,
  end_date,
  reason
) VALUES (
  'YOUR_CAR_ID_4',
  CURRENT_DATE + INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '13 days',
  'Professional detailing and cleaning'
);

-- Verify the data was inserted
SELECT 
  b.id,
  c.car_number,
  c.make,
  c.model,
  b.user_name,
  b.start_date,
  b.end_date,
  b.status,
  b.total_amount
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.end_date >= CURRENT_DATE
ORDER BY b.start_date;

-- Check maintenance blocks
SELECT 
  m.id,
  c.car_number,
  c.make,
  c.model,
  m.start_date,
  m.end_date,
  m.reason
FROM maintenance_blocks m
JOIN cars c ON m.car_id = c.id
WHERE m.end_date >= CURRENT_DATE
ORDER BY m.start_date;
