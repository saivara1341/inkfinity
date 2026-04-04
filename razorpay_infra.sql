-- 1. Ensure core numeric columns exist for financial calculations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'grand_total') THEN
        ALTER TABLE public.orders ADD COLUMN grand_total NUMERIC(10,2) DEFAULT 0;
        -- Backfill from specifications JSON if possible
        UPDATE public.orders SET grand_total = (specifications->>'grand_total')::numeric 
        WHERE (specifications->>'grand_total') IS NOT NULL;
    END IF;
END $$;

-- 2. Update Orders table with Razorpay tracking fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS merchant_earning NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_commission_rate NUMERIC(5,2) DEFAULT 5.00;

-- 3. Update Shops table with Razorpay account ID for automated routing
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT;

-- 3. Create Payout Settlements table for automated ledger tracking
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

-- 4. Enable RLS on new table
ALTER TABLE public.payout_settlements ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Payout Settlements
CREATE POLICY "Admins can view all settlements" 
ON public.payout_settlements FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Shop owners can view their own settlements" 
ON public.payout_settlements FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.shops WHERE id = payout_settlements.shop_id AND owner_id = auth.uid()));

-- 6. Trigger to automatically calculate earnings when an order is created/updated
CREATE OR REPLACE FUNCTION public.calculate_order_earnings()
RETURNS TRIGGER AS $$
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
