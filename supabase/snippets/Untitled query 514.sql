UPDATE profiles SET role = 'admin' WHERE id = (select id from auth.users where email = 'admin@neo.com');
select id from auth.users where email = 'admin@neo.com'

UPDATE public.profiles SET role = 'admin' WHERE role = 'viewer' RETURNING id, role;