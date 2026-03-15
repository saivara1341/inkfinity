
-- Products table for shop owners to list their print products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  max_quantity integer,
  images text[] DEFAULT '{}'::text[],
  specifications jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  turnaround_days integer DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cart table
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  specifications jsonb DEFAULT '{}'::jsonb,
  design_file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products: publicly viewable, shop owners can manage their own
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Shop owners can insert products" ON public.products FOR INSERT WITH CHECK (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Shop owners can update own products" ON public.products FOR UPDATE USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Shop owners can delete own products" ON public.products FOR DELETE USING (
  shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
);

-- Reviews: publicly viewable, customers can create for their orders
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Cart: users manage their own cart
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at on products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
