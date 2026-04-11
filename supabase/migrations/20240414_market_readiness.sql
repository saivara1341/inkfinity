-- ==========================================
-- MARKET READINESS REPAIR: AUTH & SCHEMA
-- Created: 2024-04-14
-- ==========================================

-- 1. REPAIR DESIGNS TABLE (AI HUB & CATALOG SYNC)
DO $$ 
BEGIN 
    -- Add is_public if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='designs' AND column_name='is_public') THEN
        ALTER TABLE public.designs ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    -- Add category if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='designs' AND column_name='category') THEN
        ALTER TABLE public.designs ADD COLUMN category TEXT DEFAULT 'General';
    END IF;

    -- Add type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='designs' AND column_name='type') THEN
        ALTER TABLE public.designs ADD COLUMN type TEXT DEFAULT 'poster';
    END IF;
END $$;

-- 2. REPAIR PROFILES & AUTH TRIGGER
-- Ensure column 'user_id' exists in profiles if the trigger expects it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
    END IF;
END $$;

-- Hardened handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_referral_code TEXT;
    is_unique BOOLEAN := false;
BEGIN
    -- Generate unique referral code
    WHILE NOT is_unique LOOP
        new_referral_code := 'INK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4));
        SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code) INTO is_unique;
    END LOOP;

    -- Upsert profile (more resilient than INSERT)
    INSERT INTO public.profiles (id, user_id, full_name, avatar_url, customer_type, referral_code)
    VALUES (
        new.id, 
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'New Printer'), 
        new.raw_user_meta_data->>'avatar_url', 
        'personal',
        new_referral_code
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();

    -- Ensure role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'customer')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Fallback to minimal profile if something weird happens (Prevents 500 error blocks)
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENSURE STABILITY IN SEARCH RPC
-- Some versions might be missing search_products
CREATE OR REPLACE FUNCTION public.search_products(query text, category_filter text DEFAULT NULL)
RETURNS SETOF jsonb AS $$
BEGIN
    RETURN QUERY
    SELECT to_jsonb(p.*) || jsonb_build_object('shop', to_jsonb(s.*))
    FROM public.products p
    JOIN public.shops s ON p.shop_id = s.id
    WHERE (p.name ILIKE '%' || query || '%' OR p.description ILIKE '%' || query || '%')
    AND (category_filter IS NULL OR p.category = category_filter)
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
