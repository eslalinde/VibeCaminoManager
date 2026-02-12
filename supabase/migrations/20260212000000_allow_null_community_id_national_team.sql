-- Allow national team: a team with community_id IS NULL and team_type_id = 3
-- This represents the "Equipo de Catequistas de la Nacion"

-- Unique partial index to prevent duplicate national teams
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_national_team
  ON teams (team_type_id)
  WHERE community_id IS NULL AND team_type_id = 3;

-- The national team row is auto-created at runtime by the useNationalTeamData hook
-- when a user first visits /protected/national-team, so no seed INSERT is needed here.
