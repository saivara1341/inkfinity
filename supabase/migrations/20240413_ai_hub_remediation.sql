-- AI Design Hub Remediation: Persistent Design Storage
-- Created: 2024-04-13

-- 1. DESIGNS TABLE
-- Tracks all AI-generated and edited designs across the platform
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'General',
    img_url TEXT NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- REPAIR: Ensure all required columns exist if table was created previously
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='designs' AND column_name='is_public') THEN
        ALTER TABLE public.designs ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='designs' AND column_name='img_url') THEN
        ALTER TABLE public.designs ADD COLUMN img_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='designs' AND column_name='specifications') THEN
        ALTER TABLE public.designs ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='designs' AND column_name='type') THEN
        ALTER TABLE public.designs ADD COLUMN type TEXT DEFAULT 'General';
    END IF;
END $$;



-- Index for fast user design fetching
CREATE INDEX IF NOT EXISTS idx_designs_owner_id ON public.designs(owner_id);

-- 2. SECURITY: RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage their own designs
CREATE POLICY "Owners can manage own designs" ON public.designs
    FOR ALL USING (auth.uid() = owner_id);

-- Policy: Anyone can view public designs (Optional: for a global showcase later)
CREATE POLICY "Public designs are viewable by everyone" ON public.designs
    FOR SELECT USING (is_public = true);

-- 3. STORAGE BUCKET MIGRATION HINT
-- Note: You must ensure a 'designs' bucket exists in Supabase Storage with public access.
-- Run the following in the Storage Policies section if using SQL for storage:
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');
*/
