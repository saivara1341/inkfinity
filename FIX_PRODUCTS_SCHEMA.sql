-- Fix for products table schema mismatch
-- Run this in Supabase SQL Editor

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
    -- Add images column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;

    -- Add max_quantity column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'max_quantity') THEN
        ALTER TABLE public.products ADD COLUMN max_quantity INTEGER;
    END IF;

    -- Add specifications column if missing (legacy check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'specifications') THEN
        ALTER TABLE public.products ADD COLUMN specifications JSONB DEFAULT '{}';
    END IF;

    -- Add turnaround_days column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'turnaround_days') THEN
        ALTER TABLE public.products ADD COLUMN turnaround_days INTEGER DEFAULT 3;
    END IF;

    -- Ensure base_price is numeric
    ALTER TABLE public.products ALTER COLUMN base_price TYPE NUMERIC(10,2);
END $$;

-- Refresh PostgREST cache (Supabase does this automatically usually, but sometimes needs a nudge)
NOTIFY pgrst, 'reload schema';
