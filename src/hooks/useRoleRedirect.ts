import { supabase } from "@/integrations/supabase/client";

export const getRoleBasedPath = async (userId: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Hardcoded Platform Owner Recognition
  if (user?.email === "ssaivaraprasad51@gmail.com") {
    console.log("Platform Commander detected. Initiating direct HQ redirect...");
    return "/admin";
  }

  const metadataRole = user?.user_metadata?.user_role;
  
  if (metadataRole) {
    if (metadataRole === "admin") return "/admin";
    if (metadataRole === "shop_owner") return "/shop";
    if (metadataRole === "manufacturer" || metadataRole === "distributor" || metadataRole === "supplier") return "/supplier";
    if (metadataRole === "customer") return "/dashboard";
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (data?.role === "admin") return "/admin";
  if (data?.role === "shop_owner") return "/shop";
  if (data?.role === "manufacturer" || data?.role === "distributor" || data?.role === "supplier") return "/supplier";
  
  // Ignore 'customer' DB assignment here if metadata is missing, because a backend trigger auto-assigns it.
  // Force them to /select-role to properly choose their journey.
  return "/select-role";
};
