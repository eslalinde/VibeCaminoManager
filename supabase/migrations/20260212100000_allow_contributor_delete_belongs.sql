-- Allow contributors (not just admins) to delete from belongs, teams, and parish_teams
-- This is needed so contributors can remove team members and delete teams

DROP POLICY IF EXISTS "belongs_delete_admin" ON public.belongs;
CREATE POLICY "belongs_delete_contributor_admin" ON public.belongs
  FOR DELETE
  TO authenticated
  USING (public.is_contributor_or_admin());

DROP POLICY IF EXISTS "teams_delete_admin" ON public.teams;
CREATE POLICY "teams_delete_contributor_admin" ON public.teams
  FOR DELETE
  TO authenticated
  USING (public.is_contributor_or_admin());

DROP POLICY IF EXISTS "parish_teams_delete_admin" ON public.parish_teams;
CREATE POLICY "parish_teams_delete_contributor_admin" ON public.parish_teams
  FOR DELETE
  TO authenticated
  USING (public.is_contributor_or_admin());
