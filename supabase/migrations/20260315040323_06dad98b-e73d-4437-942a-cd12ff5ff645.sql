-- The designs view policy already exists, skip it
-- Just add the upload policy for designs if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload designs' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload designs" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'designs');
  END IF;
END $$;

-- Attach triggers (may have been created above, use IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_order_status_change') THEN
    CREATE TRIGGER on_order_status_change
      AFTER UPDATE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();
  END IF;
END $$;