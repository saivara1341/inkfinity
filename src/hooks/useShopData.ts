import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Shop = Database["public"]["Tables"]["shops"]["Row"];

export const useShopData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch shop data
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop-data", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch orders for this shop
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["shop-orders", shop?.id],
    queryFn: async () => {
      if (!shop) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shop,
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders", shop?.id] });
    },
  });

  // Mutation to update shop profile
  const updateShopMutation = useMutation({
    mutationFn: async (updates: Partial<Shop>) => {
      if (!shop) throw new Error("No shop found");
      const { error } = await supabase
        .from("shops")
        .update(updates)
        .eq("id", shop.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-data", user?.id] });
    },
  });

  return {
    shop,
    orders,
    loading: shopLoading || ordersLoading,
    updateOrderStatus: async (id: string, status: string) => {
      try {
        await updateStatusMutation.mutateAsync({ orderId: id, newStatus: status });
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    updateShopProfile: async (updates: Partial<Shop>) => {
      try {
        await updateShopMutation.mutateAsync(updates);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    updateStatusMutation,
    updateShopMutation
  };
};
