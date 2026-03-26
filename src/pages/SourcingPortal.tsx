import { useState, useEffect } from "react";
import { 
  Search, Filter, ShoppingCart, ChevronRight, 
  Package, Star, Tag, Truck, Factory, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SourcingPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSupplierProducts();
  }, [selectedCategory]);

  const fetchSupplierProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("supplier_products")
        .select(`
          *,
          suppliers (
            company_name,
            business_name,
            supplier_type,
            verified
          )
        `);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching supplier products:", error);
      toast.error("Failed to load sourcing catalog");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Materials" },
    { id: "paper", label: "Paper & Cardstock" },
    { id: "ink", label: "Inks & Toners" },
    { id: "packaging", label: "Packaging" },
    { id: "equipment", label: "Spare Parts" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/shop")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground">B2B Sourcing Portal</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <Package className="w-4 h-4" />
            Stock Inventory
          </Button>
          <Button variant="coral" size="sm" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Wholesale Cart (0)
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Manufacturer Ad Placement (B2B Ad System) */}
        <section className="relative h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-accent to-accent-foreground group cursor-pointer shadow-xl">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="relative h-full flex flex-col justify-center px-12 space-y-2">
            <Badge variant="outline" className="w-fit bg-white/20 text-white border-white/30 backdrop-blur-md">Featured Manufacturer</Badge>
            <h2 className="text-3xl font-display font-bold text-white max-w-lg">Premium 300GSM Arctic White - Now 15% Off for Bulk</h2>
            <p className="text-white/80 text-sm">Direct from Global Paper Mills. 2-day regional delivery.</p>
            <Button variant="secondary" className="w-fit mt-4">Check Stock</Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
             <Factory className="w-full h-full p-4" />
          </div>
        </section>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search materials (e.g. Glossy paper, Cyan ink)..." 
              className="pl-10 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-card text-muted-foreground border border-border hover:border-accent/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <Package className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
             <h3 className="text-xl font-bold text-foreground">No materials found</h3>
             <p className="text-muted-foreground">Select a category or try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/50 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">MOQ: {product.moq}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      {product.suppliers?.supplier_type === 'manufacturer' ? <Factory className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      <span className="truncate">{product.suppliers?.company_name || product.suppliers?.business_name}</span>
                      {product.suppliers?.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"><Star className="w-2 h-2 text-white fill-white" /></div>}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-lg font-bold text-foreground">₹{product.base_price}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">/ Unit</span>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors rounded-xl">
                      View Bulk Tiers
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SourcingPortal;
