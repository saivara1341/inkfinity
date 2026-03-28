import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Star, Clock, ShoppingCart, MapPin, Store, ChevronRight, SlidersHorizontal, X,
  Instagram, Facebook, Twitter, Phone
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToCart, totalItems } = useCart(user?.id);

  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"products" | "shops">(
    searchParams.get("view") === "shops" ? "shops" : "products"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState<"price_low" | "price_high" | "rating" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);

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
      .select("*")
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
        }))
      );
    }

    setLoading(false);
  }, [selectedCategory, sortBy, shopFilter]);

  // Re-fetch when view/category/sort/shop filter changes
  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, shopFilter, fetchData]);

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
                    {/* Social Icons for Shop */}
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                      {activeShop.services?.filter(s => s.startsWith("social:")).map(s => {
                        const [,, handle] = s.split(":");
                        if (s.includes("instagram")) return <a key={s} href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent transition-colors"><Instagram className="w-3.5 h-3.5" /></a>;
                        if (s.includes("facebook")) return <a key={s} href={`https://facebook.com/${handle}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent transition-colors"><Facebook className="w-3.5 h-3.5" /></a>;
                        if (s.includes("twitter")) return <a key={s} href={`https://twitter.com/${handle}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent transition-colors"><Twitter className="w-3.5 h-3.5" /></a>;
                        if (s.includes("whatsapp")) return <a key={s} href={`https://wa.me/${handle.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent transition-colors"><Phone className="w-3.5 h-3.5" /></a>;
                        return null;
                      })}
                    </div>
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

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, shops, categories..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-card"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setView("products")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === "products" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setView("shops")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === "shops" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Shops
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground bg-secondary"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                {user && (
                  <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-accent text-accent-foreground">
                    <ShoppingCart className="w-4 h-4" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        sortBy === key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

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
                    <div className="aspect-[4/3] bg-secondary rounded-t-xl flex items-center justify-center overflow-hidden">
                      {product.images?.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground text-center p-4">
                          <Store className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p className="text-xs">{product.category}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{product.name}</h3>
                        <span className="text-lg font-display font-bold text-accent whitespace-nowrap">
                          ₹{product.base_price}
                        </span>
                      </div>
                      {(product.shop as any) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Store className="w-3 h-3" />
                          <span>{(product.shop as any).name}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{(product.shop as any).city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Min: {product.min_quantity}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="coral"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add
                        </Button>
                        <ShareControl 
                          title={product.name}
                          text={`Check out this ${product.name} on PrintFlow!`}
                          url={`/customize/${product.id}`}
                          variant="secondary"
                          size="sm"
                          showLabel={false}
                        />
                        <WishlistButton 
                          productId={product.id}
                          variant="secondary"
                          size="sm"
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
      </div>
      <Footer />
    </div>
  );
};

export default Storefront;
