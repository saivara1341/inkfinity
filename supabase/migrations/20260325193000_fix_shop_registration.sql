-- Fix public.shops table and register_shop RPC
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE OR REPLACE FUNCTION public.register_shop(
  _name text,
  _description text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _address text DEFAULT NULL,
  _city text DEFAULT 'Unknown',
  _state text DEFAULT 'Unknown',
  _pincode text DEFAULT '000000',
  _services text[] DEFAULT '{}',
  _latitude double precision DEFAULT NULL,
  _longitude double precision DEFAULT NULL
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

  INSERT INTO public.shops (
    owner_id, name, description, phone, email, address, city, state, pincode, services, latitude, longitude
  )
  VALUES (
    _user_id, _name, _description, _phone, _email, _address, _city, _state, _pincode, _services, _latitude, _longitude
  )
  RETURNING id INTO _shop_id;

  UPDATE public.user_roles SET role = 'shop_owner' WHERE user_id = _user_id;

  RETURN _shop_id;
END;
$$;
