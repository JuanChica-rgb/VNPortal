/*
# Add get_user_emails RPC function

Creates a SECURITY DEFINER function that returns user emails for a list of user IDs.
This is needed to display author emails in comments — the frontend anon key cannot
read auth.users directly. Only returns id + email, nothing sensitive.
*/

CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email FROM auth.users WHERE id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO anon;
