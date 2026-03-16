import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ShopRow = Database["public"]["Tables"]["shops"]["Row"];

export interface ShopProvider {
  id: string;
  name: string;
  rating: number;
  distance: string;
  baseCost: number;
  badges: string[];
  icon: "zap" | "rupee" | "thumbs-up";
  services: string[];
}

export const useShopSelection = (service?: string) => {
  const { data: shops = [], isLoading: loading } = useQuery({
    queryKey: ["shop-selection", service],
    queryFn: async () => {
      let query = supabase.from("shops").select("*").eq("is_active", true).eq("is_verified", true);
      
      if (service && service !== "all") {
        query = query.contains("services", [service]);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((shop: ShopRow): ShopProvider => ({
        id: shop.id,
        name: shop.name,
        rating: Number(shop.rating) || 4.5,
        distance: "Local", // Simplified for now, could be calculated if we had GPS
        baseCost: Number(shop.price_multiplier) || 1.0,
        badges: shop.is_verified ? ["Verified Shop"] : [],
        icon: "zap",
        services: shop.services || [],
      }));
    }
  });

  return { shops, loading };
};
