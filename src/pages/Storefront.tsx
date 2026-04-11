import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Star, Clock, ShoppingCart, MapPin, Store, ChevronRight, SlidersHorizontal, X,
  Instagram, Facebook, Twitter, Phone, Flame, ArrowRight, CheckCircle2, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareControl from "@/components/ShareControl";
import WishlistButton from "@/components/WishlistButton";
import { PerformanceAnalytics } from "@/utils/PerformanceAnalytics";

const SocialIcons = ({ shop, className = "" }: { shop: any, className?: string }) => {
  if (!shop) return null;

  const links = [];

  // New explicit columns
  if (shop.instagram_url) links.push({ type: 'instagram', url: shop.instagram_url });
  if (shop.facebook_url) links.push({ type: 'facebook', url: shop.facebook_url });
  if (shop.twitter_url) links.push({ type: 'twitter', url: shop.twitter_url });
  if (shop.whatsapp_number) links.push({ type: 'whatsapp', url: `https://wa.me/${shop.whatsapp_number.replace(/\D/g, '')}` });

  // Legacy services array fallback
  if (shop.services && links.length === 0) {
    const socialServices = shop.services.filter((s: string) => s.startsWith("social:"));
    socialServices.forEach((s: string) => {
      const parts = s.split(":");
      const handle = parts.slice(2).join(":"); // Handle URLs with colons
      if (!handle) return;

      if (s.includes("instagram")) links.push({ type: 'instagram', url: handle.startsWith('http') ? handle : `https://instagram.com/${handle}` });
      else if (s.includes("facebook")) links.push({ type: 'facebook', url: handle.startsWith('http') ? handle : `https://facebook.com/${handle}` });
      else if (s.includes("twitter")) links.push({ type: 'twitter', url: handle.startsWith('http') ? handle : `https://twitter.com/${handle}` });
      else if (s.includes("whatsapp")) links.push({ type: 'whatsapp', url: `https://wa.me/${handle.replace(/\D/g, '')}` });
    });
  }

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link, i) => {
        const Icon = link.type === 'instagram' ? Instagram :
          link.type === 'facebook' ? Facebook :
            link.type === 'twitter' ? Twitter : Phone;
        return (
          <a
            key={`${link.type}-${i}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
          </a>
        );
      })}
    </div>
  );
};

interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  min_quantity: number;
  images: string[];
  is_active: boolean;
  shop?: { id: string; name: string; city: string; rating: number; is_verified: boolean };
}

interface ShopWithProducts {
  id: string;
  name: string;
  city: string;
  rating: number;
  is_verified: boolean;
  description: string | null;
  services: string[];
  product_count: number;
}

const CATEGORIES = [
  "All", "Visiting Cards", "Flyers", "Brochures", "Banners", "Stickers",
  "Letterheads", "Envelopes", "Posters", "Packaging", "Labels"
];

const Storefront = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToCart, totalItems } = useCart(user?.id);

  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"products" | "shops">(
    searchParams.get("view") === "shops" ? "shops" : "shops" // Defaulting to shops for market fit
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState<"price_low" | "price_high" | "rating" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    PerformanceAnalytics.trackMount("Storefront");
  }, []);

  const shopFilter = searchParams.get("shop");

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch products with shop info
    let productQuery = supabase
      .from("products")
      .select("*, shop:shops(id, name, city, rating, is_verified)")
      .eq("is_active", true);

    if (shopFilter) {
      productQuery = productQuery.eq("shop_id", shopFilter);
    }

    if (selectedCategory !== "All") {
      productQuery = productQuery.eq("category", selectedCategory);
    }

    if (sortBy === "price_low") productQuery = productQuery.order("base_price", { ascending: true });
    else if (sortBy === "price_high") productQuery = productQuery.order("base_price", { ascending: false });
    else productQuery = productQuery.order("created_at", { ascending: false });

    const { data: productData } = await productQuery;
    setProducts((productData as unknown as Product[]) || []);

    // Fetch shops
    const { data: shopData } = await supabase
      .from("shops")
      .select("*, instagram_url, facebook_url, twitter_url, whatsapp_number")
      .eq("is_active", true)
      .order("rating", { ascending: false });

    if (shopData) {
      const { data: productCounts } = await supabase
        .from("products")
        .select("shop_id")
        .eq("is_active", true);

      const countMap: Record<string, number> = {};
      (productCounts || []).forEach((p: { shop_id: string }) => {
        countMap[p.shop_id] = (countMap[p.shop_id] || 0) + 1;
      });

      setShops(
        shopData.map((s: any) => ({
          ...s,
          product_count: countMap[s.id] || 0,
          estimated_delivery: "3-4 Days", // Dynamic fallback
          min_order: "₹99"
        }))
      );
    }

    setLoading(false);
  }, [selectedCategory, sortBy, shopFilter]);

  const fetchRecentlyViewed = useCallback(async () => {
    const storedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    if (storedIds.length === 0) return;

    const { data } = await supabase
      .from("products")
      .select("*, shop:shops(id, name, city, rating, is_verified)")
      .in("id", storedIds)
      .eq("is_active", true);

    if (data) {
      // Maintain the order of IDs from localStorage
      const sorted = storedIds
        .map((id: string) => data.find((p) => p.id === id))
        .filter(Boolean) as unknown as Product[];
      setRecentlyViewed(sorted);
    }
  }, []);

  // Re-fetch when view/category/sort/shop filter changes
  useEffect(() => {
    fetchData();
    if (view === "products") fetchRecentlyViewed();
  }, [selectedCategory, sortBy, shopFilter, fetchData, fetchRecentlyViewed, view]);

  // Sync view from URL
  useEffect(() => {
    const urlView = searchParams.get("view");
    if (urlView === "shops") setView("shops");
    else if (urlView === "products") setView("products");
  }, [searchParams]);

  const filteredProducts = products.filter((p) =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.shop as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = shops.filter((s) =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }
    try {
      await addToCart({
        productId: product.id,
        shopId: product.shop_id,
        quantity: product.min_quantity,
        productName: product.name,
        categoryName: (product as any).category
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      console.error("Cart error:", error);
      if (error.message === "SHOP_MISMATCH") {
        toast.error("You have items from another shop. Please clear your cart first.");
      } else {
        toast.error("Failed to add to cart");
      }
    }
  };

  // Get the shop name if filtering by shop
  const activeShop = shopFilter ? shops.find((s) => s.id === shopFilter) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Shop banner if filtering */}
          {activeShop && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 bg-card rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Store className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{activeShop.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {activeShop.city}
                    {activeShop.is_verified && <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success">✓ Verified</span>}
                    <SocialIcons shop={activeShop} className="ml-2 pl-2 border-l border-border" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareControl
                  title={`${activeShop.name} on PrintFlow`}
                  text={`Check out this amazing print shop: ${activeShop.name}!`}
                  url={`/store?view=products&shop=${activeShop.id}`}
                  variant="ghost"
                  size="sm"
                />
                <Button variant="outline" size="sm" onClick={() => { searchParams.delete("shop"); setSearchParams(searchParams); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Clear Filter
                </Button>
              </div>
            </motion.div>
          )}

          {/* Premium Hero & Search Section */}
          <div className="relative mb-20">
            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative text-center space-y-8 pt-12 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-3.5 h-3.5 fill-accent" /> Trending: Digital Business Cards
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-foreground tracking-tight italic">
                  Print the <span className="text-accent">Future.</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                  India's premium marketplace for high-performance printing services and machinery.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative max-w-3xl mx-auto group z-50"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition-opacity duration-500" />
                <div className="relative flex items-center bg-card rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden backdrop-blur-3xl">
                  <div className="pl-6 text-muted-foreground group-focus-within:text-accent transition-colors">
                    <Search className="w-6 h-6 stroke-[2.5px]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for premium shops, products, or materials..."
                    className="w-full pl-4 pr-12 py-6 bg-transparent border-none focus:ring-0 text-foreground text-xl font-bold placeholder:text-muted-foreground/30"
                  />
                  <div className="absolute right-4 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <Button variant="coral" size="lg" className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-accent/20">
                      Search
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-6 overflow-x-auto no-scrollbar py-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap opacity-60">HOT PICKS:</span>
                  {["Visiting Cards", "ID Cards", "T-Shirts", "Signage"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors whitespace-nowrap bg-secondary/50 px-3 py-1 rounded-full border border-border/50 hover:border-accent/30"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            {/* View Toggle (Traditional Swiggy Filter Style) */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setView("shops")}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${view === "shops"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
              >
                Nearby Shops
              </button>
              <button
                onClick={() => setView("products")}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${view === "products"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
              >
                Quick Items
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${showFilters
                  ? "bg-slate-100 border-slate-200 text-slate-900"
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              {user && (
                <Link to="/cart" className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm transition-all">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#FF7300] text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-50 shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                {([
                  ["newest", "Newest"],
                  ["price_low", "Price: Low to High"],
                  ["price_high", "Price: High to Low"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${sortBy === key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recently Viewed - Horizontal Scroll */}
          {!loading && view === "products" && recentlyViewed.length > 0 && !searchQuery && selectedCategory === "All" && !shopFilter && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> Recently Viewed
                </h2>
                <button
                  onClick={() => { localStorage.removeItem("recentlyViewed"); setRecentlyViewed([]); }}
                  className="text-xs font-bold text-muted-foreground hover:text-destructive uppercase tracking-wider"
                >
                  Clear History
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
                {recentlyViewed.map((product) => (
                  <motion.div
                    key={`recent-${product.id}`}
                    whileHover={{ y: -5 }}
                    className="min-w-[180px] sm:min-w-[220px] bg-card rounded-xl border border-border overflow-hidden snap-start shadow-sm"
                  >
                    <Link to={`/product/${product.id}`} className="block relative">
                      <div className="aspect-[4/3] bg-secondary">
                        <img src={product.images?.[0] || "https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=400"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold truncate mb-1">{product.name}</h4>
                        <p className="text-accent font-bold text-sm">₹{product.base_price}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
               {Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="p-4 space-y-3">
                       <Skeleton className="h-4 w-3/4" />
                       <Skeleton className="h-3 w-1/2" />
                       <div className="flex gap-2 pt-2">
                          <Skeleton className="h-9 flex-1 rounded-lg" />
                          <Skeleton className="h-9 w-9 rounded-lg" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : view === "products" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground">No products found. Try a different search or category.</p>
                </div>
              ) : (
                filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all group"
                  >
                    <Link to={`/product/${product.id}`} className="block aspect-[4/3] bg-secondary/30 rounded-t-3xl overflow-hidden relative group-hover:shadow-inner transition-all">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-secondary/10">
                          <Package className="w-12 h-12 stroke-[1.5px]" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay for Text Visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <WishlistButton productId={product.id} variant="secondary" size="icon" className="rounded-2xl backdrop-blur-md bg-white/10 border-white/20" />
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                         <p className="text-white text-[10px] font-black uppercase tracking-widest bg-accent px-2 py-1 rounded inline-block mb-1">BESTSELLER</p>
                      </div>
                    </Link>
// ... (rest of search/replace)

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/product/${product.id}`} className="group/title">
                          <h3 className="font-display font-bold text-foreground text-base line-clamp-2 leading-tight group-hover/title:text-accent transition-colors italic">{product.name}</h3>
                        </Link>
                        <div className="text-right">
                          <span className="text-xl font-display font-black text-accent block">
                            ₹{product.base_price}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Starting at</span>
                        </div>
                      </div>

                      {(product.shop as any) && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 bg-secondary/30 p-2 rounded-xl border border-border/50">
                          <Store className="w-3.5 h-3.5 text-accent" />
                          <span className="truncate">{(product.shop as any).name}</span>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{(product.shop as any).city}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" /> 24hr Dispatch
                         </div>
                         <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            Min: {product.min_quantity} units
                         </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="coral"
                          className="flex-1 h-11 rounded-2xl gap-2 font-bold shadow-lg shadow-accent/10 hover-lift"
                          onClick={() => navigate(`/customize/${product.category.toLowerCase().replace(/\s+/g, '-') || 'generic'}?productId=${product.id}`)}
                        >
                          <ShoppingCart className="w-4 h-4" /> Personalize
                        </Button>
                        <ShareControl
                          title={product.name}
                          text={`Check out this ${product.name} on PrintFlow!`}
                          url={window.location.origin + `/product/${product.id}`}
                          variant="secondary"
                          size="icon"
                          className="w-11 h-11 rounded-2xl bg-secondary/50 border-border/50 hover:bg-secondary"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            /* Shops View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredShops.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground">No shops found.</p>
                </div>
              ) : (
                filteredShops.map((shop, i) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-card rounded-[2.5rem] border border-border p-6 shadow-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* Decorative Background Accent */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
                    
                    <div className="flex items-start gap-5 mb-5 relative z-10">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center shrink-0 border border-accent/10 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                        <Store className="w-8 h-8 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-bold text-xl text-foreground truncate italic">{shop.name}</h3>
                          {shop.is_verified && (
                            <div className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full scale-75 shadow-sm">
                               <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground/60">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {shop.city}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1 bg-success/10 text-success px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-current" /> {shop.rating || "5.0"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {shop.description && (
                         <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">{shop.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {shop.services?.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground/80">
                            {s.replace('social:', '')}
                          </span>
                        ))}
                      </div>

                      <div className="pt-5 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SocialIcons shop={shop} />
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">{shop.product_count} SKUs</span>
                        </div>
                        <Link
                          to={`/store?view=products&shop=${shop.id}`}
                          className="h-10 px-5 bg-foreground text-background rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all hover:bg-accent hover:text-white"
                        >
                          OPEN SHOP <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div >
      <Footer />
    </div >
  );
};

export default Storefront;
