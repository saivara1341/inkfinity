-- Final Launch Readiness Patch
-- 1. Order Grouping
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS purchase_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number TEXT;

-- 2. Partner Network (Collaborations)
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cta_link TEXT,
    category TEXT DEFAULT 'Logistics',
    target_roles TEXT[] DEFAULT '{shop_owner, supplier}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active collaborations
CREATE POLICY "Collaborations are viewable by everyone" ON public.collaborations
    FOR SELECT USING (is_active = true);

-- Policy: Only admins can manage collaborations
-- (Assuming 'admin' check logic matches profiles/roles)
CREATE POLICY "Admins can manage collaborations" ON public.collaborations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );



-- 3. Supplier Wallet Parity
-- (Assuming profiles.wallet_balance already exists for all users)
-- No table changes needed here, just UI integration.

-- 4. Bulk Commission Procedure
CREATE OR REPLACE FUNCTION public.update_all_shop_commissions(p_new_rate NUMERIC)
RETURNS void AS $$
BEGIN
    UPDATE public.shops 
    SET platform_commission_rate = p_new_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
