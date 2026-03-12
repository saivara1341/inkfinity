DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();

CREATE OR REPLACE FUNCTION public.register_shop(
  _name text,
  _description text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _address text DEFAULT NULL,
  _city text DEFAULT 'Unknown',
  _state text DEFAULT 'Unknown',
  _pincode text DEFAULT '000000',
  _services text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _shop_id uuid;
  _existing_shop uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT id INTO _existing_shop FROM public.shops WHERE owner_id = _user_id LIMIT 1;
  IF _existing_shop IS NOT NULL THEN
    RAISE EXCEPTION 'User already has a registered shop';
  END IF;
  INSERT INTO public.shops (owner_id, name, description, phone, email, address, city, state, pincode, services)
  VALUES (_user_id, _name, _description, _phone, _email, _address, _city, _state, _pincode, _services)
  RETURNING id INTO _shop_id;
  UPDATE public.user_roles SET role = 'shop_owner' WHERE user_id = _user_id;
  RETURN _shop_id;
END;
$$;

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload designs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'designs');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view designs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'designs');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Shop owners can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Shop owners can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;