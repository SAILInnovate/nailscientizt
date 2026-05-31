-- Update service categories from old "Canvas" names to simple clear names
UPDATE services SET category = 'Hands - Short' WHERE category = 'Short Canvas';
UPDATE services SET category = 'Hands - Medium' WHERE category = 'Medium Canvas';
UPDATE services SET category = 'Hands - Long' WHERE category = 'Long Canvas';
UPDATE services SET category = 'Toes' WHERE category = 'Pedicures';
UPDATE services SET category = 'Deals' WHERE category = 'Combos';
-- Add-ons stays the same
