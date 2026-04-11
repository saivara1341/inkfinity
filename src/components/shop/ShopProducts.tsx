import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, IndianRupee, Clock, ToggleLeft, ToggleRight, X, ImagePlus, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STOCK_IMAGES = [
  { id: 'vc-1', name: 'Standard Business Card', url: '/inkfinity/assets/products/standard-visiting-card.png', category: 'Visiting Cards' },
  { id: 'vc-2', name: 'Premium Business Card', url: '/inkfinity/assets/products/premium-visiting-card.png', category: 'Visiting Cards' },
  { id: 'vc-3', name: 'Transparent PVC Card', url: '/inkfinity/assets/products/transparent-pvc-card.png', category: 'Visiting Cards' },
  { id: 'flyer-1', name: 'Marketing Flyer', url: '/inkfinity/assets/products/flyer_branded.png', category: 'Flyers & Leaflets' },
  { id: 'flyer-2', name: 'Promotional Flyer', url: '/inkfinity/assets/products/flyer_mockup_canva_style_1775247481252.png', category: 'Flyers & Leaflets' },
  { id: 'brochure-1', name: 'Tri-Fold Brochure', url: '/inkfinity/assets/products/trifold-brochure.png', category: 'Pamphlets & Brochures' },
  { id: 'brochure-2', name: 'Bi-Fold Brochure', url: '/inkfinity/assets/products/pamphlet_branded.png', category: 'Pamphlets & Brochures' },
  { id: 'poster-1', name: 'Vibrant Poster', url: '/inkfinity/assets/products/poster_branded.png', category: 'Posters' },
  { id: 'poster-2', name: 'Cinema Poster', url: '/inkfinity/assets/products/photo-poster.png', category: 'Posters' },
  { id: 'banner-1', name: 'Professional Banner', url: '/inkfinity/assets/products/banner_branded.png', category: 'Banners & Flex' },
  { id: 'sticker-1', name: 'Die-Cut Sticker', url: '/inkfinity/assets/products/sticker_mockup_canva_style_1775247512635.png', category: 'Stickers & Labels' },
  { id: 'sticker-2', name: 'Sheet Stickers', url: '/inkfinity/assets/products/sheet-stickers.png', category: 'Stickers & Labels' },
  { id: 'id-1', name: 'Employee ID Card', url: '/inkfinity/assets/products/id_card_branded.png', category: 'ID Cards' },
  { id: 'merch-1', name: 'Premium T-Shirt', url: '/inkfinity/assets/products/tshirt_branded.png', category: 'T-Shirts & Merchandise' },
];

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
  price_includes_gst: boolean;
  turnaround_days: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  shop: Shop | null;
}

const CATEGORIES = [
  "Visiting Cards", "Flyers & Leaflets", "Pamphlets & Brochures",
  "Posters", "Banners & Flex", "Stickers & Labels", "ID Cards",
  "Standees & Roll-Ups", "Invitations & Wedding Cards", "Letterheads & Envelopes",
  "Packaging & Boxes", "Certificates & Awards", "T-Shirts & Merchandise",
  "Notepads & Diaries", "Menu Cards", "Calendars", "Hospital & Medical",
  "Luxury Weddings", "Other"
];

const PRODUCT_TEMPLATES: Record<string, string[]> = {
  "Visiting Cards": ["Standard Business Card", "Premium Business Card", "Transparent PVC Card", "Rounded Corner Card", "Square Business Card"],
  "Flyers & Leaflets": ["Standard Flyer", "Premium Flyer", "Door Hanger", "Folded Leaflet", "Pamphlet"],
  "Pamphlets & Brochures": ["Tri-Fold Brochure", "Bi-Fold Brochure", "A4 Catalog", "Booklet"],
  "Posters": ["Photo Poster", "Bulk Poster", "A3 Poster", "A4 Poster"],
  "Banners & Flex": ["Vinyl Banner", "Outdoor Flex Banner", "Fabric Banner", "Mesh Banner"],
  "Stickers & Labels": ["Sheet Stickers", "Die-Cut Stickers", "Product Labels", "Mailing Labels"],
  "ID Cards": ["Employee ID Card", "Student ID Card", "Visitor Pass", "Lanyard Card"],
  "Standees & Roll-Ups": ["Roll-up Standee (3x6 ft)", "X-Standee (2x5 ft)", "L-Standee"],
  "Invitations & Wedding Cards": ["Wedding Card", "Party Invitation", "Save the Date", "Greeting Card"],
  "Letterheads & Envelopes": ["Standard Letterhead", "Premium Letterhead", "DL Envelope", "C4 Envelope"],
  "Packaging & Boxes": ["Custom Cardboard Box", "Product Packaging", "Mailbox Sticker", "Gift Box"],
  "Certificates & Awards": ["Achievement Certificate", "Student Award", "Participation Certificate"],
  "T-Shirts & Merchandise": ["Round Neck T-Shirt", "Polo T-Shirt", "Sports T-Shirt", "Hoodie", "Coffee Mug"],
  "Notepads & Diaries": ["A5 Notepad", "Premium Diary", "Spiral Notebook"],
  "Menu Cards": ["Restaurant Menu (Single)", "Restaurant Menu (Multiple)", "Cafe Table Menu"],
  "Calendars": ["Wall Calendar", "Desk Calendar", "Pocket Calendar"],
  "Hospital & Medical": ["Prescription Pad", "Patient File Folder", "Medical Report Cover"],
  "Luxury Weddings": ["Acrylic Invitation", "Gold Foil Wedding Set", "Velvet Invitation Box"],
  "Other": []
};

const emptyForm = {
  name: "",
  description: "",
  category: "Visiting Cards",
  base_price: "" as string | number,
  min_quantity: "1" as string | number,
  max_quantity: "",
  is_active: true,
  price_includes_gst: true,
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
  const [galleryOpen, setGalleryOpen] = useState(false);

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
      price_includes_gst: product.price_includes_gst ?? true,
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
      },
      price_includes_gst: form.price_includes_gst
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

  const [generatingAI, setGeneratingAI] = useState(false);

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.error("Please enter a product name and category first to generate an accurate image");
      return;
    }

    setGeneratingAI(true);
    toast.loading("AI is designing your product image...", { id: "ai-gen" });

    try {
      const prompt = `A professional, high-quality, studio photography mockup of a ${form.name}. ${form.description || ''} The product belongs to the ${form.category} category. Minimalist clean background, centered composition, soft lighting.`;

      const { data, error } = await supabase.functions.invoke('generate-design', {
        body: { prompt, productType: form.category, count: 1 }
      });

      if (error) throw error;

      const generatedImage = data?.images?.[0] || data?.imageUrl;
      if (!generatedImage) throw new Error("No image was generated");

      setForm({ ...form, imagePreview: generatedImage, imageFile: null });
      toast.success("AI generated a product image successfully!", { id: "ai-gen" });
    } catch (err: any) {
      console.error("AI Generation error:", err);
      toast.error(`Failed to generate image: ${err.message || 'Please try again'}`, { id: "ai-gen" });

      // Fallback for demo
      const fallbackUrl = "https://images.unsplash.com/photo-1586075010633-de982cd26f1c?w=800&q=80";
      setForm({ ...form, imagePreview: fallbackUrl, imageFile: null });
      toast.success("Using a high-quality fallback image for now.", { id: "ai-gen" });
    } finally {
      setGeneratingAI(false);
    }
  };

  if (!shop) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your print catalog and pricing</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }} className="gap-2 rounded-xl bg-coral hover:bg-coral/90 text-white">
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {!loading && products.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 flex items-center gap-4"
        >
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">No Products Yet</h3>
            <p className="text-sm text-muted-foreground">Add your first product so customers can start placing orders!</p>
          </div>
          <Button variant="coral" onClick={() => setShowForm(true)} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> Create Product
          </Button>
        </motion.div>
      )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Product Name *</label>
                  <select
                    value={PRODUCT_TEMPLATES[form.category]?.includes(form.name) ? form.name : "custom"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setForm({ ...form, name: "" });
                      } else {
                        setForm({ ...form, name: val });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all mb-2"
                  >
                    <option value="" disabled>Select a product...</option>
                    {(PRODUCT_TEMPLATES[form.category] || []).map((template) => (
                      <option key={template} value={template}>{template}</option>
                    ))}
                    <option value="custom">Other / Custom Name</option>
                  </select>
                  
                  {(!PRODUCT_TEMPLATES[form.category]?.includes(form.name) || form.name === "") && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter custom product name..."
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Base Price (₹ per single piece or unit) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={form.base_price}
                      onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Min Quantity</label>
                  <input
                    type="number"
                    value={form.min_quantity}
                    onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setForm({ ...form, price_includes_gst: !form.price_includes_gst })}
                    className="text-accent"
                  >
                    {form.price_includes_gst ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    Price {form.price_includes_gst ? "Includes GST" : "Excludes GST"}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Max Quantity</label>
                  <input
                    type="number"
                    value={form.max_quantity}
                    onChange={(e) => setForm({ ...form, max_quantity: e.target.value })}
                    placeholder="No limit"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-foreground block">Product Image</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all"
                    onClick={handleAIGenerate}
                    disabled={generatingAI}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingAI ? "animate-spin text-muted-foreground" : "group-hover:animate-bounce"}`} />
                    {generatingAI ? "Generating..." : "Generate with AI"}
                  </Button>
                  <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 border-[#FF7300] text-[#FF7300] hover:bg-[#FF7300] hover:text-white transition-all">
                        <TrendingUp className="w-3.5 h-3.5 group-hover:animate-bounce" /> Pick from Gallery
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          Professional Stock Gallery
                          <span className="text-sm font-normal text-muted-foreground">({form.category})</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                        {STOCK_IMAGES.filter(img => img.category === form.category).length > 0 ? (
                          STOCK_IMAGES.filter(img => img.category === form.category).map((img) => (
                          <div
                            key={img.id}
                            className="group relative aspect-video rounded-2xl overflow-hidden border-2 border-border cursor-pointer hover:border-[#FF7300] shadow-card hover:shadow-elevated transition-all"
                            onClick={() => {
                              setForm({ ...form, imagePreview: img.url, imageFile: null });
                              setGalleryOpen(false);
                            }}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 flex flex-col items-start justify-end p-4 text-white">
                              <span className="text-sm font-bold truncate w-full">{img.name}</span>
                              <span className="text-[10px] uppercase tracking-wider opacity-90">{img.category}</span>
                            </div>
                          </div>
                        ))
                        ) : (
                          <div className="col-span-full py-20 text-center space-y-4">
                            <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                              <ImagePlus className="w-8 h-8" />
                            </div>
                            <div className="max-w-xs mx-auto">
                              <p className="text-sm font-semibold text-foreground">No stock images for this category yet</p>
                              <p className="text-xs text-muted-foreground mt-1">Try using the AI Generator above or upload your own high-quality mockup.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {(form.imagePreview || form.imageFile) ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-secondary border border-border group">
                    <img
                      src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <button
                      onClick={() => setForm({ ...form, imageFile: null, imagePreview: "" })}
                      className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-sm rounded-full text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-accent hover:text-accent cursor-pointer transition-all bg-secondary/20">
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Upload</span>
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
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Upload a high-quality product image (PNG, JPG). Recommend 1200x800px.</p>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider" asChild>
                    <label className="cursor-pointer">
                      Select File
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
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Available Sizes (comma separated)</label>
                <input
                  type="text"
                  value={form.sizes.join(", ")}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g. A4, A3, 3.5x2 inch"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Materials (comma separated)</label>
                <input
                  type="text"
                  value={form.materials.join(", ")}
                  onChange={(e) => setForm({ ...form, materials: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g. 300gsm Glossy, Matte, Vinyl"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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
                  price_tiers: [...form.price_tiers, { min: (parseInt(form.price_tiers[form.price_tiers.length - 1].min.toString()) * 10).toString(), price_per_unit: (parseFloat(form.price_tiers[form.price_tiers.length - 1].price_per_unit.toString()) * 0.9).toString() }]
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
              <div className="bg-primary/5 p-4 rounded-xl space-y-2 mt-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> Expert Profitability Advisor
                </div>
                <p className="text-[13px] text-foreground font-medium leading-relaxed">
                  {form.price_tiers.length > 1 ? (
                    `You're offering a ${Math.round((1 - form.price_tiers[form.price_tiers.length - 1].price_per_unit / form.price_tiers[0].price_per_unit) * 100)}% volume discount. High-volume orders increase retention but require tighter margin control.`
                  ) : "Pro Tip: Adding bulk tiers (e.g., 500+, 1000+) typically increases Average Order Value by 18%."}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Describe your product, paper quality, finishes available..."
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all ${!product.is_active ? "opacity-60" : ""
                }`}
            >
              <div className="flex gap-4 mb-3">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-secondary flex-shrink-0 border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-semibold text-foreground">{product.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{product.category}</span>
                    </div>
                    {!product.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                    )}
                  </div>
                </div>
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
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground whitespace-nowrap">
                  {product.price_includes_gst ? "GST Incl." : "GST Excl."}
                </span>
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
