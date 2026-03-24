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

export const useShopSelection = (service?: string, userLocation?: { latitude: number; longitude: number } | null) => {
  const { data: shops = [], isLoading: loading } = useQuery({
    queryKey: ["shop-selection", service, userLocation?.latitude, userLocation?.longitude],
    queryFn: async () => {
      let query = supabase.from("shops").select("*").eq("is_active", true);
      
      if (service && service !== "all") {
        query = query.contains("services", [service]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Haversine distance formula
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const mappedShops = (data || []).map((shop: any): ShopProvider & { rawDistance: number } => {
        let distNum = Infinity;
        if (userLocation && shop.latitude && shop.longitude) {
          distNum = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            Number(shop.latitude), 
            Number(shop.longitude)
          );
        }

        return {
          id: shop.id,
          name: shop.name,
          rating: Number(shop.rating) || 4.5,
          distance: distNum === Infinity ? "Remote" : distNum < 1 ? `${Math.round(distNum * 1000)}m` : `${distNum.toFixed(1)}km`,
          rawDistance: distNum,
          baseCost: Number(shop.rating) ? 1.0 : 0.95, // Simple mockup for cost
          badges: shop.is_verified ? ["Verified Shop"] : [],
          icon: "zap",
          services: shop.services || [],
        };
      });

      // Sort by distance if location available, else by rating
      return mappedShops.sort((a, b) => {
        if (a.rawDistance !== b.rawDistance) return a.rawDistance - b.rawDistance;
        return b.rating - a.rating;
      });
    }
  });

  return { shops, loading };
};
