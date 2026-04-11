-- Financial Systems Patch for Inkfinity
-- Add missing columns to 'shops' table

ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS accrued_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS accepts_razorpay BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS use_custom_razorpay BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_key_secret TEXT;

-- Index for faster financial queries
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);

-- Ensure orders table has necessary financial columns (if missing)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS merchant_earning NUMERIC DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN shops.accrued_balance IS 'Settled funds ready for withdrawal by the merchant';
COMMENT ON COLUMN shops.accepts_razorpay IS 'Whether the shop accepts online payments via platform or custom gateway';
