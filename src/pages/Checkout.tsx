import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  MapPin, Truck, Store, CreditCard, IndianRupee,
  ChevronRight, Check, Edit2, Plus, Bike, Package,
  Smartphone, Building2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalAmount, clearCart, loading: cartLoading } = useCart(user?.id);
  const [step, setStep] = useState<"address" | "delivery" | "payment">("address");
  const [placing, setPlacing] = useState(false);

  // Address form
  const [addressForm, setAddressForm] = useState({
    name: user?.user_metadata?.full_name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("shop-pickup");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  if (!user) return null;

  const deliveryOptions = [
    { id: "shop-pickup", label: "Shop Pickup", description: "Pick up from the print shop", price: 0, time: "Ready in 2-3 days", icon: Store },
    { id: "rapido", label: "Rapido Parcel", description: "Fast delivery by bike", price: 49, time: "Same day delivery", icon: Bike },
    { id: "porter", label: "Porter Delivery", description: "For large orders & banners", price: 99, time: "Next day delivery", icon: Truck },
    { id: "local-courier", label: "Local Courier", description: "Standard delivery", price: 59, time: "2-3 days delivery", icon: Package },
  ];

  const paymentOptions = [
    { id: "upi", label: "UPI", description: "GPay, PhonePe, Paytm", icon: Smartphone },
    { id: "card", label: "Credit/Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", description: "All major banks", icon: Building2 },
  ];

  const deliveryPrice = deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0;
  const gst = Math.round(totalAmount * 0.18);
  const grandTotal = totalAmount + deliveryPrice + gst;

  const fullAddress = `${addressForm.address}, ${addressForm.city} - ${addressForm.pincode}`;

  const handlePlaceOrder = async () => {
    const designFromCustomize = sessionStorage.getItem("design_file_url");
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacing(true);
    const orderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Create one order per cart item (each may be from a different shop)
    const orderPromises = items.map(async (item) => {
      const product = (item as any).product;
      const unitPrice = product?.base_price || 0;
      const itemTotal = unitPrice * item.quantity;
      const itemGst = Math.round(itemTotal * 0.18);
      const itemDelivery = items.length === 1 ? deliveryPrice : Math.round(deliveryPrice / items.length);
      const itemGrand = itemTotal + itemGst + itemDelivery;

      const itemOrderNumber = items.length > 1
        ? orderNumber + "-" + item.product_id.slice(0, 4).toUpperCase()
        : orderNumber;

      return supabase.from("orders").insert({
        order_number: itemOrderNumber,
        customer_id: user.id,
        shop_id: item.shop_id,
        product_name: product?.name || "Product",
        product_category: product?.category || "Other",
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
        gst_amount: itemGst,
        delivery_charge: itemDelivery,
        grand_total: itemGrand,
        delivery_address: fullAddress,
        specifications: item.specifications || {},
        design_file_url: item.design_file_url || designFromCustomize || null,
        estimated_delivery: estimatedDelivery,
      });
    });

    const results = await Promise.all(orderPromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      toast.error("Failed to place some orders: " + errors[0].error?.message);
      setPlacing(false);
      return;
    }

    // Clear cart after successful order
    await clearCart();

    setPlacing(false);
    toast.success("Order placed successfully! 🎉");
    navigate(`/order-success?order=${orderNumber}`);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading checkout...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products before checking out</p>
            <Button variant="coral" asChild><Link to="/store">Browse Store</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { id: "address", label: "Address" },
              { id: "delivery", label: "Delivery" },
              { id: "payment", label: "Payment" },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step === s.id ? "bg-accent text-accent-foreground" :
                  (step === "delivery" && i === 0) || (step === "payment" && i <= 1)
                    ? "bg-success text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {(step === "delivery" && i === 0) || (step === "payment" && i <= 1)
                    ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  step === s.id ? "text-foreground" : "text-muted-foreground"
                }`}>{s.label}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Address Step */}
              {step === "address" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <MapPin className="w-5 h-5 text-accent" /> Delivery Address
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                          <input value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Phone *</label>
                          <input value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="+91 98765 43210"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Address *</label>
                        <textarea value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})}
                          placeholder="House/Flat No, Building, Street, Landmark..."
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">City *</label>
                          <input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                          <input value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} maxLength={6}
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                    </div>
                    <Button variant="coral" size="lg" className="w-full mt-6 gap-2"
                      onClick={() => setStep("delivery")}
                      disabled={!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.pincode}>
                      Continue to Delivery <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Delivery Step */}
              {step === "delivery" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Truck className="w-5 h-5 text-accent" /> Delivery Method
                    </h2>
                    <div className="space-y-3">
                      {deliveryOptions.map((option) => (
                        <button key={option.id} onClick={() => setDeliveryMethod(option.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            deliveryMethod === option.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                deliveryMethod === option.id ? "bg-accent/20" : "bg-secondary"
                              }`}>
                                <option.icon className={`w-6 h-6 ${deliveryMethod === option.id ? "text-accent" : "text-muted-foreground"}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{option.label}</p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                                <p className="text-xs text-accent mt-1">{option.time}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-foreground">{option.price === 0 ? "FREE" : `₹${option.price}`}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" size="lg" onClick={() => setStep("address")}>Back</Button>
                      <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={() => setStep("payment")}>
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Step */}
              {step === "payment" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <CreditCard className="w-5 h-5 text-accent" /> Payment Method
                    </h2>
                    <div className="space-y-3 mb-6">
                      {paymentOptions.map((option) => (
                        <button key={option.id} onClick={() => setPaymentMethod(option.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === option.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                          }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              paymentMethod === option.id ? "bg-accent/20" : "bg-secondary"
                            }`}>
                              <option.icon className={`w-6 h-6 ${paymentMethod === option.id ? "text-accent" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="p-4 bg-secondary/50 rounded-lg mb-6">
                        <p className="text-sm text-muted-foreground mb-3">Pay using UPI apps:</p>
                        <div className="flex gap-3">
                          {["Google Pay", "PhonePe", "Paytm"].map(app => (
                            <button key={app} className="flex-1 py-3 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                              <p className="text-sm font-medium text-foreground">{app}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" onClick={() => setStep("delivery")}>Back</Button>
                      <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={handlePlaceOrder} disabled={placing}>
                        {placing ? "Placing Order..." : `Pay ₹${grandTotal.toLocaleString("en-IN")}`} <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      🔒 Secured by Razorpay • 100% Safe & Secure
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>
                {items.map((item) => {
                  const product = (item as any).product;
                  return (
                    <div key={item.id} className="flex gap-3 mb-4">
                      <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{product?.name || "Product"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm">₹{((product?.base_price || 0) * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  );
                })}

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">{deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="text-foreground">₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-2xl font-display font-bold text-foreground">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {step !== "address" && (
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Delivering to</p>
                      <button onClick={() => setStep("address")} className="text-xs text-accent hover:underline">
                        <Edit2 className="w-3 h-3 inline mr-1" />Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground">{addressForm.name}</p>
                    <p className="text-xs text-muted-foreground">{fullAddress.slice(0, 60)}...</p>
                  </div>
                )}

                {step === "payment" && (
                  <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Delivery Method</p>
                    <p className="text-sm font-medium text-foreground">
                      {deliveryOptions.find(d => d.id === deliveryMethod)?.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
