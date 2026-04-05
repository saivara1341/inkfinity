import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MapPin, Clock, Info, Search, ChevronRight, 
  ArrowLeft, Share2, Flame, ShieldCheck, Zap, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { calculateShopScore } from "@/utils/algorithms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCardV2 from "@/components/catalog/ProductCardV2";

const ShopMenu = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      
      // Fetch Shop Info
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .single();
      
      if (shopData) setShop(shopData);

      // Fetch Shop Products
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .eq("is_active", true);
      
      if (productData) setProducts(productData);
      setLoading(false);
    };

    if (shopId) fetchShopData();
  }, [shopId]);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Menu...</div>;
  if (!shop) return <div className="min-h-screen flex items-center justify-center">Shop not found.</div>;

  const pieScore = calculateShopScore(shop);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Shop Header Swiggy Style */}
      <div className="pt-24 pb-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold">Back to discovery</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
                <img 
                  src={`https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80`} 
                  className="w-full h-full object-cover"
                  alt={shop.name}
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                   {shop.is_verified && (
                     <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1 text-[10px] py-0 px-2 uppercase font-black">
                       <ShieldCheck className="w-3 h-3" /> Verified Partner
                     </Badge>
                   )}
                   {pieScore > 0.8 && (
                     <Badge className="bg-[#FF7300] hover:bg-[#FF7300] text-white gap-1 text-[10px] py-0 px-2 uppercase font-black">
                       <Zap className="w-3 h-3 fill-current" /> Top Rated
                     </Badge>
                   )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">{shop.name}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {shop.city} • Open until 8 PM
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-slate-900 font-black text-xl">
                  {shop.rating || "5.0"} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rating</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center min-w-[100px]">
                <div className="text-slate-900 font-black text-xl">
                  35-45
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mins Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Navigation & Search */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-black whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ProductCardV2 
                  product={{
                    ...product,
                    pieScore: pieScore,
                    city: shop.city,
                    categoryName: product.category
                  }} 
                  onViewShops={() => {}} // Not needed in shop-specific menu
                  Icon={Package}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No items found</h3>
            <p className="text-slate-500">Try searching for something else in the menu.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShopMenu;
