-- ==========================================
-- INKFINITY TOTAL PLATFORM SETUP (v1.0)
-- ==========================================
-- This script sets up the entire Inkfinity infrastructure on Supabase.
-- It is designed to be re-runnable (IF NOT EXISTS / DROP-CREATE triggers).
-- 
-- TARGET: Supabase SQL Editor
-- OWNER: ssaivaraprasad51@gmail.com (Platform Commander)
-- ==========================================

-- 1. SETUP EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & CUSTOM TYPES
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'shop_owner', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
        'pending', 'confirmed', 'designing', 'printing', 
        'quality_check', 'shipped', 'delivered', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE IDENTITY TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    business_name TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    address TEXT,
    upi_id TEXT,
    qr_code_url TEXT,
    transaction_phone TEXT,
    customer_type TEXT DEFAULT 'personal',
    wallet_balance NUMERIC DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role DEFAULT 'customer',
    UNIQUE(user_id)
);

-- REPAIR USER_ROLES STRUCTURE
DO $$ 
BEGIN 
    -- 1. Remove redundancy
    DELETE FROM public.user_roles a
    USING public.user_roles b
    WHERE a.id > b.id AND a.user_id = b.user_id;

    -- 2. Add Unique Index if missing (Bypasses match-constraint logic)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_roles' AND indexdef LIKE '%user_id%') THEN
        CREATE UNIQUE INDEX user_roles_user_id_idx ON public.user_roles (user_id);
    END IF;
END $$;

-- 4. MARKETPLACE INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 0,
    services TEXT[],
    accrued_balance NUMERIC DEFAULT 0,
    accepts_razorpay BOOLEAN DEFAULT false,
    use_custom_razorpay BOOLEAN DEFAULT false,
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT,
    razorpay_account_id TEXT,
    upi_id TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    ifsc_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    images TEXT[],
    specifications JSONB,
    turnaround_days INTEGER DEFAULT 3,
    inventory_material_key TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. FINANCIAL & ORDERS LAYER
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id),
    shop_id UUID REFERENCES public.shops(id),
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    gst_amount NUMERIC DEFAULT 0,
    delivery_charge NUMERIC DEFAULT 0,
    grand_total NUMERIC NOT NULL,
    design_file_url TEXT,
    specifications JSONB NOT NULL,
    delivery_address TEXT,
    estimated_delivery DATE,
    notes TEXT,
    status public.order_status DEFAULT 'pending',
    payment_status public.payment_status DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    platform_fee NUMERIC DEFAULT 0,
    merchant_earning NUMERIC DEFAULT 0,
    platform_commission_rate NUMERIC(5,2) DEFAULT 5.00,
    settlement_status TEXT DEFAULT 'pending',
    settlement_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payout_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    shop_id UUID REFERENCES public.shops(id),
    total_amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    payout_amount NUMERIC(10,2) NOT NULL,
    razorpay_transfer_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. UTILITY & SUPPORT TABLES
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id),
    quantity INTEGER DEFAULT 1,
    specifications JSONB,
    design_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id),
    subject_id TEXT,
    subject_type TEXT,
    issue_category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shop_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    material_type TEXT NOT NULL,
    stock_quantity DECIMAL DEFAULT 0,
    unit TEXT NOT NULL,
    low_stock_threshold DECIMAL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INTELLIGENCE: FUNCTIONS & TRIGGERS

-- A. USER ONBOARDING TRIGGER
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile ONLY if not exists (Bypasses ON CONFLICT error)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
      INSERT INTO public.profiles (id, user_id, full_name, avatar_url, customer_type, referral_code)
      VALUES (
        new.id, 
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'New Printer'), 
        new.raw_user_meta_data->>'avatar_url', 
        'personal',
        public.generate_referral_code()
      );
  END IF;

  -- Insert role ONLY if not exists
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new.id) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (new.id, 'customer');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. FINANCIAL CALCULATIONS TRIGGER
CREATE OR REPLACE FUNCTION public.calculate_order_earnings()
RETURNS trigger AS $$
BEGIN
    NEW.platform_fee := (NEW.grand_total * (NEW.platform_commission_rate / 100));
    NEW.merchant_earning := NEW.grand_total - NEW.platform_fee;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calculate_earnings ON public.orders;
CREATE TRIGGER tr_calculate_earnings
BEFORE INSERT OR UPDATE OF grand_total, platform_commission_rate ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.calculate_order_earnings();

-- C. INVENTORY DEDUCTION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_inventory_on_order()
RETURNS trigger AS $$
BEGIN
    IF (NEW.status = 'printing' AND OLD.status = 'confirmed') THEN
        UPDATE public.shop_inventory
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = now()
        WHERE shop_id = NEW.shop_id 
          AND material_name = (SELECT inventory_material_key FROM public.products WHERE id = (NEW.specifications->>'product_id')::uuid);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_deduct_inventory ON public.orders;
CREATE TRIGGER tr_deduct_inventory
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_inventory_on_order();

-- 8. SECURITY HARDENING (RLS)

-- Enable RLS on everything
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to avoid conflicts
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Commander Privileges (The Mega-Admin)
CREATE POLICY "Commander: Access All Systems" ON public.profiles FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');
CREATE POLICY "Commander: Manage Role System" ON public.user_roles FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');
CREATE POLICY "Commander: Control Marketplace" ON public.shops FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');
CREATE POLICY "Commander: Financial Oversight" ON public.orders FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');
CREATE POLICY "Commander: Payout Authority" ON public.payout_requests FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');

-- Shop Owner Privileges
CREATE POLICY "Owners: Manage Own Shop" ON public.shops FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners: Manage Own Products" ON public.products FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = products.shop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners: Manage Own Orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = orders.shop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners: Manage Own Inventory" ON public.shop_inventory FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_inventory.shop_id AND owner_id = auth.uid()));

-- Product Discovery (Public)
CREATE POLICY "Public: Search Products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public: View Verified Shops" ON public.shops FOR SELECT TO anon, authenticated USING (is_active = true);

-- User Self-Management
CREATE POLICY "Users: Manage Own Profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY "Users: View Own Orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());

-- Fix Commander Account (Promote to Admin instantly)
-- Manual check to bypass ON CONFLICT errors
DO $$ 
DECLARE
    commander_id UUID;
BEGIN
    SELECT id INTO commander_id FROM auth.users WHERE email = 'ssaivaraprasad51@gmail.com';
    
    IF commander_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = commander_id) THEN
            UPDATE public.user_roles SET role = 'admin' WHERE user_id = commander_id;
        ELSE
            INSERT INTO public.user_roles (user_id, role) VALUES (commander_id, 'admin');
        END IF;
    END IF;
END $$;

-- ==========================================
-- SETUP COMPLETE
-- ==========================================
