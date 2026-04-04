import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IndianRupee, Star, Package, ChevronRight, Heart, Share2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardV2Props {
  product: any;
  onViewShops: () => void;
  Icon: any;
}

const ProductCardV2 = ({ product }: ProductCardV2Props) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.origin + `#/customize/${product.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/customize/${product.id}`)}
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <motion.img
          src={product.image || "https://images.unsplash.com/photo-1586075010620-687cd7a3297a?w=800&q=80"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Floating Actions (Visible on Hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
              <button 
                onClick={toggleFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                  isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-slate-600 hover:text-red-500"
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button 
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-[#FF7300] flex items-center justify-center transition-all shadow-sm"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {product.popular && (
            <div className="px-2.5 py-1 bg-[#FF7300] text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
              <Zap className="w-3 h-3 fill-current" /> Bestseller
            </div>
          )}
          <div className="px-2.5 py-1 bg-white/90 text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-black/5 backdrop-blur-sm">
            {product.turnaroundDays}-Day Delivery
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#FF7300] transition-colors truncate">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium capitalize">
              <Package className="w-3.5 h-3.5 text-[#FF7300]" /> {product.categoryName}
            </p>
          </div>
          <div className="flex items-center gap-0.5 bg-slate-50 px-2 py-1 rounded-lg text-xs font-bold text-slate-700">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.9
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Starting from</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-950 flex items-center tracking-tight">
                <IndianRupee className="w-4 h-4" />{product.startingPrice.replace('₹', '')}
              </span>
              <span className="text-xs text-slate-400 font-medium normal-case">/ {product.unit.includes('100') ? '100 pcs' : product.unit.replace('per ', '')}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent group/btn"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center group-hover/btn:bg-[#FF7300] group-hover/btn:text-white transition-all duration-300 shadow-sm border border-slate-100">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardV2;
