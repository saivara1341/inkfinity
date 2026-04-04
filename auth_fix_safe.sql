-- ==========================================
-- HYPER-SAFE SUPABASE FIX (RUN IN SQL EDITOR)
-- Project: dmulntvejbpnbpiynujh
-- ==========================================

-- 1. REPAIR SCHEMA (Safe version)
DO $$ 
BEGIN 
  -- Ensure columns exist in profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by') THEN
    ALTER TABLE public.profiles ADD COLUMN referred_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
    ALTER TABLE public.profiles ADD COLUMN wallet_balance numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
    ALTER TABLE public.profiles ADD COLUMN user_id uuid NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

-- 2. ROBUST CODE GENERATOR
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    new_code := 'INK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4));
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO is_unique;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 3. THE "NEVER-FAIL" HANDLER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- We use UPSERT (ON CONFLICT) so it NEVER errors even if the user exists
  INSERT INTO public.profiles (
    id, 
    user_id, 
    full_name, 
    avatar_url, 
    customer_type, 
    referral_code,
    wallet_balance
  )
  VALUES (
    new.id, 
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Printer'), 
    new.raw_user_meta_data->>'avatar_url', 
    'customer',
    public.generate_referral_code(),
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

  -- Ensure Role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't crash the signup
  RAISE WARNING 'Trigger handle_new_user failed for: % using error: %', new.id, SQLERRM;
  RETURN new;
END;
$$;

-- 4. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. HELPER FOR REFERRALS
CREATE OR REPLACE FUNCTION public.get_user_id_by_referral_code(p_code text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_id FROM public.profiles WHERE referral_code = UPPER(p_code) LIMIT 1;
$$;
