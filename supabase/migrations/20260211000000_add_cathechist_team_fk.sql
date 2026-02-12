-- Add foreign key constraint for cathechist_team_id in communities table
ALTER TABLE communities
  ADD CONSTRAINT fk_communities_cathechist_team
  FOREIGN KEY (cathechist_team_id) REFERENCES teams(id)
  ON DELETE SET NULL;
