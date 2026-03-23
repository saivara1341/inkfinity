-- Migration to add payment and Razorpay configuration to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS accepts_razorpay BOOLEAN DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN shops.upi_id IS 'UPI ID for manual payments (e.g. shopname@okicici)';
COMMENT ON COLUMN shops.accepts_razorpay IS 'Whether this shop owner wants to use Razorpay for orders';
