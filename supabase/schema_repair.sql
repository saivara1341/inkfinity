-- INKFINITY SCHEMA REPAIR SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX MISSING COLUMNS

DO $$ 
BEGIN
    -- 1. REPAIR SHOPS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='accepts_razorpay') THEN
        ALTER TABLE public.shops ADD COLUMN accepts_razorpay BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='use_custom_razorpay') THEN
        ALTER TABLE public.shops ADD COLUMN use_custom_razorpay BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='razorpay_key_id') THEN
        ALTER TABLE public.shops ADD COLUMN razorpay_key_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='razorpay_key_secret') THEN
        ALTER TABLE public.shops ADD COLUMN razorpay_key_secret TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='razorpay_account_id') THEN
        ALTER TABLE public.shops ADD COLUMN razorpay_account_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='upi_id') THEN
        ALTER TABLE public.shops ADD COLUMN upi_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='bank_name') THEN
        ALTER TABLE public.shops ADD COLUMN bank_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='bank_account_number') THEN
        ALTER TABLE public.shops ADD COLUMN bank_account_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='shops' AND column_name='ifsc_code') THEN
        ALTER TABLE public.shops ADD COLUMN ifsc_code TEXT;
    END IF;

    -- 2. REPAIR ORDERS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='razorpay_order_id') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_order_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='razorpay_payment_id') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_payment_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='razorpay_signature') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_signature TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='platform_fee') THEN
        ALTER TABLE public.orders ADD COLUMN platform_fee NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='merchant_earning') THEN
        ALTER TABLE public.orders ADD COLUMN merchant_earning NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='platform_commission_rate') THEN
        ALTER TABLE public.orders ADD COLUMN platform_commission_rate NUMERIC(5,2) DEFAULT 5.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='settlement_status') THEN
        ALTER TABLE public.orders ADD COLUMN settlement_status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='orders' AND column_name='settlement_id') THEN
        ALTER TABLE public.orders ADD COLUMN settlement_id TEXT;
    END IF;

    -- 3. REFRESH SCHEMA CACHE
    NOTIFY pgrst, 'reload schema';
END $$;
