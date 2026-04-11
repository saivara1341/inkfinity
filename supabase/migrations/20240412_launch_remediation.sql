-- ==========================================
-- LAUNCH REMEDIATION: SECURITY & INTEGRITY
-- Created: 2024-04-12
-- ==========================================

-- 1. ORDER STATUS HISTORY
-- Tracks every transition of an order for transparency and timelines
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status public.order_status NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast timeline fetching
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_status_history(order_id);

-- 2. WALLET TRANSACTIONS
-- Persistent ledger for all merchant financial movements
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('credit', 'debit')),
    amount NUMERIC NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed', -- 'escrow', 'completed', 'failed'
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_shop_id ON public.wallet_transactions(shop_id);

-- 3. SECURITY HARDENING: RLS UPDATES
-- Enable owners to manage their order status (Previously SELECT only)
DROP POLICY IF EXISTS "Owners: Manage Own Orders" ON public.orders;
CREATE POLICY "Owners: Manage Own Orders SELECT" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = orders.shop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners: Manage Own Orders UPDATE" ON public.orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = orders.shop_id AND owner_id = auth.uid()));

-- Protect Shops from self-deletion (Audit trail integrity)
DROP POLICY IF EXISTS "Owners: Manage Own Shop" ON public.shops;
CREATE POLICY "Owners: View Own Shop" ON public.shops FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners: Update Own Shop" ON public.shops FOR UPDATE TO authenticated USING (owner_id = auth.uid());
-- Note: DELETE is now restricted to Admins by omitted policy

-- 4. INVENTORY LOGIC: CANCELLATION RETURN
-- Automatically returns stock to inventory if an order is cancelled
CREATE OR REPLACE FUNCTION public.handle_order_cancellation_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') THEN
        -- Attempt to find matching inventory item by name/category
        UPDATE public.shop_inventory
        SET stock_quantity = stock_quantity + NEW.quantity
        WHERE shop_id = NEW.shop_id
        AND (material_name = NEW.product_name OR material_type = NEW.product_category);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_order_cancellation_stock ON public.orders;
CREATE TRIGGER tr_order_cancellation_stock
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_cancellation_stock();

-- 5. PAYOUT SAFETY: BALANCE CONSTRAINT
-- Prevents payout requests that exceed available balance
ALTER TABLE public.payout_requests 
ADD CONSTRAINT payout_amount_limit 
CHECK (amount > 0);

-- Trigger to validate balance before insertion
CREATE OR REPLACE FUNCTION public.check_payout_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    current_bal NUMERIC;
BEGIN
    SELECT accrued_balance INTO current_bal FROM public.shops WHERE id = NEW.shop_id;
    
    IF NEW.amount > current_bal THEN
        RAISE EXCEPTION 'Insufficient balance for payout request. Available: %, Requested: %', current_bal, NEW.amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_payout_balance ON public.payout_requests;
CREATE TRIGGER tr_validate_payout_balance
    BEFORE INSERT ON public.payout_requests
    FOR EACH ROW EXECUTE FUNCTION public.check_payout_eligibility();

-- 6. RELATIONSHIPS & JOINS
-- Add explicit link between orders and profiles (for easier joining in client)
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_customer_profiles_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_customer_profiles_fkey 
FOREIGN KEY (customer_id) 
REFERENCES public.profiles(id);

-- 7. ENABLE RLS ON NEW TABLES
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners: View Own History" ON public.order_status_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = (SELECT shop_id FROM public.orders WHERE id = order_status_history.order_id) AND owner_id = auth.uid()));
CREATE POLICY "Owners: Insert Own History" ON public.order_status_history FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE id = (SELECT shop_id FROM public.orders WHERE id = order_status_history.order_id) AND owner_id = auth.uid()));

CREATE POLICY "Owners: View Own Transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops WHERE id = wallet_transactions.shop_id AND owner_id = auth.uid()));
