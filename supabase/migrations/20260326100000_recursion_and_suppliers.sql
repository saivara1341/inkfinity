-- MASTER SCHEMA UPDATE - MARCH 2026
-- 0. PRE-REQUISITE FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. FIX USER_ROLES RECURSION
-- Create a security definer view to bypass RLS for role checks
CREATE OR REPLACE VIEW public.user_role_lookup WITH (security_invoker = false) AS
SELECT user_id, role FROM public.user_roles;

-- Update has_role function to use the non-recursive view
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_role_lookup WHERE user_id = _user_id AND role = _role
  )
$$;

-- Stabilize user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (
  (SELECT role FROM public.user_role_lookup WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

-- 2. CREATE SUPPLIERS TABLE (ERP Evolution)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  categories TEXT[] DEFAULT '{}',
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist in case of previous partial creation
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- RLS for Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers are viewable by everyone" ON public.suppliers;
CREATE POLICY "Suppliers are viewable by everyone" ON public.suppliers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Suppliers can update own profile" ON public.suppliers;
CREATE POLICY "Suppliers can update own profile" ON public.suppliers FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers;
CREATE POLICY "Admins can manage all suppliers" ON public.suppliers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update user_roles enum if needed
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'supplier') THEN
    ALTER TYPE public.app_role ADD VALUE 'supplier';
  END IF;
END $$;
