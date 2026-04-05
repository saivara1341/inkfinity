import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, IndianRupee, Zap, ShieldCheck, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PerformanceAnalytics } from "@/utils/PerformanceAnalytics";
import { useEffect } from "react";

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, loading, updateQuantity, removeFromCart, totalAmount } = useCart(user?.id);

  useEffect(() => {
    PerformanceAnalytics.trackMount("CartPage");
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  const totals = items.reduce((acc, item) => {
    const base = ((item as any).product?.base_price || 0) * item.quantity;
    const isIncl = (item as any).shop?.price_includes_gst ?? true;
    if (isIncl) {
      acc.subtotal += base;
      acc.gstIncluded += base - (base / 1.12); // Assuming 12% is already inside
    } else {
      acc.subtotal += base;
      acc.gstAdded += base * 0.12; // 12% to be added
    }
    return acc;
  }, { subtotal: 0, gstIncluded: 0, gstAdded: 0 });

  const grandTotal = totals.subtotal + totals.gstAdded;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">My Basket</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                {items.length} Items • Platform Protected Checkout
              </p>
            </div>
            
            {items.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Escrow Active
                </div>
            )}
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7300]"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Preparing your basket...</p>
            </div>
          ) : items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-2xl shadow-black/[0.02]"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Your basket is empty</h3>
              <p className="text-slate-400 font-medium mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your basket yet.</p>
              <Button 
                size="lg"
                className="bg-[#FF7300] hover:bg-[#FF8500] text-white rounded-2xl font-black px-10 h-14 shadow-xl shadow-[#FF7300]/20 gap-2"
                asChild
              >
                <Link to="/store">Explore Marketplace</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                      const product = (item as any).product;
                      const shop = (item as any).shop;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-black/[0.01] hover:border-slate-200 transition-all group"
                        >
                          <div className="flex gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-[#FF7300]/5 transition-colors overflow-hidden">
                                {product?.images?.[0] ? (
                                    <img src={product.images[0]} className="w-full h-full object-cover p-2 mix-blend-multiply" alt="" />
                                ) : (
                                    <Package className="w-10 h-10 text-slate-200" />
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-black text-slate-900 text-lg truncate mb-1">
                                        {product?.name || (item as any).product_name || "Product"}
                                      </h4>
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF7300]">
                                        <Store className="w-3 h-3" /> {shop?.name}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                      disabled={loading}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                              
                                <div className="flex items-end justify-between mt-6">
                                    <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all disabled:opacity-30"
                                        disabled={loading || item.quantity <= (product?.min_quantity || 1)}
                                      >
                                        <Minus className="w-4 h-4 text-slate-900" />
                                      </button>
                                      <input 
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (!isNaN(val)) updateQuantity(item.id, val);
                                        }}
                                        onBlur={(e) => {
                                          const val = parseInt(e.target.value);
                                          const min = product?.min_quantity || 1;
                                          if (isNaN(val) || val < min) updateQuantity(item.id, min);
                                        }}
                                        className="w-12 text-center font-black text-slate-900 text-sm bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                                        disabled={loading}
                                      >
                                        <Plus className="w-4 h-4 text-slate-900" />
                                      </button>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-900">
                                            ₹{((product?.base_price || 0) * item.quantity).toLocaleString("en-IN")}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            ₹{(product?.base_price || 0)} per unit
                                        </div>
                                    </div>
                                </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
                
                <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white overflow-hidden relative group shadow-2xl shadow-slate-900/40">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Truck className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Zap className="w-7 h-7 text-[#FF7300] fill-[#FF7300]" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#FF7300] mb-1">Standard Delivery</p>
                            <h4 className="text-lg font-black leading-tight">Fast 3-4 day processing</h4>
                        </div>
                    </div>
                    <Link to="/store" className="relative z-10 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors">
                        Add More
                    </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4 lg:sticky lg:top-28">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-black/[0.02]">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <Package className="w-6 h-6 text-[#FF7300]" /> Order Summary
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold">Subtotal ({items.length} items)</span>
                          <span className="text-slate-900 font-black">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        
                        {totals.gstIncluded > 0 && (
                          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-3 py-2 rounded-lg">
                            <span>GST (Included)</span>
                            <span>₹{totals.gstIncluded.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                          </div>
                        )}
                        
                        {totals.gstAdded > 0 && (
                          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[#FF7300] bg-[#FF7300]/5 px-3 py-2 rounded-lg">
                            <span>GST (12% Extra)</span>
                            <span>+ ₹{totals.gstAdded.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold">Shipping Charge</span>
                          <span className="text-[#FF7300] font-black italic">To be calc.</span>
                        </div>
                    </div>
                    
                    <div className="h-[1px] bg-slate-100 w-full" />
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Grand Total</p>
                        <h4 className="text-3xl font-black text-slate-900">
                             ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </h4>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-16 mt-10 bg-[#FF7300] hover:bg-[#FF8500] text-white rounded-[1.5rem] text-lg font-black shadow-xl shadow-[#FF7300]/20 gap-3 group/btn"
                    onClick={() => navigate("/checkout")}
                  >
                    Checkout Securely <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 opacity-60">
                         <ShieldCheck className="w-4 h-4 text-green-600" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">100% Buyer Protection</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                         <Store className="w-4 h-4 text-blue-600" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Marketplace Shop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
