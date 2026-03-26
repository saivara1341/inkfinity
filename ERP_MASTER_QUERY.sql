
-- PRINTFLOW ERP MASTER SCHEMA (VERSION 7)
-- Advanced Features: Inventory Automation, B2B Quotations, Logistics, and Fuzzy Search.
-- Optimized for scale and Admin control.

-- 1. CLEANUP & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'shop_owner', 'customer', 'supplier');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'designing', 'printing', 'quality_check', 'shipped', 'delivered', 'cancelled', 'quote_requested');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. HELPER FUNCTIONS (RECURSION PROOF)
CREATE OR REPLACE FUNCTION public.internal_get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. CORE TABLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'customer',
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
-- Allow users to insert their own role for signup
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    business_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles are insertable by owner" ON public.profiles;
CREATE POLICY "Profiles are insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

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
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 0,
    services TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    business_name TEXT, -- Fallback for older code
    description TEXT,
    supplier_type TEXT DEFAULT 'manufacturer',
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    website_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 5. PRODUCT TABLES
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
    volume_pricing JSONB DEFAULT '[]', -- Format: [{"min_qty": 100, "price": 4.5}, {"min_qty": 1000, "price": 3.8}]
    images TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    turnaround_days INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    moq INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- 5.1 INVENTORY LOGS
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID, -- Can be from products or supplier_products (not strictly enforced for flexibility)
    shop_id UUID REFERENCES public.shops(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    change_amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'sale', 'restock', 'return', 'adjustment'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 5.2 B2B QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    customer_id UUID REFERENCES auth.users(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    specifications JSONB DEFAULT '{}',
    status TEXT DEFAULT 'requested', -- 'requested', 'quoted', 'accepted', 'rejected', 'expired'
    quoted_price NUMERIC(10,2),
    estimated_days INTEGER,
    customer_notes TEXT,
    vendor_notes TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES (OPTIMIZED & RECURSION-PROOF)

-- Admin Bypass Helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- user_roles Policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- shops Policies
DROP POLICY IF EXISTS "Shops are viewable by everyone" ON public.shops;
CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Shop owners can update own shop" ON public.shops;
CREATE POLICY "Shop owners can update own shop" ON public.shops FOR UPDATE USING (auth.uid() = owner_id OR is_admin());
DROP POLICY IF EXISTS "Shop owners can insert shop" ON public.shops;
CREATE POLICY "Shop owners can insert shop" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id OR is_admin());

-- suppliers Policies
DROP POLICY IF EXISTS "Suppliers viewable by everyone" ON public.suppliers;
CREATE POLICY "Suppliers viewable by everyone" ON public.suppliers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Suppliers managed by owner" ON public.suppliers;
CREATE POLICY "Suppliers managed by owner" ON public.suppliers FOR ALL USING (auth.uid() = owner_id OR is_admin());

-- products Policies
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Shop owners can manage products" ON public.products;
CREATE POLICY "Shop owners can manage products" ON public.products FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR is_admin())
WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR is_admin());

-- supplier_products Policies
DROP POLICY IF EXISTS "Supplier products viewable by everyone" ON public.supplier_products;
CREATE POLICY "Supplier products viewable by everyone" ON public.supplier_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Supplier products managed by owner" ON public.supplier_products;
CREATE POLICY "Supplier products managed by owner" ON public.supplier_products FOR ALL 
USING (supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid()) OR is_admin())
WITH CHECK (supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid()) OR is_admin());

-- inventory_logs Policies
DROP POLICY IF EXISTS "Inventory logs viewable by owners" ON public.inventory_logs;
CREATE POLICY "Inventory logs viewable by owners" ON public.inventory_logs FOR SELECT 
USING (
    is_admin() OR 
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
);

-- quotes Policies
DROP POLICY IF EXISTS "Quotes viewable by parties" ON public.quotes;
CREATE POLICY "Quotes viewable by parties" ON public.quotes FOR SELECT 
USING (
    is_admin() OR 
    customer_id = auth.uid() OR
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Quotes insertable by all" ON public.quotes;
CREATE POLICY "Quotes insertable by all" ON public.quotes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7. SEARCH FUNCTIONS

-- FUZZY SEARCH FOR PRODUCTS
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

-- FUZZY SEARCH FOR B2B MATERIALS
CREATE OR REPLACE FUNCTION search_sourcing(search_term TEXT)
RETURNS SETOF public.supplier_products AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.supplier_products
    WHERE 
        name % search_term OR 
        description % search_term OR
        category % search_term
    ORDER BY similarity(name, search_term) DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. INVENTORY AUTOMATION

CREATE OR REPLACE FUNCTION public.handle_stock_deduction()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder for actual order-item deduction logic
    -- When an order is 'confirmed', we'd ideally iterate through its items.
    -- For now, if we had a product_id on the order, we'd do:
    -- UPDATE public.products SET stock_quantity = stock_quantity - 1 WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC FUNCTIONS

CREATE OR REPLACE FUNCTION public.register_shop(
  _name text,
  _description text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _address text DEFAULT NULL,
  _city text DEFAULT 'Unknown',
  _state text DEFAULT 'Unknown',
  _pincode text DEFAULT '000000',
  _services text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _shop_id uuid;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  
  INSERT INTO public.shops (owner_id, name, description, phone, email, address, city, state, pincode, services)
  VALUES (_user_id, _name, _description, _phone, _email, _address, _city, _state, _pincode, _services)
  RETURNING id INTO _shop_id;
  
  -- Update role to shop_owner
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'shop_owner')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'shop_owner';
  
  RETURN _shop_id;
END;
$$;

-- 10. ORDERS & LOGISTICS (INTEGRATED)

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    product_category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    specifications JSONB NOT NULL DEFAULT '{}',
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(10,2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    design_file_url TEXT,
    notes TEXT,
    delivery_address TEXT,
    estimated_delivery DATE,
    
    -- Logistics fields
    tracking_number TEXT,
    courier_partner TEXT,
    tracking_url TEXT,
    
    -- B2B Linkage
    quote_id UUID REFERENCES public.quotes(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 11. FINAL POLICIES FOR ORDERS
DROP POLICY IF EXISTS "Orders viewable by parties" ON public.orders;
CREATE POLICY "Orders viewable by parties" ON public.orders FOR SELECT 
USING (
    is_admin() OR 
    customer_id = auth.uid() OR
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Orders insertable by auth" ON public.orders;
CREATE POLICY "Orders insertable by auth" ON public.orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Orders updatable by shop/admin" ON public.orders;
CREATE POLICY "Orders updatable by shop/admin" ON public.orders FOR UPDATE 
USING (
    is_admin() OR 
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- 12. TRIGGER: UPDATED_AT
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_shops_updated_at ON public.shops;
CREATE TRIGGER tr_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_quotes_updated_at ON public.quotes;
CREATE TRIGGER tr_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 13. INVENTORY AUTOMATION
CREATE OR REPLACE FUNCTION public.handle_stock_deduction()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock when order is confirmed/processing
    IF (NEW.status IN ('confirmed', 'processing') AND OLD.status = 'pending') THEN
        UPDATE public.products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        INSERT INTO public.inventory_logs (product_id, shop_id, change_amount, type, description)
        VALUES (NEW.product_id, NEW.shop_id, -NEW.quantity, 'sale', 'Order #' || NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_order_stock_deduction ON public.orders;
CREATE TRIGGER tr_order_stock_deduction AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_stock_deduction();

-- 14. ENTERPRISE COMPLIANCE & LOGISTICS EXPANSION
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS business_license_url TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_partner TEXT DEFAULT 'Shiprocket';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS label_data JSONB DEFAULT '{}';

-- 15. SEARCH OPTIMIZATION (Fuzzy Search Support)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP FUNCTION IF EXISTS public.search_products(text);
CREATE OR REPLACE FUNCTION public.search_products(query_text TEXT)
RETURNS SETOF public.products AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.products
    WHERE 
        name % query_text OR 
        description % query_text OR
        category % query_text
    ORDER BY similarity(name, query_text) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
