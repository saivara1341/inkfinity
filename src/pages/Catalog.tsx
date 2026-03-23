import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Search, ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal, 
  Sticker, IdCard, Paintbrush, BookOpen, Smartphone, Heart, Mail, Package, 
  Award, Shirt, BookText, Star, ChevronRight, IndianRupee, Clock, Filter, MapPin, Zap, ThumbsUp
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { productCategories, getAllSubcategories, type ProductCategory } from "@/data/printingProducts";
import { useShopSelection, type ShopProvider } from "@/hooks/useShopSelection";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, LucideIcon> = {
  ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal,
  Sticker, IdCard, Paintbrush, BookOpen, Smartphone, Heart, Mail,
  Package, Award, Shirt, BookText,
}

const Catalog = () => {
  const { category } = useParams();
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"products" | "shops">("products");

  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const { shops, loading: shopsLoading } = useShopSelection(activeCategory);

  const { data: allProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["catalog-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      
      const dbProducts = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categoryId: (p as any).category_id || p.category,
        categoryName: p.category,
        startingPrice: "₹" + p.base_price,
        unit: (p as any).unit || "per unit",
        sizes: (p.specifications as any)?.sizes || [],
        papers: (p.specifications as any)?.papers || [],
        turnaroundDays: p.turnaround_days,
        minQty: p.min_quantity,
        popular: (p as any).popular
      }));

      const staticProducts = getAllSubcategories();
      return [...dbProducts, ...staticProducts.filter(sp => !dbProducts.find(dp => dp.name === sp.name))];
    }
  });



  const filtered = allProducts.filter((p) => {
    const matchCat = activeCategory === "all" || p.categoryId === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.description.toLowerCase().includes(search.toLowerCase()) ||
                        p.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCount = activeCategory === "all" ? allProducts.length : filtered.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Print Products
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse our complete range of {allProducts.length}+ professional printing products across {productCategories.length} categories. 
              From visiting cards to flex banners — all available at competitive Indian market prices.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search visiting cards, flyers, banners, stickers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 sm:hidden"
            >
              <Filter className="w-4 h-4" /> Categories
            </Button>
          </div>

          {/* Category Pills */}
          <div className={`flex-wrap gap-2 mb-8 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Products ({allProducts.length})
            </button>
            {productCategories.map((cat) => {
              const count = allProducts.filter(p => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Banner (when specific category selected) */}
          {activeCategory !== "all" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 mb-8 shadow-card"
            >
              {(() => {
                const cat = productCategories.find(c => c.id === activeCategory);
                if (!cat) return null;
                const Icon = iconMap[cat.icon] || Paintbrush;
                return (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">{cat.name}</h2>
                        <p className="text-muted-foreground mt-1">{cat.description}</p>
                        <p className="text-sm text-accent mt-2 font-medium">{filtered.length} products available</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-secondary/50 p-1 rounded-lg self-start md:self-center">
                      <button 
                        onClick={() => setViewMode("products")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "products" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Products
                      </button>
                      <button 
                        onClick={() => setViewMode("shops")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "shops" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Shop Owners
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {search && ` for "${search}"`}
          </p>

          {/* Main Grid: Products or Shops */}
          {viewMode === "products" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => {
                  const Icon = iconMap[productCategories.find(c => c.id === product.categoryId)?.icon || ""] || Paintbrush;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.02 }}
                      layout
                    >
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveCategory(product.categoryId);
                          setSelectedProductSlug(product.id);
                          setViewMode("shops");
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="block bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group h-full cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Icon className="w-6 h-6 text-accent" />
                          </div>
                          {product.popular && (
                            <span className="flex items-center gap-1 text-xs font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3" /> Popular
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-accent font-medium mb-1">{product.categoryName}</p>
                        <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-lg font-bold text-foreground">{product.startingPrice}</span>
                          {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                        </div>

                        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground/70">Sizes:</span> 
                            {product.sizes.length} options
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground/70">Papers:</span> 
                            {product.papers.length} types
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> 
                            {product.turnaroundDays} business days
                          </div>
                          <div>Min qty: {product.minQty}</div>
                        </div>

                        <Button variant="coral" size="sm" className="w-full gap-1">
                          View Shops <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === "shops" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Paintbrush className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedProductSlug ? (
                          <>Shops offering <span className="text-accent font-bold">{allProducts.find(p => p.id === selectedProductSlug)?.name}</span></>
                        ) : (
                          <>Printing Shops for {productCategories.find(c => c.id === activeCategory)?.name || "All Categories"}</>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Select a shop to customize your order</p>
                    </div>
                  </div>
                  {selectedProductSlug && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProductSlug(null)} className="text-xs h-8">
                      View All Products
                    </Button>
                  )}
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                {shops.map((shop, i) => {
                  const ShopIcon = shop.icon === "zap" ? Zap : shop.icon === "rupee" ? IndianRupee : ThumbsUp;
                  return (
                    <motion.div
                      key={shop.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/customize/${selectedProductSlug || activeCategory}?shopId=${shop.id}`}
                        className="block bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group relative overflow-hidden"
                      >
                        {shop.badges.includes("Highly Rated") && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-accent text-accent-foreground text-[8px] font-bold uppercase tracking-wider px-6 py-1 rotate-45 translate-x-3 -translate-y-1 shadow-sm">
                              Highly Rated
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                            <ShopIcon className="w-7 h-7 text-accent" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">{shop.name}</h3>
                              <span className="flex items-center gap-0.5 text-xs text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                <Star className="w-3 h-3 fill-current" /> {shop.rating}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" /> {shop.distance} from you
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-y border-border mb-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Starting From</p>
                            <p className="text-xl font-display font-bold text-foreground flex items-center gap-0.5">
                              <IndianRupee className="w-4 h-4" />{shop.baseCost}
                              <span className="text-[10px] text-muted-foreground font-normal ml-1">/ unit</span>
                            </p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fastest Delivery</p>
                             <p className="text-sm font-medium text-foreground flex items-center gap-1.5 justify-end">
                               <Clock className="w-3.5 h-3.5 text-accent" /> 2 Days
                             </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {shop.badges.map(badge => (
                            <span key={badge} className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-secondary/50 text-muted-foreground font-medium">
                              {badge}
                            </span>
                          ))}
                        </div>

                        <Button variant="coral" size="sm" className="w-full gap-1">
                          Select Shop <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
