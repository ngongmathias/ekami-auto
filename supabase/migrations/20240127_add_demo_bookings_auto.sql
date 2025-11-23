-- Automatic Demo Bookings Script
-- This script automatically uses your existing cars and creates demo bookings

-- Create demo bookings using the first 5 cars in your database
DO $$
DECLARE
  car_ids UUID[];
  car_1 UUID;
  car_2 UUID;
  car_3 UUID;
  car_4 UUID;
  car_5 UUID;
BEGIN
  -- Get the first 5 car IDs
  SELECT ARRAY_AGG(id) INTO car_ids
  FROM (SELECT id FROM cars ORDER BY car_number LIMIT 5) AS subquery;
  
  -- Check if we have at least 5 cars
  IF array_length(car_ids, 1) < 5 THEN
    RAISE NOTICE 'Not enough cars in database. Need at least 5 cars. Found: %', array_length(car_ids, 1);
    RETURN;
  END IF;
  
  -- Assign car IDs
  car_1 := car_ids[1];
  car_2 := car_ids[2];
  car_3 := car_ids[3];
  car_4 := car_ids[4];
  car_5 := car_ids[5];
  
  RAISE NOTICE 'Creating demo bookings for 5 cars...';
  
  -- Booking 1: Active booking (currently rented) - Car 1
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_1, 'John Doe', 'john.doe@example.com', '+237 6 12 34 56 78',
    CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days',
    'Douala Airport', 'Douala Airport',
    50000, 7, 350000, 350000, 'active', 'paid', NOW()
  );
  
  -- Booking 2: Confirmed booking (upcoming) - Car 1
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_1, 'Jane Smith', 'jane.smith@example.com', '+237 6 98 76 54 32',
    CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '17 days',
    'Bonapriso Showroom', 'Bonapriso Showroom',
    60000, 7, 420000, 420000, 'confirmed', 'paid', NOW()
  );
  
  -- Booking 3: Pending booking - Car 2
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_2, 'Alice Johnson', 'alice.j@example.com', '+237 6 11 22 33 44',
    CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '8 days',
    'Douala Airport', 'Douala Airport',
    60000, 5, 300000, 300000, 'pending', 'pending', NOW()
  );
  
  -- Booking 4: Active booking - Car 2
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_2, 'Bob Wilson', 'bob.wilson@example.com', '+237 6 55 66 77 88',
    CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '6 days',
    'Bonapriso Showroom', 'Bonapriso Showroom',
    55000, 7, 380000, 380000, 'active', 'paid', NOW()
  );
  
  -- Booking 5: Confirmed booking next month - Car 3
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_3, 'Charlie Brown', 'charlie.b@example.com', '+237 6 99 88 77 66',
    CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '32 days',
    'Douala Airport', 'Bonapriso Showroom',
    65000, 7, 450000, 450000, 'confirmed', 'paid', NOW()
  );
  
  -- Booking 6: Week-long booking - Car 3
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_3, 'Diana Prince', 'diana.p@example.com', '+237 6 44 55 66 77',
    CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '22 days',
    'Bonapriso Showroom', 'Bonapriso Showroom',
    60000, 7, 420000, 420000, 'confirmed', 'paid', NOW()
  );
  
  -- Booking 7: Pending booking - Car 4
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_4, 'Eve Anderson', 'eve.a@example.com', '+237 6 33 44 55 66',
    CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days',
    'Douala Airport', 'Douala Airport',
    60000, 4, 240000, 240000, 'pending', 'pending', NOW()
  );
  
  -- Booking 8: Long-term booking - Car 5
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_5, 'Frank Miller', 'frank.m@example.com', '+237 6 22 33 44 55',
    CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days',
    'Bonapriso Showroom', 'Bonapriso Showroom',
    60000, 14, 840000, 840000, 'confirmed', 'paid', NOW()
  );
  
  -- Booking 9: Short weekend rental - Car 4
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_4, 'Grace Lee', 'grace.lee@example.com', '+237 6 77 88 99 00',
    CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days',
    'Douala Airport', 'Douala Airport',
    90000, 2, 180000, 180000, 'confirmed', 'paid', NOW()
  );
  
  -- Booking 10: Another booking - Car 5
  INSERT INTO bookings (
    car_id, customer_name, customer_email, customer_phone,
    start_date, end_date, pickup_location, dropoff_location,
    daily_rate, total_days, subtotal, total_amount, status, payment_status, created_at
  ) VALUES (
    car_5, 'Henry Davis', 'henry.d@example.com', '+237 6 66 77 88 99',
    CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days',
    'Bonapriso Showroom', 'Douala Airport',
    60000, 7, 420000, 420000, 'confirmed', 'paid', NOW()
  );
  
  RAISE NOTICE '✅ Created 10 demo bookings successfully!';
  
  -- Add maintenance blocks
  INSERT INTO maintenance_blocks (car_id, start_date, end_date, reason)
  VALUES 
    (car_1, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '22 days', 'Scheduled maintenance and oil change'),
    (car_3, CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '37 days', 'Brake system inspection and repair'),
    (car_4, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '13 days', 'Professional detailing and cleaning');
  
  RAISE NOTICE '✅ Created 3 maintenance blocks successfully!';
  
END $$;

-- Show the results
SELECT 
  '📊 DEMO BOOKINGS CREATED' as status,
  COUNT(*) as total_bookings,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM bookings
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Show bookings with car details
SELECT 
  c.car_number as "Car ID",
  CONCAT(c.year, ' ', c.make, ' ', c.model) as "Car",
  b.customer_name as "Customer",
  TO_CHAR(b.start_date, 'Mon DD') as "Start",
  TO_CHAR(b.end_date, 'Mon DD') as "End",
  b.status as "Status",
  TO_CHAR(b.total_amount, '999,999') || ' XAF' as "Amount"
FROM bookings b
JOIN cars c ON b.car_id = c.id
WHERE b.created_at > NOW() - INTERVAL '1 minute'
ORDER BY c.car_number, b.start_date;

-- Show maintenance blocks
SELECT 
  c.car_number as "Car ID",
  CONCAT(c.year, ' ', c.make, ' ', c.model) as "Car",
  TO_CHAR(m.start_date, 'Mon DD') as "Start",
  TO_CHAR(m.end_date, 'Mon DD') as "End",
  m.reason as "Reason"
FROM maintenance_blocks m
JOIN cars c ON m.car_id = c.id
WHERE m.created_at > NOW() - INTERVAL '1 minute'
ORDER BY c.car_number, m.start_date;
