-- ==============================================
-- ROLE-BASED RLS FOR ALL TABLES
-- ==============================================
-- This migration adds role-based access control for all tables:
-- 
-- Master tables: countries, states, cities, step_ways, team_types
-- Transactional tables: people, parishes, communities, teams, parish_teams,
--                       priests, brothers, belongs, community_step_log
--
-- Roles:
-- - viewer: Can only read data (SELECT)
-- - contributor: Can read, insert, and update (SELECT, INSERT, UPDATE)
-- - admin: Full access (SELECT, INSERT, UPDATE, DELETE)
-- ==============================================

-- ==============================================
-- 1. CREATE ROLE ENUM TYPE
-- ==============================================
CREATE TYPE public.app_role AS ENUM ('viewer', 'contributor', 'admin');

-- ==============================================
-- 2. ADD ROLE COLUMN TO PROFILES
-- ==============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'viewer'::public.app_role NOT NULL;

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ==============================================
-- 3. CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'viewer'::public.app_role
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = 'admin'::public.app_role;
$$;

-- Function to check if user is contributor or admin
CREATE OR REPLACE FUNCTION public.is_contributor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() IN ('contributor'::public.app_role, 'admin'::public.app_role);
$$;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- ==============================================
-- 4. DROP EXISTING POLICIES FOR MASTER TABLES
-- ==============================================

-- Countries
DROP POLICY IF EXISTS "Enable read access for all users" ON public.countries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.countries;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.countries;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.countries;

-- States
DROP POLICY IF EXISTS "Enable read access for all users" ON public.states;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.states;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.states;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.states;

-- Cities
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cities;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.cities;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.cities;

-- StepWays
DROP POLICY IF EXISTS "Enable read access for all users" ON public.step_ways;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.step_ways;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.step_ways;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.step_ways;

-- TeamTypes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.team_types;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.team_types;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.team_types;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.team_types;

-- People
DROP POLICY IF EXISTS "Enable read access for all users" ON public.people;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.people;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.people;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.people;

-- Parishes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.parishes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.parishes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.parishes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.parishes;

-- Communities
DROP POLICY IF EXISTS "Enable read access for all users" ON public.communities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.communities;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.communities;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.communities;

-- Teams
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.teams;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.teams;

-- ParishTeams
DROP POLICY IF EXISTS "Enable read access for all users" ON public.parish_teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.parish_teams;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.parish_teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.parish_teams;

-- Priests
DROP POLICY IF EXISTS "Enable read access for all users" ON public.priests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.priests;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.priests;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.priests;

-- Brothers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brothers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.brothers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.brothers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.brothers;

-- Belongs
DROP POLICY IF EXISTS "Enable read access for all users" ON public.belongs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.belongs;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.belongs;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.belongs;

-- CommunityStepLog
DROP POLICY IF EXISTS "Enable read access for all users" ON public.community_step_log;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.community_step_log;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.community_step_log;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.community_step_log;

-- ==============================================
-- 5. CREATE NEW ROLE-BASED POLICIES FOR ALL TABLES
-- ==============================================

-- ----------------------
-- COUNTRIES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "countries_select_authenticated" ON public.countries
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "countries_insert_contributor_admin" ON public.countries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "countries_update_contributor_admin" ON public.countries
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "countries_delete_admin" ON public.countries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- STATES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "states_select_authenticated" ON public.states
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "states_insert_contributor_admin" ON public.states
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "states_update_contributor_admin" ON public.states
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "states_delete_admin" ON public.states
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- CITIES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "cities_select_authenticated" ON public.cities
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "cities_insert_contributor_admin" ON public.cities
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "cities_update_contributor_admin" ON public.cities
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "cities_delete_admin" ON public.cities
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- STEP_WAYS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "step_ways_select_authenticated" ON public.step_ways
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "step_ways_insert_contributor_admin" ON public.step_ways
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "step_ways_update_contributor_admin" ON public.step_ways
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "step_ways_delete_admin" ON public.step_ways
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- TEAM_TYPES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "team_types_select_authenticated" ON public.team_types
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "team_types_insert_contributor_admin" ON public.team_types
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "team_types_update_contributor_admin" ON public.team_types
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "team_types_delete_admin" ON public.team_types
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================
-- TRANSACTIONAL TABLES POLICIES
-- ==============================================

-- ----------------------
-- PEOPLE
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "people_select_authenticated" ON public.people
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "people_insert_contributor_admin" ON public.people
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "people_update_contributor_admin" ON public.people
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "people_delete_admin" ON public.people
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- PARISHES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "parishes_select_authenticated" ON public.parishes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "parishes_insert_contributor_admin" ON public.parishes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "parishes_update_contributor_admin" ON public.parishes
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "parishes_delete_admin" ON public.parishes
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- COMMUNITIES
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "communities_select_authenticated" ON public.communities
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "communities_insert_contributor_admin" ON public.communities
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "communities_update_contributor_admin" ON public.communities
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "communities_delete_admin" ON public.communities
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- TEAMS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "teams_select_authenticated" ON public.teams
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "teams_insert_contributor_admin" ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "teams_update_contributor_admin" ON public.teams
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "teams_delete_admin" ON public.teams
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- PARISH_TEAMS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "parish_teams_select_authenticated" ON public.parish_teams
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "parish_teams_insert_contributor_admin" ON public.parish_teams
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "parish_teams_update_contributor_admin" ON public.parish_teams
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "parish_teams_delete_admin" ON public.parish_teams
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- PRIESTS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "priests_select_authenticated" ON public.priests
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "priests_insert_contributor_admin" ON public.priests
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "priests_update_contributor_admin" ON public.priests
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "priests_delete_admin" ON public.priests
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- BROTHERS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "brothers_select_authenticated" ON public.brothers
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "brothers_insert_contributor_admin" ON public.brothers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "brothers_update_contributor_admin" ON public.brothers
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "brothers_delete_admin" ON public.brothers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- BELONGS
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "belongs_select_authenticated" ON public.belongs
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "belongs_insert_contributor_admin" ON public.belongs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "belongs_update_contributor_admin" ON public.belongs
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "belongs_delete_admin" ON public.belongs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------
-- COMMUNITY_STEP_LOG
-- ----------------------
-- SELECT: All authenticated users can read
CREATE POLICY "community_step_log_select_authenticated" ON public.community_step_log
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Only contributors and admins
CREATE POLICY "community_step_log_insert_contributor_admin" ON public.community_step_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_contributor_or_admin());

-- UPDATE: Only contributors and admins
CREATE POLICY "community_step_log_update_contributor_admin" ON public.community_step_log
  FOR UPDATE
  TO authenticated
  USING (public.is_contributor_or_admin())
  WITH CHECK (public.is_contributor_or_admin());

-- DELETE: Only admins
CREATE POLICY "community_step_log_delete_admin" ON public.community_step_log
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================
-- 6. ADMIN FUNCTIONS FOR ROLE MANAGEMENT
-- ==============================================

-- Function to update a user's role (only admins can do this)
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id uuid,
  new_role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  -- Update the role
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_contributor_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;

-- ==============================================
-- 7. UPDATE PROFILE POLICIES TO ALLOW ROLE VIEWING
-- ==============================================

-- Drop existing profile policies if needed and recreate
DROP POLICY IF EXISTS "Users can view their own role" ON public.profiles;

-- Allow users to view their own profile (including role)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Allow admins to update any profile (for role management)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ==============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ==============================================
COMMENT ON TYPE public.app_role IS 'Application roles for RLS policies: viewer (read-only), contributor (read/write), admin (full access)';
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the current authenticated user''s role';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user has admin role';
COMMENT ON FUNCTION public.is_contributor_or_admin() IS 'Returns true if the current user has contributor or admin role';
COMMENT ON FUNCTION public.set_user_role(uuid, public.app_role) IS 'Sets a user''s role (admin only)';

