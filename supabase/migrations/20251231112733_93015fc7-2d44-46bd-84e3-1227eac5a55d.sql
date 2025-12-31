-- Enable realtime for products table (check if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- Enable realtime for customer_interest_scores table (check if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'customer_interest_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_interest_scores;
  END IF;
END $$;