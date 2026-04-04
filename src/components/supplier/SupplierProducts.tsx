import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, IndianRupee, Clock, ToggleLeft, ToggleRight, X, ImagePlus, Globe, Factory, Warehouse, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SupplierProduct {
  id: string;
  supplier_id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  moq: number;
  image_url: string | null;
  images: string[];
  specifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  supplier: { id: string; company_name: string } | null;
}

const CATEGORIES = [
  { id: "paper", label: "Paper & Cardstock" },
  { id: "ink", label: "Inks & Toners" },
  { id: "packaging", label: "Packaging Materials" },
  { id: "equipment", label: "Spare Parts" },
  { id: "other", label: "Other Supplies" }
];

const emptyForm = {
  name: "",
  description: "",
  category: "paper",
  base_price: 0,
  moq: 1,
  is_active: true,
  imageFile: null as File | null,
  imagePreview: "",
  specifications: {} as Record<string, any>,
};

export const SupplierProducts = ({ supplier }: Props) => {
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!supplier) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("supplier_products")
      .select("*")
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false });

    if (!error) setProducts((data as SupplierProduct[]) || []);
    setLoading(false);
  }, [supplier]);

  useEffect(() => {
    if (supplier) fetchProducts();
  }, [supplier, fetchProducts]);

  const handleSave = async () => {
    if (!supplier || !form.name || !form.category) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);

    let image_url = form.imagePreview;

    if (form.imageFile) {
      const ext = form.imageFile.name.split(".").pop();
      const filePath = `suppliers/${supplier.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, form.imageFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        image_url = urlData.publicUrl;
      }
    }

    const payload = {
      supplier_id: supplier.id,
      name: form.name,
      description: form.description || null,
      category: form.category,
      base_price: form.base_price,
      moq: form.moq,
      image_url,
      images: [image_url].filter(Boolean) as string[],
      is_active: form.is_active,
      specifications: form.specifications
    };

    if (editingId) {
      const { error } = await supabase.from("supplier_products").update(payload).eq("id", editingId);
      if (error) {
        console.error(error);
        toast.error("Failed to update product");
      } else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("supplier_products").insert(payload);
      if (error) {
        console.error(error);
        toast.error("Failed to add product. Check database schema.");
      } else toast.success("Product added to sourcing catalog!");
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleEdit = (product: SupplierProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      base_price: product.base_price,
      moq: product.moq,
      is_active: product.is_active,
      imageFile: null,
      imagePreview: product.image_url || "",
      specifications: product.specifications || {},
    });
    setShowForm(true);
  };

  const [generatingAI, setGeneratingAI] = useState(false);

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.error("Please enter a material name and category first to generate an accurate image");
      return;
    }

    setGeneratingAI(true);
    toast.loading("AI is designing your material image...", { id: "ai-gen" });

    try {
      const prompt = `A professional, high-quality, studio photography mockup of ${form.name}. ${form.description || ''} The product belongs to the ${form.category} category. Minimalist clean background, centered composition, soft lighting.`;

      const { data, error } = await supabase.functions.invoke('generate-design', {
        body: { prompt, productType: form.category, count: 1 }
      });

      if (error) throw error;

      const generatedImage = data?.images?.[0] || data?.imageUrl;
      if (!generatedImage) throw new Error("No image was generated");

      setForm({ ...form, imagePreview: generatedImage, imageFile: null });
      toast.success("AI generated a material image successfully!", { id: "ai-gen" });
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("supplier_products").delete().eq("id", id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product removed");
    }
  };

  if (!supplier) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground italic flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-coral" />
            Product Catalog
          </h2>
          <p className="text-sm text-muted-foreground">Manage materials visible in the Sourcing Portal</p>
        </div>
        <Button variant="coral" className="gap-2 rounded-xl h-11 shadow-glow" onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}>
          <Plus className="w-5 h-5" /> Add New Material
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-card rounded-[2rem] border border-border p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">{editingId ? 'Update Material' : 'Register New Material'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full"><X className="w-5 h-5" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Material Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" placeholder="e.g. 300GSM Arctic White Paper" />
                </div>
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Base Price (₹) *</label>
                    <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Min Order Qty (MOQ)</label>
                    <input type="number" value={form.moq} onChange={e => setForm({ ...form, moq: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border bg-background" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 block">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Product Showcase Image</label>
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
                </div>
                <div className="border-2 border-dashed border-border rounded-[1.5rem] p-8 text-center hover:border-coral/50 transition-colors relative h-48 flex flex-col items-center justify-center bg-secondary/20">
                  {form.imagePreview ? (
                    <img src={form.imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]" alt="Preview" />
                  ) : (
                    <>
                      <ImagePlus className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">High-quality images increase <br />trust by 40%</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, imageFile: file, imagePreview: URL.createObjectURL(file) });
                  }} />
                </div>
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background h-24 resize-none" placeholder="Detail specifications, coating, and usage guide..." />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="coral" className="flex-1 h-12 rounded-xl font-bold shadow-glow" onClick={handleSave} disabled={saving}>
                {saving ? "Publishing..." : editingId ? "Save Changes" : "Register Product"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <motion.div key={product.id} className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-video bg-secondary relative">
              {product.image_url ? (
                <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
              ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground opacity-20" /></div>}
              <div className="absolute top-4 right-4">
                <Badge variant={product.is_active ? "secondary" : "outline"} className={product.is_active ? "bg-green-500 text-white" : ""}>
                  {product.is_active ? "LIVE" : "DRAFT"}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-xl line-clamp-1">{product.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 font-bold text-coral text-lg"><IndianRupee className="w-4 h-4" />{product.base_price}</span>
                <span className="text-muted-foreground font-medium">MOQ: {product.moq}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => handleEdit(product)}><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
                <Button variant="outline" className="aspect-square rounded-xl h-11 p-0 text-destructive" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
