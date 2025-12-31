-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product analytics table
CREATE TABLE public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  add_to_cart_count INTEGER NOT NULL DEFAULT 0,
  checkout_intents INTEGER NOT NULL DEFAULT 0,
  total_time_on_page INTEGER NOT NULL DEFAULT 0, -- total seconds across all views
  total_scroll_depth INTEGER NOT NULL DEFAULT 0, -- cumulative scroll depth
  view_count INTEGER NOT NULL DEFAULT 0, -- number of page views for averaging
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Create tracking events table for granular data
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'impression', 'click', 'scroll', 'timeOnPage', 'addToCart', 'removeFromCart', 'checkoutIntent'
  value DECIMAL(10,2), -- optional value (e.g., scroll depth percentage, time in seconds)
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at
  BEFORE UPDATE ON public.product_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (public read, but we'll add admin controls later)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable (storefront needs to display them)
CREATE POLICY "Products are publicly readable"
  ON public.products
  FOR SELECT
  USING (true);

-- Allow public insert/update/delete for products (admin functionality - auth can be added later)
CREATE POLICY "Allow all operations on products"
  ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Analytics are publicly readable for admin dashboard
CREATE POLICY "Analytics are publicly readable"
  ON public.product_analytics
  FOR SELECT
  USING (true);

-- Allow all operations on analytics
CREATE POLICY "Allow all operations on analytics"
  ON public.product_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tracking events are publicly insertable (visitors track events)
CREATE POLICY "Allow insert tracking events"
  ON public.tracking_events
  FOR INSERT
  WITH CHECK (true);

-- Tracking events are readable for analytics
CREATE POLICY "Tracking events are publicly readable"
  ON public.tracking_events
  FOR SELECT
  USING (true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow public access to view product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow uploads to product images bucket
CREATE POLICY "Allow uploads to product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Allow updates to product images
CREATE POLICY "Allow updates to product images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images');

-- Allow deletes from product images
CREATE POLICY "Allow deletes from product images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images');

-- Create index for faster analytics queries
CREATE INDEX idx_tracking_events_product_id ON public.tracking_events(product_id);
CREATE INDEX idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX idx_tracking_events_created_at ON public.tracking_events(created_at);

-- Enable realtime for tracking events
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_analytics;