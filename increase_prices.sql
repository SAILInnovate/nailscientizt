-- Increase prices by £10 for hairstyles (except Cornrows, Kids' Styles, and Additional £1)
UPDATE services SET base_price = base_price + 10.00
WHERE name NOT IN ('Cornrows', 'Kids'' Styles', 'Additional £1');
