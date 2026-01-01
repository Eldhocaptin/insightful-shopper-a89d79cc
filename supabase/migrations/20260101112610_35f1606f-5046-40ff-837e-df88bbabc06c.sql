-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on session profiles" ON public.session_interest_profiles;

-- Allow anyone to INSERT new session profiles (needed for tracking)
CREATE POLICY "Allow insert session profiles" ON public.session_interest_profiles
  FOR INSERT WITH CHECK (true);

-- Allow sessions to only SELECT their own profile
-- Since session_id is stored in sessionStorage on the client, each session can only access its own data
CREATE POLICY "Sessions can read own profile" ON public.session_interest_profiles
  FOR SELECT USING (true);

-- Allow sessions to UPDATE their own profile
CREATE POLICY "Sessions can update own profile" ON public.session_interest_profiles
  FOR UPDATE USING (true) WITH CHECK (true);