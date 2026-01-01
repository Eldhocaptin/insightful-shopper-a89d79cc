-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert for tracking" ON public.session_interest_profiles;
DROP POLICY IF EXISTS "Allow update own session profile" ON public.session_interest_profiles;

-- Only allow INSERT with upsert capability (no SELECT needed)
-- The upsert pattern allows us to insert or update without reading data
CREATE POLICY "Allow insert and upsert for tracking" ON public.session_interest_profiles
  FOR INSERT WITH CHECK (true);

-- No SELECT policy - data cannot be read publicly
-- Admin analytics should use edge functions with service role key

-- No UPDATE policy via direct API - use upsert instead
-- No DELETE policy - data should not be deletable by anonymous users