-- Add payment details to profiles table for admin (and potentially others)
ALTER TABLE public.profiles
ADD COLUMN upi_id TEXT,
ADD COLUMN qr_code_url TEXT,
ADD COLUMN transaction_phone TEXT;
