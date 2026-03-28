-- =========================================================================
-- PRINTFLOW COMPLETE PLATFORM MASTER SCHEMA (UNIFIED VERSION)
-- Run this entire file in your Supabase SQL Editor to set up ALL tables,
-- roles, triggers, and security policies for the entire platform.
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'shop_owner', 'customer', 'supplier', 'manufacturer', 'distributor');
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'designing', 'printing', 'quality_check', 'shipped', 'delivered', 'cancelled', 'quote_requested');
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. CORE IDENTITY TABLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'customer',
    UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    business_name TEXT,
    customer_type TEXT DEFAULT 'personal', -- 'personal' or 'business'
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BUSINESS CORE TABLES
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 0,
    services TEXT[] DEFAULT '{}',
    whatsapp_number TEXT,
    qr_code_url TEXT,
    supported_payment_apps TEXT[] DEFAULT '{}',
    upi_id TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    ifsc_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    business_name TEXT,
    description TEXT,
    supplier_type TEXT DEFAULT 'manufacturer',
    gst_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    upi_id TEXT,
    qr_code_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODUCT & INVENTORY TABLES
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    volume_pricing JSONB DEFAULT '[]',
    images TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT,
    quantity_in_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    img_url TEXT NOT NULL,
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SALES & ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    product_category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    specifications JSONB DEFAULT '{}',
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) DEFAULT 0,
    delivery_charge NUMERIC(10,2) DEFAULT 0,
    grand_total NUMERIC(10,2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    delivery_address TEXT,
    tracking_number TEXT,
    courier_partner TEXT DEFAULT 'Shiprocket',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CRM, MARKETING & B2B
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(owner_id, code)
);

CREATE TABLE IF NOT EXISTS public.customer_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.distributor_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manufacturer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    credit_limit DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(manufacturer_id, distributor_id)
);

-- 8. SECURITY & RLS POLICIES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Unified Policies
-- Profiles
DROP POLICY IF EXISTS "Profiles updateable by owner" ON public.profiles;
CREATE POLICY "Profiles updateable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- Designs
DROP POLICY IF EXISTS "Designs are viewable by owner" ON public.designs;
CREATE POLICY "Designs are viewable by owner" ON public.designs FOR ALL USING (auth.uid() = owner_id);

-- Shops
DROP POLICY IF EXISTS "Public shops are viewable by everyone" ON public.shops;
CREATE POLICY "Public shops are viewable by everyone" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage their own shops" ON public.shops;
CREATE POLICY "Owners manage their own shops" ON public.shops FOR ALL USING (auth.uid() = owner_id);

-- Coupons
DROP POLICY IF EXISTS "Active coupons viewable by everyone" ON public.coupons;
CREATE POLICY "Active coupons viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners manage their own coupons" ON public.coupons;
CREATE POLICY "Owners manage their own coupons" ON public.coupons FOR ALL USING (auth.uid() = owner_id);

-- Products
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage their products" ON public.products;
CREATE POLICY "Owners manage their products" ON public.products FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = products.shop_id AND owner_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = products.shop_id AND owner_id = auth.uid()
));

-- Orders
DROP POLICY IF EXISTS "Users view their own orders" ON public.orders;
CREATE POLICY "Users view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- 9. FUNCTIONS & SEARCH
DROP FUNCTION IF EXISTS search_products(TEXT);
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS SETOF public.products AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.products
    WHERE 
        name % search_term OR 
        description % search_term OR
        category % search_term
    ORDER BY similarity(name, search_term) DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_role public.app_role;
BEGIN
  -- Safely parse the role
  BEGIN
    initial_role := (NEW.raw_user_meta_data->>'user_role')::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    initial_role := 'customer'::public.app_role;
  END;

  INSERT INTO public.profiles (user_id, full_name, avatar_url, customer_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'customer_type', 'personal')
  ) ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, initial_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Read Logos" ON "storage"."objects";
CREATE POLICY "Public Read Logos" ON "storage"."objects" FOR SELECT USING (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Public Read Designs" ON "storage"."objects";
CREATE POLICY "Public Read Designs" ON "storage"."objects" FOR SELECT USING (bucket_id = 'designs');

DROP POLICY IF EXISTS "Auth Upload Logos" ON "storage"."objects";
CREATE POLICY "Auth Upload Logos" ON "storage"."objects" FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Auth Upload Designs" ON "storage"."objects";
CREATE POLICY "Auth Upload Designs" ON "storage"."objects" FOR INSERT TO authenticated WITH CHECK (bucket_id = 'designs');

DROP POLICY IF EXISTS "Public Read Product Images" ON "storage"."objects";
CREATE POLICY "Public Read Product Images" ON "storage"."objects" FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth Upload Product Images" ON "storage"."objects";
CREATE POLICY "Auth Upload Product Images" ON "storage"."objects" FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
