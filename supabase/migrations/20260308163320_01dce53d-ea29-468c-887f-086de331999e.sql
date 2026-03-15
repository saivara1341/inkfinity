
-- WhatsApp user sessions to track conversation state
CREATE TABLE public.whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  user_id uuid,
  role text,
  conversation_state text NOT NULL DEFAULT 'welcome',
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) access this table
CREATE POLICY "Service role only" ON public.whatsapp_sessions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
