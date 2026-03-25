import { supabase } from "@/integrations/supabase/client";

export const getRoleBasedPath = async (userId: string): Promise<string> => {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (data?.role === "admin") return "/admin";
  if (data?.role === "shop_owner") return "/shop";
  if (data?.role === "manufacturer") return "/supplier";
  return "/dashboard";
};
