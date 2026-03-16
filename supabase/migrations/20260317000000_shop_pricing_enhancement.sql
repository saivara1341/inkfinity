-- Migration: Enhance shops table with pricing and capabilities
-- Date: 2026-03-17

-- Add price_multiplier to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS price_multiplier NUMERIC(4,2) DEFAULT 1.0;

-- Add service_capabilities for advanced requirement verification
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS service_capabilities JSONB DEFAULT '{}';

-- Optional: Populate some initial multipliers for variety in demo
UPDATE public.shops SET price_multiplier = 0.95 WHERE rating >= 4.8;
UPDATE public.shops SET price_multiplier = 1.05 WHERE rating < 4.0;

-- Ensure services array is populated for existing shops if empty
-- (For standard products we expect: visiting-cards, flyers, posters, etc.)
UPDATE public.shops 
SET services = ARRAY['visiting-cards', 'flyers', 'posters', 'banners', 'stickers']
WHERE services = '{}' OR services IS NULL;
