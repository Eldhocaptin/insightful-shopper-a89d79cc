-- Table for granular interest events (micro-interactions)
CREATE TABLE public.customer_interest_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_value NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for computed interest scores per product
CREATE TABLE public.customer_interest_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  interest_score NUMERIC NOT NULL DEFAULT 0,
  interest_level TEXT NOT NULL DEFAULT 'cold',
  buyer_confidence NUMERIC DEFAULT 0,
  hesitation_score NUMERIC DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  return_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  total_hovers INTEGER DEFAULT 0,
  total_add_to_cart INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for session-level interest profiles
CREATE TABLE public.session_interest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  products_viewed UUID[] DEFAULT '{}',
  categories_browsed TEXT[] DEFAULT '{}',
  total_engagement_time INTEGER DEFAULT 0,
  is_return_visitor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customer_interest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interest_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_interest_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for customer_interest_events (insert for tracking, read for analytics)
CREATE POLICY "Allow insert interest events" ON public.customer_interest_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Interest events are readable" ON public.customer_interest_events
  FOR SELECT USING (true);

-- Policies for customer_interest_scores (full access for score updates)
CREATE POLICY "Allow all operations on interest scores" ON public.customer_interest_scores
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for session_interest_profiles (full access)
CREATE POLICY "Allow all operations on session profiles" ON public.session_interest_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_interest_events_product ON public.customer_interest_events(product_id);
CREATE INDEX idx_interest_events_session ON public.customer_interest_events(session_id);
CREATE INDEX idx_interest_events_created ON public.customer_interest_events(created_at);
CREATE INDEX idx_interest_scores_level ON public.customer_interest_scores(interest_level);
CREATE INDEX idx_interest_scores_score ON public.customer_interest_scores(interest_score DESC);

-- Trigger for updating updated_at on interest_scores
CREATE TRIGGER update_interest_scores_updated_at
  BEFORE UPDATE ON public.customer_interest_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating updated_at on session_profiles
CREATE TRIGGER update_session_profiles_updated_at
  BEFORE UPDATE ON public.session_interest_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();