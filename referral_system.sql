-- 1. REPAIR TABLES & COLUMNS (Safe version)
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
END $$;

-- 2. FUNCTION TO GENERATE UNIQUE CODES
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    -- Format: INK-XXXX (4 random uppercase alphanumeric)
    new_code := 'INK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4));
    
    -- Check if it exists
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO is_unique;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 3. UPDATED HANDLER (REPAIRED & REFERRAL READY)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
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
    'personal',
    public.generate_referral_code(),
    0
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');

  RETURN new;
END;
$$;

-- 4. RE-ATTACH AUTH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. FUNCTION TO RESOLVE REFERRER BY CODE
CREATE OR REPLACE FUNCTION public.get_user_id_by_referral_code(p_code text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_id FROM public.profiles WHERE referral_code = UPPER(p_code) LIMIT 1;
$$;

-- 6. TRIGGER TO AWARD REFERRAL CREDITS ON FIRST ORDER
CREATE OR REPLACE FUNCTION public.process_referral_award()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referred_by uuid;
  v_first_order_count bigint;
BEGIN
  -- Check if this order is 'delivered'
  IF (NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status <> 'delivered')) THEN
    
    -- Get who referred this customer
    SELECT referred_by INTO v_referred_by FROM public.profiles WHERE user_id = NEW.user_id;
    
    -- If they have a referrer, and this is their VERY FIRST delivered order
    IF v_referred_by IS NOT NULL THEN
      SELECT COUNT(*) INTO v_first_order_count FROM public.orders WHERE user_id = NEW.user_id AND status = 'delivered';
      
      IF v_first_order_count = 1 THEN
        -- Give ₹50 to the Referrer
        UPDATE public.profiles SET wallet_balance = COALESCE(wallet_balance, 0) + 50 WHERE user_id = v_referred_by;
        
        -- Give ₹50 to the New User
        UPDATE public.profiles SET wallet_balance = COALESCE(wallet_balance, 0) + 50 WHERE user_id = NEW.user_id;

        -- Optional: Log it in a transaction table if exists
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_process_referral_award ON public.orders;
CREATE TRIGGER tr_process_referral_award
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.process_referral_award();
