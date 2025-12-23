-- ==============================================
-- FIX PROFILES RLS POLICIES AND TRIGGER
-- ==============================================
-- This migration fixes:
-- 1. Conflicting RLS policies on profiles table
-- 2. Updates handle_new_user trigger to explicitly set the viewer role
-- 3. Ensures proper policy hierarchy
-- ==============================================

-- ==============================================
-- 1. DROP ALL EXISTING PROFILE POLICIES
-- ==============================================
-- Remove ALL existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- ==============================================
-- 2. CREATE NEW CLEAN PROFILE POLICIES
-- ==============================================

-- SELECT: Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT: Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile (except role)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins can update any profile (for role management)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- DELETE: Only admins can delete profiles
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================
-- 3. UPDATE HANDLE_NEW_USER TRIGGER
-- ==============================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the updated function that includes role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, updated_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'viewer'::public.app_role,
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ==============================================

-- Ensure authenticated users can use the profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ==============================================
-- 5. ADD COMMENTS
-- ==============================================
COMMENT ON POLICY "profiles_select_own" ON public.profiles IS 'Users can only view their own profile';
COMMENT ON POLICY "profiles_select_admin" ON public.profiles IS 'Admins can view all profiles';
COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'Users can only insert their own profile (used by trigger)';
COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Users can update their own profile data';
COMMENT ON POLICY "profiles_update_admin" ON public.profiles IS 'Admins can update any profile including roles';
COMMENT ON POLICY "profiles_delete_admin" ON public.profiles IS 'Only admins can delete profiles';

