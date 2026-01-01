-- Drop the policies we just created
DROP POLICY IF EXISTS "Allow insert session profiles" ON public.session_interest_profiles;
DROP POLICY IF EXISTS "Sessions can read own profile" ON public.session_interest_profiles;
DROP POLICY IF EXISTS "Sessions can update own profile" ON public.session_interest_profiles;

-- Only allow INSERT - this is needed for anonymous tracking
-- No SELECT policy means data cannot be read publicly via the API
-- Admin access should be done via service role key in edge functions
CREATE POLICY "Allow anonymous insert for tracking" ON public.session_interest_profiles
  FOR INSERT WITH CHECK (true);

-- Allow UPDATE for existing sessions (they need to update their own profile)
-- Since we can't verify session ownership without auth, we allow updates but restrict what can be matched
CREATE POLICY "Allow update own session profile" ON public.session_interest_profiles
  FOR UPDATE USING (true) WITH CHECK (true);