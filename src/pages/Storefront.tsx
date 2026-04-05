import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Star, Clock, ShoppingCart, MapPin, Store, ChevronRight, SlidersHorizontal, X,
  Instagram, Facebook, Twitter, Phone, Flame
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
      await addToCart(product.id, product.shop_id, product.min_quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
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

          {/* Top Rated Shops Carousel - Swiggy Style */}
          {view === "shops" && searchQuery === "" && selectedCategory === "All" && !shopFilter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-7 h-7 text-[#FF7300] fill-[#FF7300]" />
                  Top Rated Shops
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shops.slice(0, 3).map((shop) => (
                  <motion.div
                    key={`top-${shop.id}`}
                    whileHover={{ y: -8 }}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl h-64 shadow-lg shadow-black/5"
                    onClick={() => navigate(`/shop/${shop.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img 
                      src={`https://images.unsplash.com/photo-1504215680145-505bb1df7017?w=800&q=80`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={shop.name}
                    />
                    <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#FF7300] text-white text-[10px] font-black rounded uppercase">Premium</span>
                        <div className="h-4 w-[1px] bg-white/30" />
                        <span className="text-xs font-bold opacity-90">{shop.city}</span>
                      </div>
                      <h3 className="text-2xl font-black">{shop.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] font-black">
                         {shop.rating || "5.0"} <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                        <span className="text-xs font-medium opacity-80">• {shop.product_count}+ Products</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Premium Search Experience - Swiggy/Diginaat Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-40 mb-12 -mx-4 px-4 py-6 bg-slate-50/80 backdrop-blur-xl border-b border-white/20"
          >
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7300] to-[#FF9D00] rounded-[28px] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden">
                <div className="pl-6 text-slate-400 group-focus-within:text-[#FF7300] transition-colors">
                  <Search className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Design anything? Visiting Cards, Banners, or Custom Prints..."
                  className="w-full pl-4 pr-12 py-5 bg-transparent border-none focus:ring-0 text-slate-900 text-lg font-bold placeholder:text-slate-300 placeholder:font-medium"
                />
                <div className="absolute right-4 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <div className="h-8 w-[1px] bg-slate-100 mx-1" />
                  <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
                    Search
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 px-4 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Suggested:</span>
                {["Visiting Cards", "ID Cards", "Banners", "Stickers"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-xs font-bold text-slate-600 hover:text-[#FF7300] transition-colors whitespace-nowrap"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

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
            <div className="text-center py-20 text-muted-foreground animate-pulse">Loading...</div>
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
                    <Link to={`/product/${product.id}`} className="block aspect-[4/3] bg-secondary rounded-t-xl overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center p-4">
                          <Store className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p className="text-xs">{product.category}</p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <WishlistButton productId={product.id} variant="secondary" size="icon" />
                      </div>
                    </Link>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${product.id}`} className="hover:text-accent transition-colors">
                          <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{product.name}</h3>
                        </Link>
                        <span className="text-lg font-display font-bold text-accent whitespace-nowrap">
                          ₹{product.base_price}
                        </span>
                      </div>

                      {(product.shop as any) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Store className="w-3 h-3" />
                          <span className="truncate">{(product.shop as any).name}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{(product.shop as any).city}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Min: {product.min_quantity} units</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="coral"
                          size="sm"
                          className="flex-1 gap-1 font-bold"
                          onClick={() => navigate(`/customize/${product.category.toLowerCase().replace(/\s+/g, '-') || 'generic'}?productId=${product.id}`)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Customize
                        </Button>
                        <ShareControl
                          title={product.name}
                          text={`Check out this ${product.name} on PrintFlow!`}
                          url={window.location.origin + `/product/${product.id}`}
                          variant="secondary"
                          size="sm"
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
                    className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Store className="w-7 h-7 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-foreground truncate">{shop.name}</h3>
                          {shop.is_verified && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success shrink-0">✓ Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" /> {shop.city}
                          <span>•</span>
                          <Star className="w-3 h-3 text-warning fill-warning" /> {shop.rating || "New"}
                        </div>
                        <SocialIcons shop={shop} className="mt-2" />
                      </div>
                    </div>
                    {shop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{shop.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <ShareControl
                          title={shop.name}
                          text={`Check out this shop on PrintFlow: ${shop.name}`}
                          url={`/store?view=products&shop=${shop.id}`}
                          variant="ghost"
                          size="sm"
                          showLabel={false}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{shop.product_count} products</span>
                      </div>
                      <Link
                        to={`/store?view=products&shop=${shop.id}`}
                        className="text-sm text-accent font-bold flex items-center gap-1 hover:underline group/link"
                      >
                        View Shop <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
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
