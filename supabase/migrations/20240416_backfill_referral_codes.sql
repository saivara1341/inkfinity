-- ==========================================
-- BACKFILL REFERRAL CODES
-- Created: 2024-04-16
-- ==========================================

DO $$ 
DECLARE 
    r RECORD;
    new_code TEXT;
    is_unique BOOLEAN;
BEGIN 
    -- Find all profiles with no referral code
    FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL OR referral_code = '' LOOP
        is_unique := false;
        
        -- Generate unique code
        WHILE NOT is_unique LOOP
            new_code := 'INK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4));
            SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO is_unique;
        END LOOP;
        
        -- Update profile
        UPDATE public.profiles SET referral_code = new_code WHERE id = r.id;
    END LOOP;
END $$;
