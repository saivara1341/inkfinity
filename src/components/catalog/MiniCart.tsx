import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MiniCartProps {
  itemCount: number;
  totalAmount: number;
}

const MiniCart = ({ itemCount, totalAmount }: MiniCartProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="bg-accent rounded-3xl p-4 shadow-[0_20px_50px_rgba(30,215,96,0.3)] flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-4 ml-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-widest">
                  {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Added
                </p>
                <div className="flex items-center gap-1 text-white/80">
                  <IndianRupee className="w-3 h-3" />
                  <span className="font-bold text-lg leading-tight">{totalAmount}</span>
                  <span className="text-[10px] uppercase font-black tracking-tighter ml-1">plus taxes</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate("/cart")}
              className="h-14 px-8 rounded-2xl bg-white text-accent font-black uppercase tracking-widest text-xs hover:bg-gray-100 shadow-xl group transition-all"
            >
              View Cart <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;
