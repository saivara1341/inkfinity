/* 
  INKFINITY SECURITY HARDENING - NEXUS COMMAND HQ
  Run this script in your Supabase SQL Editor to lock down your data.
  
  This script:
  1. Enables RLS on all sensitive tables.
  2. Protects the Platform Commander (ssaivaraprasad51@gmail.com).
  3. Ensures Shop Owners only see their own orders.
*/

-- 1. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. ORDERS PRIVACY
-- Platform Commander: See everything
CREATE POLICY "Commander: Full Access to Orders" ON public.orders
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');

-- Shop Owners: See only their shop's orders
CREATE POLICY "Shop Owners: See Own Shop Orders" ON public.orders
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.shops 
        WHERE shops.id = orders.shop_id 
        AND shops.owner_id = auth.uid()
      )
    );

-- 3. SHOPS PRIVACY
-- Platform Commander: Managed everything
CREATE POLICY "Commander: Manage Shops" ON public.shops
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');

-- Owners: Manage their own shop
CREATE POLICY "Owners: Manage Own Shop" ON public.shops
    FOR ALL TO authenticated
    USING (owner_id = auth.uid());

-- 4. PAYOUTS PRIVACY
-- Commander: Can process everything
CREATE POLICY "Commander: Process Payouts" ON public.payout_requests
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');

-- Shop Owners: Can see/request their own payouts
CREATE POLICY "Shop Owners: Manage Own Payouts" ON public.payout_requests
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.shops 
        WHERE shops.id = payout_requests.shop_id 
        AND shops.owner_id = auth.uid()
      )
    );

-- 5. PROFILES PRIVACY
-- User can only see and update their own profile
CREATE POLICY "Users: Manage Own Profile" ON public.profiles
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Commander can see all for support
CREATE POLICY "Commander: View All Profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');
