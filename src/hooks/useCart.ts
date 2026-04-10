import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { isUuid } from "@/lib/utils";
import { getSubcategoryById } from "@/data/printingProducts";
import { toast } from "sonner";

export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"] & {
  product?: Database["public"]["Tables"]["products"]["Row"];
  shop?: {
    name: string;
    city: string;
    price_includes_gst?: boolean;
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
    mutationFn: async ({ 
      productId, 
      shopId, 
      quantity, 
      specs,
      productName,
      categoryName
    }: { 
      productId: string | null; 
      shopId: string; 
      quantity: number; 
      specs?: any;
      productName?: string;
      categoryName?: string;
    }) => {
      if (!userId) throw new Error("Not logged in");
      
      console.log("Cart Action - Start:", { productId, shopId, quantity });

      let finalProductId: string | null = productId && isUuid(productId) ? productId : null;
      let finalShopId: string = shopId;

      // 1. Resolve Shop if it's a static slug
      if (shopId && !isUuid(shopId)) {
         const { data: firstShop } = await supabase.from("shops").select("id").limit(1).maybeSingle();
         if (firstShop) {
           finalShopId = firstShop.id;
         } else {
           throw new Error("NO_SHOPS_AVAILABLE");
         }
      }

      // 2. Resolve or Create Product if it's a static slug
      if (productId && !isUuid(productId)) {
        console.log("Resolving static product slug:", productId);
        
        // Search by mapping in metadata
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("shop_id", finalShopId)
          .contains('specifications', { original_slug: productId })
          .maybeSingle();

        if (existingProduct) {
          finalProductId = existingProduct.id;
        } else {
          // Perform Lazy Sync
          const staticData = getSubcategoryById(productId);
          const insertData = {
            name: productName || staticData?.name || "Platform Item",
            category: categoryName || staticData?.categoryName || "Custom Print",
            base_price: staticData ? parseInt(staticData.startingPrice.replace(/[^0-9]/g, "")) || 0 : 0,
            min_quantity: staticData?.minQty || 1,
            shop_id: finalShopId,
            description: staticData?.description || `Premium ${productName || 'product'} from partner shop`,
            images: staticData?.image ? [staticData.image] : [],
            specifications: {
              ...(specs || {}),
              original_slug: productId,
              platform_standard: true,
              sync_date: new Date().toISOString()
            },
            is_active: true
          };

          const { data: newProd, error: insertErr } = await supabase
            .from("products")
            .insert(insertData as any)
            .select("id")
            .single();

          if (insertErr) throw insertErr;
          finalProductId = newProd.id;
        }
      }

      if (!finalProductId) throw new Error("PRODUCT_UNAVAILABLE");

      // 3. Prevent cross-shopping (mismatch check)
      if (items.length > 0) {
        if (items[0].shop_id !== finalShopId) {
          throw new Error("SHOP_MISMATCH");
        }
      }

      // Check if already in cart
      const existing = items.find((i) => 
        (finalProductId && i.product_id === finalProductId)
      );

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: userId,
          product_id: finalProductId as any, 
          shop_id: finalShopId,
          quantity,
          specifications: {
            ...specs,
            resolved_from_slug: productId && !isUuid(productId) ? productId : undefined
          },
          design_file_url: specs?.frontDesign || null
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const item = items.find(i => i.id === itemId);
      const minQty = (item as any)?.product?.min_quantity || 1;

      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
        if (error) throw error;
      } else {
        // Enforce min quantity if not deleting
        const finalQuantity = Math.max(minQty, quantity);
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: finalQuantity })
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
  const subtotal = items.reduce((sum, i) => {
    const basePrice = (i as any).product?.base_price || 0;
    const itemTotal = basePrice * i.quantity;
    const gstIncl = (i as any).shop?.price_includes_gst ?? true;
    return sum + (gstIncl ? itemTotal : itemTotal * 1.12);
  }, 0);

  const platformFee = Math.round(subtotal * 0.02); // 2% Platform Fee for Customer
  const totalAmount = subtotal + platformFee;

  return {
    items,
    loading,
    addToCart: (params: { 
      productId: string | null, 
      shopId: string, 
      quantity: number, 
      specs?: any, 
      productName?: string, 
      categoryName?: string 
    }) => addMutation.mutateAsync(params),
    updateQuantity: (itemId: string, quantity: number) => 
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    removeFromCart: (itemId: string) => 
      removeMutation.mutateAsync(itemId),
    clearCart: () => clearMutation.mutateAsync(),
    totalItems,
    subtotal,
    platformFee,
    totalAmount,
    addMutation,
    updateQuantityMutation,
    removeMutation,
    clearMutation
  };
};
