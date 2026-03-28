import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, IndianRupee, Clock, ToggleLeft, ToggleRight, X, ImagePlus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Shop = Tables<"shops">;

interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  min_quantity: number;
  max_quantity: number | null;
  images: string[];
  specifications: Record<string, any>;
  is_active: boolean;
  turnaround_days: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  shop: Shop | null;
}

const CATEGORIES = [
  "Visiting Cards", "Flyers", "Brochures", "Banners", "Stickers",
  "Letterheads", "Envelopes", "Posters", "Packaging", "Labels", "Other"
];

const emptyForm = {
  name: "",
  description: "",
  category: "Visiting Cards",
  base_price: "" as string | number,
  min_quantity: "1" as string | number,
  max_quantity: "",
  is_active: true,
  imageFile: null as File | null,
  imagePreview: "",
  price_tiers: [{ min: "1", price_per_unit: "0" }] as any[],
  sizes: [] as string[],
  materials: [] as string[],
};

export const ShopProducts = ({ shop }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [shop]);

  useEffect(() => {
    if (!shop) return;
    fetchProducts();
  }, [shop, fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      base_price: product.base_price.toString(),
      min_quantity: product.min_quantity.toString(),
      max_quantity: product.max_quantity?.toString() || "",
      is_active: product.is_active,
      imageFile: null,
      imagePreview: product.images?.[0] || "",
      price_tiers: ((product.specifications as any)?.price_tiers || [{ min: 1, price_per_unit: product.base_price }]).map((t: any) => ({
        min: t.min?.toString() || "",
        price_per_unit: t.price_per_unit?.toString() || ""
      })),
      sizes: (product.specifications as any)?.sizes || [],
      materials: (product.specifications as any)?.materials || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete product");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    }
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
      toast.success(product.is_active ? "Product deactivated" : "Product activated");
    }
  };

  const handleSave = async () => {
    if (!shop || !form.name || !form.category || form.base_price === "" || form.min_quantity === "") {
      toast.error("Please fill required fields (Name, Category, Price, Min Quantity)");
      return;
    }
    setSaving(true);

    let images: string[] = [];
    
    // Upload image if selected
    if (form.imageFile) {
      const ext = form.imageFile.name.split(".").pop();
      const filePath = `${shop.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, form.imageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        images = [urlData.publicUrl];
      }
    } else if (form.imagePreview) {
      images = [form.imagePreview];
    }

    const payload = {
      shop_id: shop.id,
      name: form.name,
      description: form.description || null,
      category: form.category,
      base_price: parseFloat(form.base_price.toString()) || 0,
      min_quantity: parseInt(form.min_quantity.toString()) || 1,
      max_quantity: form.max_quantity ? parseInt(form.max_quantity) : null,
      is_active: form.is_active,
      images,
      specifications: {
        ...((editingId ? products.find(p => p.id === editingId)?.specifications : {}) as any),
        price_tiers: form.price_tiers.map(t => ({
          min: parseInt(t.min.toString()) || 0,
          price_per_unit: parseFloat(t.price_per_unit.toString()) || 0
        })),
        sizes: form.sizes,
        materials: form.materials,
      }
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast.error("Failed to update product");
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        console.error("Product creation error:", error);
        toast.error(`Failed to add product: ${error.message}`);
      }
      else toast.success("Product added!");
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchProducts();
  };

  if (!shop) {
    return (
      <div className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
        <p className="text-muted-foreground">Register your shop first to manage products.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">{products.length} products listed</p>
        </div>
        <Button
          variant="coral"
          className="gap-2"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Premium Visiting Cards"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Base Price (₹) *</label>
                <input
                  type="number"
                  value={form.base_price}
                  onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Min Quantity</label>
                <input
                  type="number"
                  value={form.min_quantity}
                  onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Max Quantity</label>
                <input
                  type="number"
                  value={form.max_quantity}
                  onChange={(e) => setForm({ ...form, max_quantity: e.target.value })}
                  placeholder="No limit"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Product Image</label>
              <div className="flex items-center gap-4">
                {(form.imagePreview || form.imageFile) && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-sm text-muted-foreground cursor-pointer hover:border-accent/50 transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  {form.imageFile ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, imageFile: file, imagePreview: "" });
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Available Sizes (comma separated)</label>
                <input
                  type="text"
                  value={form.sizes.join(", ")}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g. A4, A3, 3.5x2 inch"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Materials (comma separated)</label>
                <input
                  type="text"
                  value={form.materials.join(", ")}
                  onChange={(e) => setForm({ ...form, materials: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g. 300gsm Glossy, Matte, Vinyl"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="bg-secondary/20 rounded-xl p-4 border border-dashed border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Bulk Pricing Tiers
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setForm({
                  ...form,
                  price_tiers: [...form.price_tiers, { min: (parseInt(form.price_tiers[form.price_tiers.length-1].min.toString()) * 10).toString(), price_per_unit: (parseFloat(form.price_tiers[form.price_tiers.length-1].price_per_unit.toString()) * 0.9).toString() }]
                })}>
                  + Add Tier
                </Button>
              </div>
              <div className="space-y-2">
                {form.price_tiers.map((tier, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase">Min Qty</label>
                      <input
                        type="number"
                        value={tier.min}
                        onChange={(e) => {
                          const newTiers = [...form.price_tiers];
                          newTiers[i].min = e.target.value;
                          setForm({ ...form, price_tiers: newTiers });
                        }}
                        className="w-full bg-background border border-input rounded p-1 text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase">Price / Unit</label>
                      <input
                        type="number"
                        value={tier.price_per_unit}
                        onChange={(e) => {
                          const newTiers = [...form.price_tiers];
                          newTiers[i].price_per_unit = e.target.value;
                          setForm({ ...form, price_tiers: newTiers });
                        }}
                        className="w-full bg-background border border-input rounded p-1 text-xs"
                      />
                    </div>
                    {i > 0 && (
                      <button onClick={() => {
                        const newTiers = form.price_tiers.filter((_, idx) => idx !== i);
                        setForm({ ...form, price_tiers: newTiers });
                      }} className="mt-4 text-destructive hover:scale-110 transition-transform">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Profitability Advisor */}
              <div className="mt-4 p-2 bg-accent/5 rounded border border-accent/10">
                <p className="text-[10px] font-bold text-accent uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Expert Profitability Advisor
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                  {form.price_tiers.length > 1 ? (
                    `You're offering a ${Math.round((1 - form.price_tiers[form.price_tiers.length-1].price_per_unit / form.price_tiers[0].price_per_unit) * 100)}% volume discount. High-volume orders increase retention but require tighter margin control.`
                  ) : "Pro Tip: Adding bulk tiers (e.g., 500+, 1000+) typically increases Average Order Value by 18%."}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe your product, paper quality, finishes available..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="text-accent"
                >
                  {form.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </button>
                <span className="text-sm text-foreground">{form.is_active ? "Active" : "Inactive"}</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="coral" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground animate-pulse">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-card">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No products yet</p>
          <p className="text-sm text-muted-foreground">Add your first product to start receiving orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all ${
                !product.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-foreground">{product.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{product.category}</span>
                </div>
                {!product.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {product.base_price}
                </span>
                <span>Min: {product.min_quantity}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => handleEdit(product)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleToggleActive(product)}
                >
                  {product.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
