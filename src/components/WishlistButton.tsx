import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistButtonProps {
  productId: string;
  variant?: "ghost" | "outline" | "secondary" | "coral";
  size?: "sm" | "md" | "icon";
  showLabel?: boolean;
}

export const WishlistButton = ({ 
  productId, 
  variant = "outline", 
  size = "md",
  showLabel = false 
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  // Load initial state from localStorage for now (MVP approach)
  useEffect(() => {
    if (user) {
      const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
      setIsLiked(wishlist.includes(productId));
    }
  }, [productId, user]);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
    let newWishlist;

    if (isLiked) {
      newWishlist = wishlist.filter((id: string) => id !== productId);
      toast.info("Removed from favorites");
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to favorites! ❤️");
    }

    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newWishlist));
    setIsLiked(!isLiked);
  };

  return (
    <Button
      variant={variant as any}
      size={size === "icon" ? "icon" : "sm"}
      onClick={toggleLike}
      className={`relative group transition-all duration-300 ${
        isLiked ? "text-destructive border-destructive/20 bg-destructive/5" : ""
      } ${size === "md" ? "h-9 px-4" : "h-8 px-2"}`}
    >
      <div className="relative">
        <Heart 
          className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} transition-transform group-hover:scale-110 ${
            isLiked ? "fill-current" : ""
          }`} 
        />
        <AnimatePresence>
          {isLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-destructive rounded-full -z-10"
            />
          )}
        </AnimatePresence>
      </div>
      {showLabel && <span className="ml-2 font-medium">Favorite</span>}
    </Button>
  );
};

export default WishlistButton;
