-- Set all cars with a sale price as available for sale

UPDATE cars 
SET available_for_sale = true 
WHERE price_sale IS NOT NULL AND price_sale > 0;

-- Set cars without sale price as not available for sale
UPDATE cars 
SET available_for_sale = false 
WHERE price_sale IS NULL OR price_sale = 0;
