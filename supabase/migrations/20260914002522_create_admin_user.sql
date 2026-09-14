/*
# Create Admin User

Creates the admin account (admin@juegos.com / admin123) directly in auth.users
with the 'admin' role in raw_app_meta_data. This bypasses the normal sign-up flow
so the admin exists from the start with elevated privileges.

The password is hashed using crypt() with the gen_salt('bf') function (bcrypt),
which is what Supabase Auth uses for password verification.
*/

-- Insert the admin user into auth.users
-- The encrypted password is set using crypt() with bcrypt
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_current,
  email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@juegos.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name":"Admin"}'::jsonb,
  '{"role":"admin","name":"Admin"}'::jsonb,
  now(),
  now(),
  '',
  '',
  ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@juegos.com');

-- Also add to subscribers list
INSERT INTO subscribers (email, user_id)
SELECT 'admin@juegos.com', au.id
FROM auth.users au
WHERE au.email = 'admin@juegos.com'
  AND NOT EXISTS (SELECT 1 FROM subscribers WHERE email = 'admin@juegos.com');
