-- Add manufacturer and distributor roles to app_role enum
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'manufacturer') THEN
    ALTER TYPE public.app_role ADD VALUE 'manufacturer';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'distributor') THEN
    ALTER TYPE public.app_role ADD VALUE 'distributor';
  END IF;
END $$;
