-- Inventory Management Infrastructure for PrintFlow

-- 1. Create inventory items table
CREATE TABLE IF NOT EXISTS public.shop_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL, -- e.g. "300gsm Matte Paper", "Cyan Ink"
    material_type TEXT NOT NULL, -- "paper", "ink", "finish", "other"
    stock_quantity DECIMAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL, -- "sheets", "liters", "units"
    low_stock_threshold DECIMAL NOT NULL DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add material_mapping to product_specifications
-- This allows us to know which material to deduct when a product is ordered
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inventory_material_key TEXT;

-- 3. Function to deduct inventory on order
CREATE OR REPLACE FUNCTION public.handle_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if order status is moved to 'processing'
    IF (TG_OP = 'UPDATE' AND NEW.status = 'processing' AND OLD.status = 'confirmed') THEN
        -- Deduct from shop_inventory based on quantity
        -- Note: This is a simplified logic where 1 product unit = 1 inventory unit
        UPDATE public.shop_inventory
        SET stock_quantity = stock_quantity - NEW.quantity,
            updated_at = now()
        WHERE shop_id = NEW.shop_id 
          AND material_name = (SELECT inventory_material_key FROM public.products WHERE id = NEW.product_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for inventory deduction
DROP TRIGGER IF EXISTS tr_deduct_inventory ON public.orders;
CREATE TRIGGER tr_deduct_inventory
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_inventory_on_order();

-- 5. Helper view for low stock alerts
CREATE OR REPLACE VIEW public.low_stock_alerts AS
SELECT s.name as shop_name, i.material_name, i.stock_quantity, i.unit
FROM public.shop_inventory i
JOIN public.shops s ON i.shop_id = s.id
WHERE i.stock_quantity <= i.low_stock_threshold;
