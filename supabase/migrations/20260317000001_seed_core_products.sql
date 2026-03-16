-- Seed core products into the products table to avoid UUID errors for hardcoded slugs
-- Date: 2026-03-17

DO $$
DECLARE
    v_shop_id UUID;
BEGIN
    -- Get the first active shop to associate these products with
    SELECT id INTO v_shop_id FROM public.shops LIMIT 1;

    IF v_shop_id IS NOT NULL THEN
        -- Insert Premium Visiting Card
        INSERT INTO public.products (
            shop_id, name, description, category, base_price, min_quantity, 
            turnaround_days, category_id, is_active
        ) VALUES (
            v_shop_id, 
            'Premium Visiting Card', 
            'Luxury cards with special finishes', 
            'premium-visiting-card', 
            5, 50, 4, 'visiting-cards', true
        ) ON CONFLICT DO NOTHING;

        -- Insert PVC ID Card
        INSERT INTO public.products (
            shop_id, name, description, category, base_price, min_quantity, 
            turnaround_days, category_id, is_active
        ) VALUES (
            v_shop_id, 
            'PVC ID Card', 
            'Standard plastic identity cards', 
            'pvc-id-card', 
            25, 1, 4, 'id-cards', true
        ) ON CONFLICT DO NOTHING;

        -- Insert Standard Flyer
        INSERT INTO public.products (
            shop_id, name, description, category, base_price, min_quantity, 
            turnaround_days, category_id, is_active
        ) VALUES (
            v_shop_id, 
            'Standard Flyer', 
            'Single or double-sided promotional flyers', 
            'standard-flyer', 
            2, 50, 3, 'flyers', true
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
