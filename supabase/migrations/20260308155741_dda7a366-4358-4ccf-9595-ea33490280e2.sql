
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- App roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'shop_owner', 'customer');

-- User roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  business_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 0,
  services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shops are viewable by everyone" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Shop owners can update own shop" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Shop owners can insert shop" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can update any shop" ON public.shops FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders table
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'designing', 'printing', 'quality_check', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  product_category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '{}',
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  design_file_url TEXT,
  notes TEXT,
  delivery_address TEXT,
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Shop owners can view shop orders" ON public.orders FOR SELECT USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Shop owners can update shop orders" ON public.orders FOR UPDATE USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL,
  gst_rate NUMERIC(4,2) NOT NULL DEFAULT 18.00,
  gst_amount NUMERIC(10,2) NOT NULL,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own quotations" ON public.quotations FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create quotations" ON public.quotations FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Shop owners can view shop quotations" ON public.quotations FOR SELECT USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Admins can view all quotations" ON public.quotations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Design generations table (for AI-generated designs)
CREATE TABLE public.design_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  business_details JSONB DEFAULT '{}',
  generated_images TEXT[] DEFAULT '{}',
  selected_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.design_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations" ON public.design_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create generations" ON public.design_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON public.design_generations FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for design uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);

CREATE POLICY "Anyone can view designs" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Authenticated users can upload designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own designs" ON storage.objects FOR UPDATE USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);
