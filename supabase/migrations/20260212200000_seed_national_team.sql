-- Seed the national team if team_type_id=3 exists and the team doesn't already exist
INSERT INTO teams (name, team_type_id, community_id)
SELECT 'Equipo de Catequistas de la Nación', 3, NULL
WHERE EXISTS (SELECT 1 FROM team_types WHERE id = 3)
  AND NOT EXISTS (SELECT 1 FROM teams WHERE community_id IS NULL AND team_type_id = 3);
