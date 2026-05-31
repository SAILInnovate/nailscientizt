-- 1. Alter services table to include category if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='category') THEN
        ALTER TABLE services ADD COLUMN category TEXT DEFAULT 'General';
    END IF;
END $$;

-- 2. Deactivate old services (or delete them if preferred, but deactivating preserves booking history)
UPDATE services SET is_active = false;

-- 3. Insert new Nail Scientizt services
INSERT INTO services (name, category, description, base_price, deposit_required, duration_minutes, is_active)
VALUES
  -- Short Canvas
  ('french tip nails', 'Short Canvas', 'clean and classic, the perfect everyday nails. please use the add ONS for extra lengths (long-xxl), designs ect.', 35.00, 15.00, 105, true),
  ('nail art', 'Short Canvas', 'charms and gems are not included. design only. price can change depending on the complexity of the set.', 40.00, 15.00, 120, true),
  ('solid colour nails', 'Short Canvas', 'includes one colour only', 30.00, 10.00, 80, true),
  ('freestyle set', 'Short Canvas', 'indecisive about a set?send me 5 inspo pictures 48 hours before your set so i can come up with a design for you. 3 small charms are included in this price.', 45.00, 15.00, 150, true),
  ('infill', 'Short Canvas', 'previous set must be 2 and a half weeks old. if over the time mark you will be charged full price. This price only includes french tip please include any add ONS', 30.00, 10.00, 115, true),

  -- Medium Canvas
  ('solid colour', 'Medium Canvas', 'includes one colour', 30.00, 10.00, 90, true),
  ('french tip nails', 'Medium Canvas', 'classic french tip nails. please use the add ons for any extras (charms,length)', 35.00, 15.00, 105, true),
  ('nail art', 'Medium Canvas', 'this does not include gems and rhinestones. please include any add ons. design only', 40.00, 15.00, 120, true),
  ('freestyle', 'Medium Canvas', 'indecisive about a set?send me 5 inspo pictures 48 hours before your set so i can come up with a design for you. 3 small charms are included in this price.', 45.00, 15.00, 150, true),

  -- Long Canvas
  ('french tip', 'Long Canvas', 'classic and clean. please use the add ons for any extras (charms,length)', 40.00, 15.00, 120, true),
  ('freestyle', 'Long Canvas', 'indecisive about a set?send me 5 inspo pictures 48 hours before your set so i can come up with a design for you. 3 small charms are included in this price.', 45.00, 15.00, 170, true),
  ('solid colour', 'Long Canvas', 'one colour only.', 35.00, 15.00, 90, true),
  ('nail art', 'Long Canvas', 'does not include charms and gems, design only. please include any add ONS.', 50.00, 15.00, 175, true),
  ('infill', 'Long Canvas', 'old set must be 2 and a half weeks old. Any thing over that will be charged as a full set. please include any add ONS.', 40.00, 15.00, 155, true),

  -- Pedicures
  ('french tip toes', 'Pedicures', 'classic and clean!', 30.00, 10.00, 60, true),
  ('toes infill', 'Pedicures', 'for infill on toes that have been done 3- 4 weeks prior. Anything over this weeks will be charged as a full set.', 30.00, 10.00, 55, true),
  ('solid colour toes', 'Pedicures', 'includes one colour only.', 25.00, 10.00, 50, true),

  -- Combos
  ('full blinged out french tips', 'Combos', 'this service is for rhinestone french tips. this includes short-medium. for extra length please use the add ons', 60.00, 20.00, 180, true),
  ('prom deal', 'Combos', 'any set hands and feet for £65', 65.00, 20.00, 175, true),
  ('prom deal with bestie', 'Combos', 'prom this prom deal with your friend and pay £60 each for any set hands and toes!', 120.00, 40.00, 280, true),
  ('any set hand and toes deal', 'Combos', 'hand and toes = perfect combo!', 75.00, 20.00, 180, true),
  ('french tip hands and toes', 'Combos', 'french tip hands and toes deal', 55.00, 20.00, 140, true),

  -- Add-ons
  ('soak off', 'Add-ons', 'keep your natural nails healthy!book a soak off if your nails are over 3-4 weeks old.', 10.00, 5.00, 40, true);
