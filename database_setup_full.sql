-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the 'services' table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  base_price DECIMAL(10, 2) NOT NULL,
  deposit_required DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data into 'services'
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


-- 2. Create the 'bookings' table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id),
  
  -- Customer details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  notes TEXT,
  
  -- Time Tracking
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  
  -- Financial & Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  deposit_paid BOOLEAN DEFAULT false,
  
  -- Stripe Integration
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. Create a Function to check for booking overlaps
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
  overlap_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM bookings
    WHERE 
      (NEW.id IS NULL OR id != NEW.id)
      AND status = 'confirmed' 
      AND (
        (NEW.start_datetime < (end_datetime + INTERVAL '3 hours') AND (NEW.end_datetime + INTERVAL '3 hours') > start_datetime)
      )
  ) INTO overlap_exists;

  IF overlap_exists THEN
    RAISE EXCEPTION 'Booking overlaps with an existing appointment for the requested time block.';
  END IF;

  NEW.end_datetime := NEW.start_datetime + (
    SELECT duration_minutes * INTERVAL '1 minute' FROM services WHERE id = NEW.service_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. Create Trigger to run the overlap check
DROP TRIGGER IF EXISTS prevent_booking_overlap ON bookings;
CREATE TRIGGER prevent_booking_overlap
BEFORE INSERT OR UPDATE OF start_datetime, end_datetime, service_id ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_overlap();


-- 5. Row Level Security (RLS) Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services"
ON services FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Public can insert bookings" ON bookings;
CREATE POLICY "Public can insert bookings"
ON bookings FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public inserting to return inserted row" ON bookings;
CREATE POLICY "Allow public inserting to return inserted row"
ON bookings FOR SELECT
USING (true);


-- 6. Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 7. Create the 'blocked_dates' table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blocked dates" ON blocked_dates;
CREATE POLICY "Public can view blocked dates"
ON blocked_dates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role can manage blocked dates" ON blocked_dates;
CREATE POLICY "Service role can manage blocked dates"
ON blocked_dates FOR ALL
USING (true)
WITH CHECK (true);
