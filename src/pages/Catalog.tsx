import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

const categories = [
  { id: "all", label: "All Products" },
  { id: "visiting-cards", label: "Visiting Cards" },
  { id: "flyers", label: "Flyers" },
  { id: "posters", label: "Posters" },
  { id: "banners", label: "Banners" },
  { id: "stickers", label: "Stickers" },
  { id: "id-cards", label: "ID Cards" },
  { id: "custom", label: "Custom Prints" },
];

const products = [
  { id: 1, name: "Standard Visiting Card", category: "visiting-cards", price: "₹1.50", unit: "per card", minQty: 100, icon: "💼", sizes: ["3.5×2 in", "3.2×1.8 in"], papers: ["300gsm Art Card", "350gsm Matte"] },
  { id: 2, name: "Premium Visiting Card", category: "visiting-cards", price: "₹3", unit: "per card", minQty: 50, icon: "💼", sizes: ["3.5×2 in"], papers: ["400gsm Textured", "Metallic"] },
  { id: 3, name: "A5 Flyer", category: "flyers", price: "₹3", unit: "per piece", minQty: 50, icon: "📄", sizes: ["A5", "A6"], papers: ["130gsm Gloss", "170gsm Matte"] },
  { id: 4, name: "A4 Flyer", category: "flyers", price: "₹5", unit: "per piece", minQty: 25, icon: "📄", sizes: ["A4"], papers: ["130gsm Gloss", "170gsm Matte"] },
  { id: 5, name: "A3 Poster", category: "posters", price: "₹49", unit: "each", minQty: 1, icon: "🖼️", sizes: ["A3", "A2"], papers: ["200gsm Gloss", "Canvas"] },
  { id: 6, name: "A1 Poster", category: "posters", price: "₹149", unit: "each", minQty: 1, icon: "🖼️", sizes: ["A1", "A0"], papers: ["200gsm Gloss", "Canvas", "Photo Paper"] },
  { id: 7, name: "Vinyl Banner", category: "banners", price: "₹199", unit: "per sq ft", minQty: 1, icon: "🏳️", sizes: ["3×2 ft", "4×3 ft", "6×3 ft", "Custom"], papers: ["Vinyl", "Flex"] },
  { id: 8, name: "Roll-Up Banner", category: "banners", price: "₹899", unit: "each", minQty: 1, icon: "🏳️", sizes: ["2.5×6 ft", "3×6 ft"], papers: ["PP Synthetic", "Vinyl"] },
  { id: 9, name: "Die-Cut Sticker", category: "stickers", price: "₹2", unit: "per piece", minQty: 50, icon: "🏷️", sizes: ["2×2 in", "3×3 in", "Custom"], papers: ["Vinyl", "Paper"] },
  { id: 10, name: "Sheet Sticker", category: "stickers", price: "₹15", unit: "per sheet", minQty: 10, icon: "🏷️", sizes: ["A4 Sheet"], papers: ["Glossy Vinyl", "Matte"] },
  { id: 11, name: "PVC ID Card", category: "id-cards", price: "₹25", unit: "per card", minQty: 1, icon: "🪪", sizes: ["CR80 Standard"], papers: ["PVC 0.76mm"] },
  { id: 12, name: "Custom Print Job", category: "custom", price: "Quote", unit: "", minQty: 1, icon: "🎨", sizes: ["Custom"], papers: ["Various"] },
];

const Catalog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Print Products</h1>
            <p className="text-muted-foreground text-lg">Browse our full range of professional printing products.</p>
          </motion.div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/catalog/${product.category}`}
                  className="block bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated hover:border-accent/30 transition-all group"
                >
                  <span className="text-3xl mb-3 block">{product.icon}</span>
                  <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-lg font-bold text-foreground">{product.price}</span>
                    {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div>Sizes: {product.sizes.join(", ")}</div>
                    <div>Min qty: {product.minQty}</div>
                  </div>
                  <Button variant="coral" size="sm" className="w-full mt-4">
                    Customize & Order
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
