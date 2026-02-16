-- Document all person_type_id values used in the people table.
-- No structural migration needed since person_type_id is a free smallint column.
--
-- person_type_id values:
--   1 = Casado
--   2 = Soltero
--   3 = Presbítero
--   4 = Seminarista
--   5 = Diácono
--   6 = Monja
--   7 = Viudo
--   8 = Itinerante  (NEW)

COMMENT ON COLUMN people.person_type_id IS 'Carisma: 1=Casado, 2=Soltero, 3=Presbítero, 4=Seminarista, 5=Diácono, 6=Monja, 7=Viudo, 8=Itinerante';
