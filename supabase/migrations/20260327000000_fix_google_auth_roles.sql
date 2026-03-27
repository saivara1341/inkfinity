-- Fix Google Auth users bypassing onboarding by not assigning a default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  -- Only insert into user_roles if 'user_role' metadata is explicitly provided (e.g., email signup)
  IF NEW.raw_user_meta_data->>'user_role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'user_role')::app_role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
