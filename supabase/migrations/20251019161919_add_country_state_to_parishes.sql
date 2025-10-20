-- Add country_id and state_id columns to parishes table
ALTER TABLE parishes 
ADD COLUMN country_id bigint REFERENCES countries(id),
ADD COLUMN state_id bigint REFERENCES states(id);

-- Make country_id required (not null) - the seed data already provides values
ALTER TABLE parishes ALTER COLUMN country_id SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_parishes_country_id ON parishes(country_id);
CREATE INDEX idx_parishes_state_id ON parishes(state_id);
