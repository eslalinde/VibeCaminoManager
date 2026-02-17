-- Convert "Itinerante" from person_type_id=8 to a boolean column
-- This allows a person to have their real carisma (Casado, Presbítero, etc.) AND be itinerante

-- Add the boolean column
ALTER TABLE public.people ADD COLUMN is_itinerante BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing itinerantes: set flag and clear person_type_id
UPDATE public.people SET is_itinerante = true, person_type_id = NULL WHERE person_type_id = 8;

-- Update column comment (remove value 8 from the list)
COMMENT ON COLUMN public.people.person_type_id IS '1=Casado, 2=Soltero, 3=Presbítero, 4=Seminarista, 5=Diácono, 6=Monja, 7=Viudo';
