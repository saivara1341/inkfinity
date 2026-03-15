import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Search, ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal, 
  Sticker, IdCard, Paintbrush, BookOpen, Smartphone, Heart, Mail, Package, 
  Award, Shirt, BookText, Star, ChevronRight, IndianRupee, Clock, Filter
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { productCategories, getAllSubcategories, type ProductCategory } from "@/data/printingProducts";

const iconMap: Record<string, LucideIcon> = {
  ContactRound, FileText, GalleryVerticalEnd, RectangleHorizontal,
  Sticker, IdCard, Paintbrush, BookOpen, Smartphone, Heart, Mail,
  Package, Award, Shirt, BookText,
};

const Catalog = () => {
  const { category } = useParams();
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allProducts = getAllSubcategories();

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
                );
              })()}
            </motion.div>
          )}

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {search && ` for "${search}"`}
          </p>

          {/* Product Grid */}
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
                    <Link
                      to={`/customize/${product.id}`}
                      className="block bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group h-full"
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
                        Customize & Order <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

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
