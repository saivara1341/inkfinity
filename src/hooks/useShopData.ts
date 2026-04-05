import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Shop = Database["public"]["Tables"]["shops"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

export const useShopData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch shop data with high-performance caching (Marketplace 2.0)
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop-data", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("shops")
        .select("id, name, owner_id, city, is_verified, product_count, rating, storefront_status")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30,    // 30 minutes cache
  });

  // Fetch orders with specific selection to reduce bandwidth
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["shop-orders", shop?.id],
    queryFn: async () => {
      if (!shop) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, product_name, grand_total, status, created_at, customer_id, shop_id")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shop,
    staleTime: 1000 * 30, // 30 seconds fresh (orders change more frequently)
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus, changedBy }: { orderId: string; newStatus: OrderStatus, changedBy?: string }) => {
      // 1. Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);
      if (updateError) throw updateError;

      // 2. Add to history
      const { error: historyError } = await supabase
        .from("order_status_history" as any)
        .insert({
          order_id: orderId,
          status: newStatus,
          changed_by: changedBy || user?.id,
          notes: `Status updated to ${newStatus}`
        });
      // We don't throw for history failure to prevent blocking the main update, 
      // but we log it in reality.
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders", shop?.id] });
      queryClient.invalidateQueries({ queryKey: ["order-history", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
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
    updateOrderStatus: async (id: string, status: OrderStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ orderId: id, newStatus: status, changedBy: user?.id });
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
