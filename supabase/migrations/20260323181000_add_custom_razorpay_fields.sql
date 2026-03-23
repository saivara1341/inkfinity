-- Migration to add custom Razorpay credentials to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS use_custom_razorpay BOOLEAN DEFAULT FALSE;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS razorpay_key_secret TEXT;

COMMENT ON COLUMN shops.use_custom_razorpay IS 'Whether to use the shop owner''s own Razorpay account instead of the platform''s';
