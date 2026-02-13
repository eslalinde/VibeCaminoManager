-- Migration: Remove redundant country_id and state_id from parishes
-- The city already references state and country, so these are unnecessary on parishes.

BEGIN;

-- Drop indexes first
DROP INDEX IF EXISTS idx_parishes_country_id;
DROP INDEX IF EXISTS idx_parishes_state_id;

-- Drop columns
ALTER TABLE public.parishes DROP COLUMN country_id;
ALTER TABLE public.parishes DROP COLUMN state_id;

COMMIT;
