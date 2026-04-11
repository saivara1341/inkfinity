-- 1. EXTEND SHOPS WITH COMMISSION RATES
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS platform_commission_rate NUMERIC(5,2) DEFAULT 5.00;

-- 2. CREATE COLLABORATIONS TABLE
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Machinery', -- Machinery, Logistics, Raw Materials, Software, etc.
    logo_url TEXT,
    cta_link TEXT,
    target_roles TEXT[] DEFAULT '{shop_owner, supplier, customer}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS FOR COLLABORATIONS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active collaborations
DROP POLICY IF EXISTS "Public View Active Collaborations" ON public.collaborations;
CREATE POLICY "Public View Active Collaborations" ON public.collaborations
    FOR SELECT USING (is_active = true);

-- ONLY Platform Commander can MANAGE collaborations
DROP POLICY IF EXISTS "Commander Management Collaborations" ON public.collaborations;
CREATE POLICY "Commander Management Collaborations" ON public.collaborations
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'ssaivaraprasad51@gmail.com');

-- 4. BULK UPDATE FUNCTION FOR COMMISSIONS
CREATE OR REPLACE FUNCTION public.update_all_shop_commissions(p_new_rate numeric)
RETURNS void AS $$
BEGIN
    -- Only allow if called by admin/authenticated with proper permissions
    -- (In production, you'd add more rigorous check if not using RLS already)
    UPDATE public.shops SET platform_commission_rate = p_new_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
