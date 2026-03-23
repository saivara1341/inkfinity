-- Function to create notification on new order
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_owner_uid uuid;
BEGIN
  -- Notify customer
  IF NEW.customer_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, order_id)
    VALUES (
      NEW.customer_id,
      'Order Placed! 🎉',
      'Your order #' || NEW.order_number || ' (' || NEW.product_name || ') has been placed successfully.',
      'order_update',
      NEW.id
    );
  END IF;

  -- Notify shop owner
  IF NEW.shop_id IS NOT NULL THEN
    SELECT owner_id INTO shop_owner_uid FROM public.shops WHERE id = NEW.shop_id;
    IF shop_owner_uid IS NOT NULL AND shop_owner_uid IS DISTINCT FROM NEW.customer_id THEN
      INSERT INTO public.notifications (user_id, title, message, type, order_id)
      VALUES (
        shop_owner_uid,
        'New Order Received! 📦',
        'You have a new order #' || NEW.order_number || ' for ' || NEW.product_name || '.',
        'order_update',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for new order
DROP TRIGGER IF EXISTS on_order_inserted ON public.orders;
CREATE TRIGGER on_order_inserted
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();
