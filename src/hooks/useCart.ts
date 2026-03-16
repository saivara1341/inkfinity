import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"] & {
  product?: Database["public"]["Tables"]["products"]["Row"];
  shop?: {
    name: string;
    city: string;
  };
};

export const useCart = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*), shop:shops(name, city)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async ({ productId, shopId, quantity, specs }: { productId: string; shopId: string; quantity: number; specs?: any }) => {
      if (!userId) throw new Error("Not logged in");
      
      // Check if already in cart
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: userId,
          product_id: productId,
          shop_id: shopId,
          quantity,
          specifications: specs || {},
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(["cart", userId], []);
    },
  });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => {
    const price = (i as any).product?.base_price || 0;
    return sum + price * i.quantity;
  }, 0);

  return {
    items,
    loading,
    addToCart: (productId: string, shopId: string, quantity: number, specs?: any) => 
      addMutation.mutateAsync({ productId, shopId, quantity, specs }),
    updateQuantity: (itemId: string, quantity: number) => 
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    removeFromCart: (itemId: string) => 
      removeMutation.mutateAsync(itemId),
    clearCart: () => clearMutation.mutateAsync(),
    totalItems,
    totalAmount,
    addMutation,
    updateQuantityMutation,
    removeMutation,
    clearMutation
  };
};
