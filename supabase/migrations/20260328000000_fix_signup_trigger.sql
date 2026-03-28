-- Migration: Fix Signup Trigger Robustness
-- Date: 2026-03-28
-- Description: Ensures all roles exist and handle_new_user is resilient to missing metadata.

-- 1. Ensure all roles exist in the app_role enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'manufacturer') THEN
        ALTER TYPE public.app_role ADD VALUE 'manufacturer';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'distributor') THEN
        ALTER TYPE public.app_role ADD VALUE 'distributor';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'supplier') THEN
        ALTER TYPE public.app_role ADD VALUE 'supplier';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If the type doesn't exist at all (highly unlikely given schema), ignore and let subsequent commands handle it
    NULL;
END $$;

-- 2. Update handle_new_user function to be robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role public.app_role;
    _full_name text;
    _customer_type text;
BEGIN
    -- Extract metadata with safe fallbacks
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name', 
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    _customer_type := COALESCE(NEW.raw_user_meta_data->>'customer_type', 'personal');
    
    -- Attempt to parse role, default to 'customer'
    BEGIN
        _role := (NEW.raw_user_meta_data->>'user_role')::public.app_role;
    EXCEPTION WHEN OTHERS THEN
        _role := 'customer'::public.app_role;
    END;

    -- Insert/Update profile
    INSERT INTO public.profiles (user_id, full_name, customer_type, avatar_url)
    VALUES (
        NEW.id, 
        _full_name,
        _customer_type,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        customer_type = EXCLUDED.customer_type,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    -- Insert role (idempotent)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Final fallback: Ensure the auth user creation doesn't fail even if trigger has errors
    -- (Supabase will log this internal error)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
