-- Add videos column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}'::TEXT[];