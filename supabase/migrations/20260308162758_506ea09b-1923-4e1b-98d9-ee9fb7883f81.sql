
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'order_update',
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Function to create notification on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_label text;
  customer_uid uuid;
  shop_owner_uid uuid;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Map status to label
    status_label := CASE NEW.status
      WHEN 'pending' THEN 'Order Received'
      WHEN 'confirmed' THEN 'Confirmed'
      WHEN 'designing' THEN 'Design in Progress'
      WHEN 'printing' THEN 'Printing'
      WHEN 'quality_check' THEN 'Quality Check'
      WHEN 'shipped' THEN 'Shipped'
      WHEN 'delivered' THEN 'Delivered'
      WHEN 'cancelled' THEN 'Cancelled'
      ELSE NEW.status::text
    END;

    -- Notify customer
    IF NEW.customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, order_id)
      VALUES (
        NEW.customer_id,
        'Order ' || status_label,
        'Your order #' || NEW.order_number || ' (' || NEW.product_name || ') is now ' || lower(status_label) || '.',
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
          'Order ' || status_label,
          'Order #' || NEW.order_number || ' status changed to ' || lower(status_label) || '.',
          'order_update',
          NEW.id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
