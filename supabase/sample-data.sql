-- Sample Data for Ekami Auto
-- Run this AFTER schema.sql to populate with test data

-- =====================================================
-- SAMPLE CARS
-- =====================================================

INSERT INTO cars (make, model, year, price_sale, price_rent_daily, price_rent_weekly, price_rent_monthly, mileage, fuel_type, transmission, body_type, seats, doors, color, engine_size, features, available_for_rent, available_for_sale, location, city, images, description, condition, slug) VALUES

-- Luxury Cars
('Mercedes-Benz', 'S-Class', 2023, 45000000, 150000, 900000, 3200000, 5000, 'Petrol', 'Automatic', 'Luxury', 5, 4, 'Black', '3.0L V6', '["Leather Seats", "Sunroof", "Navigation", "Heated Seats", "Premium Sound"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"]', 'Luxurious Mercedes-Benz S-Class with premium features and exceptional comfort. Perfect for business or special occasions.', 'Excellent', 'mercedes-s-class-2023'),

('BMW', '7 Series', 2022, 38000000, 130000, 780000, 2800000, 12000, 'Diesel', 'Automatic', 'Luxury', 5, 4, 'Silver', '3.0L Diesel', '["Leather Interior", "Panoramic Roof", "Adaptive Cruise", "Massage Seats", "Harman Kardon Sound"]', true, true, 'Yaoundé', 'Yaoundé', '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"]', 'BMW 7 Series with cutting-edge technology and unmatched luxury. Experience the ultimate driving machine.', 'Excellent', 'bmw-7-series-2022'),

-- SUVs
('Toyota', 'Land Cruiser', 2021, 28000000, 100000, 600000, 2200000, 35000, 'Diesel', 'Automatic', 'SUV', 7, 4, 'White', '4.5L V8 Diesel', '["4WD", "Leather Seats", "Sunroof", "Rear Camera", "7 Seats"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"]', 'Legendary Toyota Land Cruiser - the ultimate off-road vehicle. Perfect for Cameroon terrain.', 'Good', 'toyota-land-cruiser-2021'),

('Range Rover', 'Sport', 2023, 42000000, 140000, 840000, 3000000, 8000, 'Petrol', 'Automatic', 'SUV', 5, 4, 'Grey', '3.0L Supercharged', '["All Terrain", "Leather Interior", "Meridian Sound", "Adaptive Suspension", "Panoramic Roof"]', true, true, 'Yaoundé', 'Yaoundé', '["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"]', 'Range Rover Sport - luxury meets capability. Dominate any terrain in style.', 'Excellent', 'range-rover-sport-2023'),

('Nissan', 'Patrol', 2020, 22000000, 85000, 510000, 1850000, 45000, 'Petrol', 'Automatic', 'SUV', 7, 4, 'Black', '5.6L V8', '["4WD", "7 Seats", "Leather", "Navigation", "Rear Entertainment"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"]', 'Powerful Nissan Patrol with spacious interior. Ideal for family adventures.', 'Good', 'nissan-patrol-2020'),

-- Sedans
('Toyota', 'Camry', 2022, 18000000, 55000, 330000, 1200000, 18000, 'Petrol', 'Automatic', 'Sedan', 5, 4, 'Blue', '2.5L', '["Bluetooth", "Backup Camera", "Cruise Control", "Alloy Wheels"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"]', 'Reliable Toyota Camry - perfect blend of comfort and efficiency. Great for daily commute.', 'Excellent', 'toyota-camry-2022'),

('Honda', 'Accord', 2021, 16500000, 50000, 300000, 1100000, 25000, 'Petrol', 'Automatic', 'Sedan', 5, 4, 'Silver', '2.0L Turbo', '["Sunroof", "Apple CarPlay", "Lane Assist", "Adaptive Cruise"]', true, true, 'Yaoundé', 'Yaoundé', '["https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800"]', 'Honda Accord with modern tech features. Smooth ride and excellent fuel economy.', 'Good', 'honda-accord-2021'),

('Mercedes-Benz', 'C-Class', 2023, 25000000, 90000, 540000, 1950000, 6000, 'Petrol', 'Automatic', 'Sedan', 5, 4, 'White', '2.0L Turbo', '["Leather", "Navigation", "Sunroof", "Premium Sound", "LED Lights"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1617531653520-bd466c5d3e44?w=800"]', 'Elegant Mercedes-Benz C-Class. Luxury and performance in a compact package.', 'Excellent', 'mercedes-c-class-2023'),

-- Pickups
('Toyota', 'Hilux', 2022, 19000000, 70000, 420000, 1500000, 22000, 'Diesel', 'Manual', 'Pickup', 5, 4, 'White', '2.8L Diesel', '["4WD", "Tow Package", "Bed Liner", "Fog Lights"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1623873071811-8a8f5d9fe6d9?w=800"]', 'Legendary Toyota Hilux - indestructible and reliable. Perfect for work and adventure.', 'Good', 'toyota-hilux-2022'),

('Ford', 'Ranger', 2021, 17500000, 65000, 390000, 1400000, 30000, 'Diesel', 'Automatic', 'Pickup', 5, 4, 'Grey', '3.2L Diesel', '["4WD", "Leather Seats", "Navigation", "Tow Bar", "Alloy Wheels"]', true, true, 'Yaoundé', 'Yaoundé', '["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"]', 'Ford Ranger with comfort and capability. Great for business and leisure.', 'Good', 'ford-ranger-2021'),

-- Economy Cars
('Toyota', 'Corolla', 2023, 12000000, 35000, 210000, 750000, 8000, 'Petrol', 'Automatic', 'Sedan', 5, 4, 'Red', '1.8L', '["Bluetooth", "Backup Camera", "USB Ports", "Air Conditioning"]', true, true, 'Douala', 'Douala', '["https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800"]', 'Affordable and reliable Toyota Corolla. Perfect for daily use with great fuel economy.', 'Excellent', 'toyota-corolla-2023'),

('Hyundai', 'Elantra', 2022, 11000000, 32000, 192000, 700000, 15000, 'Petrol', 'Automatic', 'Sedan', 5, 4, 'Black', '2.0L', '["Apple CarPlay", "Blind Spot", "Rear Camera", "Cruise Control"]', true, true, 'Yaoundé', 'Yaoundé', '["https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"]', 'Modern Hyundai Elantra with advanced safety features. Comfortable and efficient.', 'Excellent', 'hyundai-elantra-2022');

-- =====================================================
-- SAMPLE BLOG POSTS
-- =====================================================

INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, category, tags, status, published_at) VALUES

('Top 10 Cars for Cameroon Roads in 2024', 'top-10-cars-cameroon-2024', 'Discover the best vehicles suited for Cameroon''s diverse terrain and climate.', 'When choosing a car in Cameroon, you need to consider our unique road conditions, climate, and fuel availability. Here are our top 10 picks for 2024...\n\n1. Toyota Land Cruiser - The undisputed king of Cameroon roads\n2. Toyota Hilux - Perfect for business and adventure\n3. Range Rover Sport - Luxury meets capability\n\n[Full article content would go here]', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', 'Buying Guide', '["buying guide", "cameroon", "SUV", "4WD"]', 'published', NOW()),

('How to Maintain Your Car in Tropical Climate', 'car-maintenance-tropical-climate', 'Essential maintenance tips for keeping your vehicle in top condition in Cameroon''s climate.', 'Cameroon''s tropical climate presents unique challenges for vehicle maintenance. Here''s what you need to know...\n\n**Regular Checks:**\n- Air conditioning system\n- Cooling system\n- Battery health\n- Tire pressure\n\n[Full maintenance guide would go here]', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800', 'Maintenance', '["maintenance", "tips", "tropical", "care"]', 'published', NOW()),

('Renting vs Buying: What''s Right for You?', 'renting-vs-buying-guide', 'A comprehensive guide to help you decide between renting and buying a car in Cameroon.', 'Making the decision between renting and buying a car depends on several factors...\n\n**When to Rent:**\n- Short-term needs\n- Testing before buying\n- Special occasions\n\n**When to Buy:**\n- Long-term use\n- Business purposes\n- Building equity\n\n[Full comparison would go here]', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 'Buying Guide', '["renting", "buying", "guide", "decision"]', 'published', NOW());

-- =====================================================
-- SAMPLE REVIEWS (You'll need actual user IDs)
-- =====================================================
-- Note: These will need to be added after you have actual users
-- For now, they're commented out

/*
INSERT INTO reviews (user_id, car_id, rating, title, comment, status) VALUES
('user-uuid-here', (SELECT id FROM cars WHERE slug = 'toyota-land-cruiser-2021'), 5, 'Perfect for Cameroon!', 'Rented this Land Cruiser for a trip to the North. Handled everything perfectly!', 'approved'),
('user-uuid-here', (SELECT id FROM cars WHERE slug = 'mercedes-s-class-2023'), 5, 'Luxury at its finest', 'Used for my wedding. Everyone was impressed. Highly recommend!', 'approved');
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that data was inserted
SELECT 'Cars inserted: ' || COUNT(*) FROM cars;
SELECT 'Blog posts inserted: ' || COUNT(*) FROM blog_posts;
