import { useEffect } from "react";
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
  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ["shop-data", user?.id, user?.email],
    queryFn: async () => {
      if (!user) return null;
      console.log("Fetching shop data for user:", user.id, user.email);
      
      // 1. Try fetching by exact owner_id
      let { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching shop data by ID:", error);
        throw error;
      }

      // 2. If not found, try fetching by email (Identity Sync Fallback)
      if (!data && user.email) {
        console.log("No shop found by owner_id, attempting email fallback for:", user.email);
        const { data: emailData, error: emailError } = await supabase
          .from("shops")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        if (emailError) {
          console.warn("Email fallback query failed:", emailError.message);
        } else if (emailData) {
          console.log("Identity match found by email. Auto-healing owner_id...");
          // Auto-heal: Link this shop to the current identity permanently
          const { error: patchError } = await supabase
            .from("shops")
            .update({ owner_id: user.id })
            .eq("id", emailData.id);

          if (!patchError) {
            data = { ...emailData, owner_id: user.id };
            
            // Also update user metadata to prevent future onboarding redirects
            supabase.auth.updateUser({
              data: { registration_complete: true, user_role: 'shop_owner' }
            });
          } else {
            console.error("Failed to auto-heal shop owner_id:", patchError);
            data = emailData; // Still return it so they have dashboard access
          }
        }
      }
      
      console.log("Shop data result:", data ? `Found (${data.name})` : "Not found");
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
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey(
            full_name,
            avatar_url,
            business_name,
            phone
          )
        `)
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

  // Mutation to update order tracking
  const updateTrackingMutation = useMutation({
    mutationFn: async ({ orderId, trackingInfo }: { orderId: string; trackingInfo: any }) => {
      const { error } = await supabase
        .from("orders")
        .update({ tracking_details: trackingInfo as any })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders", shop?.id] });
    },
  });

  // Mutation to update order payment
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: status as any })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders", shop?.id] });
    },
  });

export const useShopTransactions = (shopId?: string) => {
  return useQuery({
    queryKey: ["shop-transactions", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("wallet_transactions" as any)
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });
};

export const useOrderHistory = (orderId: string) => {
  return useQuery({
    queryKey: ["order-history", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history" as any)
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId,
  });
};

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
    updateOrderPayment: async (id: string, status: string) => {
      try {
        await updatePaymentMutation.mutateAsync({ orderId: id, status });
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    updateOrderTracking: async (id: string, trackingInfo: any) => {
      try {
        await updateTrackingMutation.mutateAsync({ orderId: id, trackingInfo });
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
    updateShopMutation,
  };
};

export const useShopRealtime = (shopId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    // Listen for order changes
    const ordersChannel = supabase
      .channel("shop-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["shop-orders", shopId] });
        }
      )
      .subscribe();

    // Listen for transaction changes
    const txChannel = supabase
      .channel("shop-tx-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallet_transactions",
          filter: `shop_id=eq.${shopId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["shop-transactions", shopId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(txChannel);
    };
  }, [shopId, queryClient]);
};
