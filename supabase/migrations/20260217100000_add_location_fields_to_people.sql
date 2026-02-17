-- Add location fields for person types that require it
-- (Presbítero, Seminarista, Monja, Itinerante)
ALTER TABLE people ADD COLUMN location_country_id INTEGER REFERENCES countries(id);
ALTER TABLE people ADD COLUMN location_city_id INTEGER REFERENCES cities(id);
