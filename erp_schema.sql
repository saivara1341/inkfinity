-- PrintFlow Complete ERP System Schema
-- Run this entire file in your Supabase SQL Editor to set up the ERP database tables and security policies.

-- ==========================================
-- 1. INVENTORY MANAGEMENT (Shops & Manufacturers)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Shop or Manufacturer Owner
    item_name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Paper', 'Ink', 'Packaging', 'Spare Parts'
    sku TEXT,
    quantity_in_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL, -- Where it was bought from
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- 2. PURCHASE ORDERS (B2B: Shops buying from Manufacturers)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    po_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, shipped, delivered, cancelled
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    expected_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.supplier_products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- 3. INVOICING & FINANCIALS (Unified Billing)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    
    -- An invoice either belongs to a B2C Order or a B2B Purchase Order
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, 
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    
    issuer_id UUID REFERENCES auth.users(id) NOT NULL, -- The entity requesting payment
    recipient_id UUID REFERENCES auth.users(id) NOT NULL, -- The entity paying
    
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    
    status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid, overdue, cancelled
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- 4. STAFF & HR MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Shop owner or Manufacturer
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- e.g., 'Manager', 'Machine Operator', 'Delivery', 'Sales'
    email TEXT,
    phone TEXT,
    daily_wage DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    joined_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Inventory: Owners can see and manage their own inventory
CREATE POLICY "Users can manage their own inventory" ON public.inventory_items
  FOR ALL USING (auth.uid() = owner_id);

-- Purchase Orders: Shops can see their POs, Suppliers can see POs directed to them
CREATE POLICY "Shops can view their own POs" ON public.purchase_orders
  FOR SELECT USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
  );
CREATE POLICY "Shops can create POs" ON public.purchase_orders
  FOR INSERT WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));
CREATE POLICY "Parties can update their POs" ON public.purchase_orders
  FOR UPDATE USING (
    shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
  );

-- PO Items: Visible if the parent PO is visible
CREATE POLICY "Users can view PO items for their POs" ON public.purchase_order_items
  FOR SELECT USING (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders 
      WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
      OR supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
    )
  );
CREATE POLICY "Shops can insert PO items" ON public.purchase_order_items
  FOR INSERT WITH CHECK (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders 
      WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    )
  );

-- Invoices: Visible to issuer and recipient
CREATE POLICY "Users can see invoices they issued or received" ON public.invoices
  FOR ALL USING (auth.uid() = issuer_id OR auth.uid() = recipient_id);

-- Employers manage their staff
CREATE POLICY "Employers manage their staff" ON public.staff_members
  FOR ALL USING (auth.uid() = employer_id);


-- ==========================================
-- 6. SUPPLIER PAYMENT SETTINGS
-- ==========================================
ALTER TABLE IF EXISTS public.suppliers 
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS accepts_razorpay BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_balance DECIMAL(10,2) DEFAULT 0.00;

-- ==========================================
-- 7. CUSTOMER SEGREGATION (Prime vs Normal)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Manufacturer or Shop
    name TEXT NOT NULL, -- e.g., 'Prime', 'Wholesale', 'Normal'
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.customer_segment_members (
    segment_id UUID REFERENCES public.customer_segments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (segment_id, customer_id)
);

-- ==========================================
-- 8. COUPONS & DISCOUNTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Shop or Manufacturer
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_uses INTEGER, -- NULL for unlimited
    uses_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(owner_id, code)
);

CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- 9. DISTRIBUTOR MANAGEMENT (Manufacturer -> Distributor link)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.distributor_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manufacturer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', -- active, suspended
    credit_limit DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(manufacturer_id, distributor_id)
);

-- Add RLS Policies for new tables
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage segments" ON public.customer_segments FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owners can manage segment members" ON public.customer_segment_members FOR ALL USING (
  segment_id IN (SELECT id FROM public.customer_segments WHERE owner_id = auth.uid())
);

CREATE POLICY "Owners can manage coupons" ON public.coupons FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Anyone can view active coupons of owners" ON public.coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can view coupon usage" ON public.coupon_usages FOR SELECT USING (
  coupon_id IN (SELECT id FROM public.coupons WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert coupon usage" ON public.coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Manufacturers can manage links" ON public.distributor_links FOR ALL USING (auth.uid() = manufacturer_id);
CREATE POLICY "Distributors can view their links" ON public.distributor_links FOR SELECT USING (auth.uid() = distributor_id);
