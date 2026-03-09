import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  shop_id: string;
  quantity: number;
  specifications: Record<string, any>;
  design_file_url: string | null;
  created_at: string;
  product?: {
    name: string;
    base_price: number;
    category: string;
    images: string[];
    turnaround_days: number;
  };
  shop?: {
    name: string;
    city: string;
  };
}

export const useCart = (userId?: string) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*), shop:shops(name, city)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems((data as unknown as CartItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  const addToCart = async (productId: string, shopId: string, quantity: number, specs?: Record<string, any>) => {
    if (!userId) return { error: new Error("Not logged in") };
    // Check if already in cart
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
      if (!error) fetchCart();
      return { error };
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      shop_id: shopId,
      quantity,
      specifications: specs || {},
    });
    if (!error) fetchCart();
    return { error };
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(itemId);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    }
    return { error };
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
    return { error };
  };

  const clearCart = async () => {
    if (!userId) return;
    await supabase.from("cart_items").delete().eq("user_id", userId);
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => {
    const price = (i as any).product?.base_price || 0;
    return sum + price * i.quantity;
  }, 0);

  return { items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount, refetch: fetchCart };
};
