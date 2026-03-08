import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type Shop = Tables<"shops">;

export const useShopData = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchShopAndOrders = async () => {
      setLoading(true);
      // Get shop owned by current user
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      setShop(shopData);

      if (shopData) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false });

        setOrders(ordersData || []);
      }
      setLoading(false);
    };

    fetchShopAndOrders();

    // Realtime subscription for orders
    const channel = supabase
      .channel("shop-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            if (newOrder.shop_id === shop?.id) {
              setOrders((prev) => [newOrder, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as any })
      .eq("id", orderId);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    }
    return { error };
  };

  const updateShopProfile = async (updates: Partial<Shop>) => {
    if (!shop) return { error: new Error("No shop found") };
    const { error } = await supabase
      .from("shops")
      .update(updates)
      .eq("id", shop.id);
    if (!error) {
      setShop((prev) => (prev ? { ...prev, ...updates } : prev));
    }
    return { error };
  };

  return { shop, orders, loading, updateOrderStatus, updateShopProfile };
};
