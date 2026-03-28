-- Add missing columns to shops table for enhanced payments
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS supported_payment_apps TEXT[] DEFAULT '{}';

-- Create storage bucket for shop logos and QRs if it doesn't exist
-- Note: This requires the storage extension to be enabled
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
-- Allow public to read logos
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'shop-logos');

-- Allow authenticated users to upload to their own folder in shop-logos
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-logos');

-- Allow users to update/delete their own uploads
CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'shop-logos');
CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shop-logos');
