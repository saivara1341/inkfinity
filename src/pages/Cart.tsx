import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, loading, updateQuantity, removeFromCart, totalAmount } = useCart(user?.id);

  if (!user) {
    navigate("/login");
    return null;
  }

  const gst = totalAmount * 0.18;
  const grandTotal = totalAmount + gst;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Your Cart</h1>
            <p className="text-muted-foreground mb-8">{items.length} items in your cart</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">Loading cart...</div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Cart is empty</h3>
              <p className="text-muted-foreground mb-6">Browse our store to find the perfect printing products</p>
              <Button variant="coral" asChild>
                <Link to="/store">Browse Store</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = (item as any).product;
                  const shop = (item as any).shop;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card rounded-xl border border-border p-5 shadow-card"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Store className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-foreground truncate">
                            {product?.name || (item as any).product_name || "Product"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shop?.name} • {product?.category || (item as any).category_name || "Custom Printing"}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg border border-input flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                                disabled={loading || item.quantity <= (product?.min_quantity || 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 text-center font-medium text-foreground">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-input flex items-center justify-center hover:bg-secondary"
                                disabled={loading}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-display font-bold text-foreground">
                                ₹{((product?.base_price || 0) * item.quantity).toLocaleString("en-IN")}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg"
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-24">
                  <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="text-foreground">₹{gst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-foreground">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <Button variant="coral" size="lg" className="w-full mt-6 gap-2" asChild>
                    <Link to="/checkout">
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full mt-3" asChild>
                    <Link to="/store">Continue Shopping</Link>
                  </Button>
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
