CREATE OR REPLACE FUNCTION public.get_admin_users_list()
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    username text,
    avatar_url text,
    role public.app_role,
    created_at timestamptz,
    last_sign_in_at timestamptz
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can view the users list';
    END IF;

    RETURN QUERY
    SELECT
      p.id,
      au.email::text,
      p.full_name,
      p.username,
      p.avatar_url,
      p.role,
      au.created_at,
      au.last_sign_in_at
    FROM public.profiles p
    INNER JOIN auth.users au ON au.id = p.id
    ORDER BY au.created_at DESC;
  END;
  $$;