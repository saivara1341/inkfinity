import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Search, Package, Star, ChevronRight, IndianRupee, MapPin, Zap, 
  Store, ShieldCheck, ArrowRight, Sparkles, ShoppingBag
} from "lucide-react";
import { productCategories, getAllSubcategories } from "@/data/printingProducts";
import { useLocation } from "@/contexts/LocationContext";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import ProductCardV2 from "@/components/catalog/ProductCardV2";
import MiniCart from "@/components/catalog/MiniCart";
import { QuickOrderBot } from "@/components/QuickOrderBot";
import * as LucideIcons from "lucide-react";

const Catalog = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [search, setSearch] = useState("");
  const { city, loading: isLoadingLocation } = useLocation();
  const { user } = useAuth();
  const { items: cartItems, totalAmount } = useCart(user?.id);

  const { data: allProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["catalog-products", activeCategory, search],
    queryFn: async () => {
      let dbProducts = [];
      
      if (search.length >= 2) {
        const { data, error } = await supabase.rpc("search_products", {
          query: search,
          category_filter: activeCategory === "all" ? null : activeCategory
        });
        if (error) throw error;
        dbProducts = data || [];
      } else {
        const query = supabase.from("products").select("*").eq("is_active", true);
        if (activeCategory !== "all") query.eq("category", activeCategory);
        const { data, error } = await query;
        if (error) throw error;
        dbProducts = data || [];
      }
      
      const mappedDb = dbProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categoryId: (p as any).category_id || p.category,
        categoryName: p.category,
        startingPrice: "₹" + p.base_price,
        unit: (p as any).unit || "per unit",
        sizes: (p.specifications as any)?.sizes || [],
        papers: (p.specifications as any)?.papers || [],
        minQty: p.min_quantity,
        popular: (p as any).popular,
        image: (p as any).image_url
      }));

      const staticProducts = getAllSubcategories();
      const filteredStatic = staticProducts.filter(p => {
        const matchCat = activeCategory === "all" || p.categoryId === activeCategory;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      });

      return [...mappedDb, ...filteredStatic.filter(sp => !mappedDb.find(dp => dp.name === sp.name))];
    }
  });

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Package;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={activeCategory === "all" ? "What will you design today?" : `${productCategories.find(c => c.id === activeCategory)?.name} | Print Shop`}
        description="Premium online printing services with Canva-inspired designs. Business cards, flyers, posters and more."
      />
      <Navbar />
      
      {/* Search & Hero Section (Canva Style) */}
      <section className="pt-28 pb-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-[#FF7300]/10 text-[#FF7300] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-[#FF7300]/20">
                <MapPin className="w-3 h-3" /> {city || (isLoadingLocation ? "Detecting location..." : "Your Region")}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 mb-8 tracking-tight">
              What will you <span className="text-[#FF7300]">print</span> today?
            </h1>
            
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF7300] transition-colors" />
              <input
                type="text"
                placeholder="Search business cards, flyers, posters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-24 py-5 rounded-2xl bg-white border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-[#FF7300]/20 focus:border-[#FF7300] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button className="bg-[#FF7300] hover:bg-[#E65100] px-6 rounded-xl h-11 text-sm font-bold shadow-md shadow-[#FF7300]/20">
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 overflow-x-auto pb-4 hide-scrollbar">
            {[{ id: "all", name: "For you", icon: "Sparkles" }, ...productCategories].slice(0, showAllCategories ? undefined : 8).map((cat, idx) => {
              const Icon = (LucideIcons as any)[cat.icon] || Package;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-3 transition-all ${activeCategory === cat.id ? "text-[#FF7300]" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${activeCategory === cat.id ? "bg-[#FF7300] text-white border-transparent scale-110" : "bg-white border-slate-100 group-hover:border-slate-200"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap">{cat.name}</span>
                </motion.button>
              );
            })}
            
            {/* View All Button */}
            {!showAllCategories && productCategories.length > 7 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowAllCategories(true)}
                className="flex flex-col items-center gap-3 transition-all text-slate-500 hover:text-slate-900"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border bg-white border-slate-100 group-hover:border-slate-200 hover:bg-slate-50">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold whitespace-nowrap">View All</span>
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-slate-100 pb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeCategory === "all" ? "Recommended for you" : productCategories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Found {allProducts.length} premium print products
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button 
                variant="outline" 
                className="rounded-full border-slate-200 text-slate-600 font-bold text-xs h-10 px-5 gap-2"
                onClick={() => { setActiveCategory("all"); setSearch(""); }}
              >
                Clear all
              </Button>
              <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                Region: {city || "India"}
              </p>
            </div>
          </div>

          {/* Product Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {allProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCardV2 
                      product={product} 
                      onViewShops={() => {}} 
                      Icon={Package} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {allProducts.length === 0 && !loadingProducts && (
            <div className="text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <ShoppingBag className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                We couldn't find any products matching "{search}". Try searching for something else or browse our categories.
              </p>
              <Button 
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="bg-slate-900 text-white rounded-xl px-8"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Quick Order Banner */}
      <section className="bg-[#FF7300] py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Don't have time to browse?</h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto font-medium">
            Let our AI assistant help you place an order in seconds. Just chat and we'll handle the rest.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[#FF7300] hover:bg-slate-50 px-10 rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-black/20 gap-3"
            onClick={() => document.getElementById('quick-order-trigger')?.click()}
          >
            Start Quick Order <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <MiniCart itemCount={cartItems.length} totalAmount={totalAmount} />
      <QuickOrderBot />
      <Footer />
    </div>
  );
};

export default Catalog;
