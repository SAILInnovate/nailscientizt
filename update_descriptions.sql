-- Fix all service descriptions: proper capitalisation, grammar, spacing, and punctuation
-- Also capitalise service names for clean display

-- Hands - Short (was Short Canvas)
UPDATE services SET name = 'French Tip Nails', description = 'Clean and classic — the perfect everyday nails. Please use the add-ons for extra lengths (long–XXL), designs, etc.' WHERE name = 'french tip nails' AND category IN ('Short Canvas', 'Hands - Short');
UPDATE services SET name = 'Nail Art', description = 'Charms and gems are not included — design only. Price can change depending on the complexity of the set.' WHERE name = 'nail art' AND category IN ('Short Canvas', 'Hands - Short');
UPDATE services SET name = 'Solid Colour Nails', description = 'Includes one colour only.' WHERE name = 'solid colour nails' AND category IN ('Short Canvas', 'Hands - Short');
UPDATE services SET name = 'Freestyle Set', description = 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.' WHERE name = 'freestyle set' AND category IN ('Short Canvas', 'Hands - Short');
UPDATE services SET name = 'Infill', description = 'Previous set must be 2.5 weeks old. If over the time mark you will be charged full price. This price only includes french tip — please include any add-ons.' WHERE name = 'infill' AND category IN ('Short Canvas', 'Hands - Short');

-- Hands - Medium (was Medium Canvas)
UPDATE services SET name = 'Solid Colour', description = 'Includes one colour only.' WHERE name = 'solid colour' AND category IN ('Medium Canvas', 'Hands - Medium');
UPDATE services SET name = 'French Tip Nails', description = 'Classic french tip nails. Please use the add-ons for any extras (charms, length).' WHERE name = 'french tip nails' AND category IN ('Medium Canvas', 'Hands - Medium');
UPDATE services SET name = 'Nail Art', description = 'Does not include gems and rhinestones — design only. Please include any add-ons.' WHERE name = 'nail art' AND category IN ('Medium Canvas', 'Hands - Medium');
UPDATE services SET name = 'Freestyle', description = 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.' WHERE name = 'freestyle' AND category IN ('Medium Canvas', 'Hands - Medium');

-- Hands - Long (was Long Canvas)
UPDATE services SET name = 'French Tip', description = 'Classic and clean. Please use the add-ons for any extras (charms, length).' WHERE name = 'french tip' AND category IN ('Long Canvas', 'Hands - Long');
UPDATE services SET name = 'Freestyle', description = 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.' WHERE name = 'freestyle' AND category IN ('Long Canvas', 'Hands - Long');
UPDATE services SET name = 'Solid Colour', description = 'One colour only.' WHERE name = 'solid colour' AND category IN ('Long Canvas', 'Hands - Long');
UPDATE services SET name = 'Nail Art', description = 'Does not include charms and gems — design only. Please include any add-ons.' WHERE name = 'nail art' AND category IN ('Long Canvas', 'Hands - Long');
UPDATE services SET name = 'Infill', description = 'Old set must be 2.5 weeks old. Anything over that will be charged as a full set. Please include any add-ons.' WHERE name = 'infill' AND category IN ('Long Canvas', 'Hands - Long');

-- Toes (was Pedicures)
UPDATE services SET name = 'French Tip Toes' WHERE name = 'french tip toes';
UPDATE services SET name = 'Toes Infill', description = 'For toes that have been done 3–4 weeks prior. Anything over this will be charged as a full set.' WHERE name = 'toes infill';
UPDATE services SET name = 'Solid Colour Toes', description = 'Includes one colour only.' WHERE name = 'solid colour toes';

-- Deals (was Combos)
UPDATE services SET name = 'Full Blinged Out French Tips', description = 'Rhinestone french tips. Includes short–medium length. For extra length, please use the add-ons.' WHERE name = 'full blinged out french tips';
UPDATE services SET name = 'Prom Deal', description = 'Any set — hands and feet for £65.' WHERE name = 'prom deal' AND name NOT LIKE '%bestie%';
UPDATE services SET name = 'Prom Deal With Bestie', description = 'Share this deal with your friend — £60 each for any set, hands and toes!' WHERE name = 'prom deal with bestie';
UPDATE services SET name = 'Any Set Hands & Toes Deal', description = 'Hands and toes — the perfect combo!' WHERE name = 'any set hand and toes deal';
UPDATE services SET name = 'French Tip Hands & Toes', description = 'French tip hands and toes deal.' WHERE name = 'french tip hands and toes';

-- Add-ons
UPDATE services SET name = 'Soak Off', description = 'Keep your natural nails healthy! Book a soak off if your nails are over 3–4 weeks old.' WHERE name = 'soak off';

-- Also update categories if not already done
UPDATE services SET category = 'Hands - Short' WHERE category = 'Short Canvas';
UPDATE services SET category = 'Hands - Medium' WHERE category = 'Medium Canvas';
UPDATE services SET category = 'Hands - Long' WHERE category = 'Long Canvas';
UPDATE services SET category = 'Toes' WHERE category = 'Pedicures';
UPDATE services SET category = 'Deals' WHERE category = 'Combos';
