import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dmulntvejbpnbpiynujh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uNGesYnEyq7MOtL3o8JbgA_pLDy0Bv6";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
