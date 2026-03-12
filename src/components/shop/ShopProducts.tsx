import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, IndianRupee, Clock, ToggleLeft, ToggleRight, X, ImagePlus } from "lucide-react";
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
  base_price: 0,
  min_quantity: 1,
  max_quantity: "",
  turnaround_days: 3,
  is_active: true,
  imageFile: null as File | null,
  imagePreview: "",
};

export const ShopProducts = ({ shop }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shop) return;
    fetchProducts();
  }, [shop]);

  const fetchProducts = async () => {
    if (!shop) return;
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      base_price: product.base_price,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity?.toString() || "",
      turnaround_days: product.turnaround_days,
      is_active: product.is_active,
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
    if (!shop || !form.name || !form.category) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    const payload = {
      shop_id: shop.id,
      name: form.name,
      description: form.description || null,
      category: form.category,
      base_price: form.base_price,
      min_quantity: form.min_quantity,
      max_quantity: form.max_quantity ? parseInt(form.max_quantity) : null,
      turnaround_days: form.turnaround_days,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast.error("Failed to update product");
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("Failed to add product");
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
                  onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Turnaround (days)</label>
                <input
                  type="number"
                  value={form.turnaround_days}
                  onChange={(e) => setForm({ ...form, turnaround_days: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Min Quantity</label>
                <input
                  type="number"
                  value={form.min_quantity}
                  onChange={(e) => setForm({ ...form, min_quantity: parseInt(e.target.value) || 1 })}
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
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {product.turnaround_days}d
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
