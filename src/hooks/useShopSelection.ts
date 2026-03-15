import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, IndianRupee, ThumbsUp } from "lucide-react";

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
  const [shops, setShops] = useState<ShopProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      
      // In a real app, we would fetch from Supabase:
      // const { data, error } = await supabase.from('shops').select('*').contains('services', [service]);
      
      // For now, using mock data as requested to show ratings and costs
      const mockShops: ShopProvider[] = [
        { 
          id: "shop-1", 
          name: "Quick Print Hub", 
          rating: 4.8, 
          distance: "1.2 km", 
          baseCost: 1.50, 
          badges: ["Fastest", "Highly Rated"], 
          icon: "zap",
          services: ["visiting-cards", "flyers", "banners", "stickers", "id-cards"]
        },
        { 
          id: "shop-2", 
          name: "Inkfinity Pro Shop", 
          rating: 4.6, 
          distance: "2.5 km", 
          baseCost: 1.20, 
          badges: ["Best Value"], 
          icon: "rupee",
          services: ["visiting-cards", "flyers", "posters", "stickers", "custom"]
        },
        { 
          id: "shop-3", 
          name: "Elite Printing Solutions", 
          rating: 4.9, 
          distance: "3.8 km", 
          baseCost: 5.00, 
          badges: ["Premium Quality"], 
          icon: "thumbs-up",
          services: ["visiting-cards", "banners", "id-cards", "custom"]
        },
        { 
          id: "shop-4", 
          name: "Metro Prints", 
          rating: 4.2, 
          distance: "0.5 km", 
          baseCost: 2.00, 
          badges: ["Local Choice"], 
          icon: "zap",
          services: ["visiting-cards", "flyers", "posters"]
        }
      ];

      // Filter by service if provided
      const filteredShops = service && service !== "all" 
        ? mockShops.filter(s => s.services.includes(service))
        : mockShops;

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShops(filteredShops);
      setLoading(false);
    };

    fetchShops();
  }, [service]);

  return { shops, loading };
};
