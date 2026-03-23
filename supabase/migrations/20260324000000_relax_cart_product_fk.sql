-- Migration to relax cart_items foreign key and add generic product support
-- Date: 2026-03-24

-- Make product_id nullable in cart_items
ALTER TABLE public.cart_items ALTER COLUMN product_id DROP NOT NULL;

-- Add generic_product_id (category/subcategory slug) to cart_items
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS generic_product_id TEXT;

-- Make product_id nullable in order_items
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;

-- Add generic_product_id to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS generic_product_id TEXT;

-- Add category_name and product_name to cart_items for easier display
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS category_name TEXT;

-- Add the same to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS category_name TEXT;
