import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Truck, Store, CreditCard, IndianRupee, 
  ChevronRight, Check, Edit2, Plus, Bike, Package,
  Smartphone, Building2
} from "lucide-react";

const Checkout = () => {
  const [step, setStep] = useState<"address" | "delivery" | "payment">("address");
  const [selectedAddress, setSelectedAddress] = useState<string | null>("addr-1");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("shop-pickup");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");

  const savedAddresses = [
    { id: "addr-1", label: "Home", name: "Rahul Sharma", address: "456, Indiranagar, 12th Main Road, Bangalore - 560038", phone: "+91 98765 43210" },
    { id: "addr-2", label: "Office", name: "Rahul Sharma", address: "TechPark, 5th Floor, Whitefield, Bangalore - 560066", phone: "+91 98765 43210" },
  ];

  const deliveryOptions = [
    { id: "shop-pickup", label: "Shop Pickup", description: "Pick up from QuickPrint Studio", price: 0, time: "Ready in 2-3 days", icon: Store },
    { id: "rapido", label: "Rapido Parcel", description: "Fast delivery by bike", price: 49, time: "Same day delivery", icon: Bike },
    { id: "porter", label: "Porter Delivery", description: "For large orders & banners", price: 99, time: "Next day delivery", icon: Truck },
    { id: "local-courier", label: "Local Courier", description: "Standard delivery", price: 59, time: "2-3 days delivery", icon: Package },
  ];

  const paymentOptions = [
    { id: "upi", label: "UPI", description: "GPay, PhonePe, Paytm", icon: Smartphone },
    { id: "card", label: "Credit/Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", description: "All major banks", icon: Building2 },
  ];

  // Mock order data
  const orderItems = [
    { name: "Standard Visiting Cards", quantity: 500, price: 899, options: "3.5×2 in • 300gsm Art Card • Glossy" },
  ];

  const subtotal = orderItems.reduce((acc, item) => acc + item.price, 0);
  const deliveryPrice = deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0;
  const gst = Math.round((subtotal + deliveryPrice) * 0.18);
  const total = subtotal + deliveryPrice;

  const handlePlaceOrder = () => {
    // In real app, integrate Razorpay here
    window.location.href = "/order-success";
  };

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
            {/* Left - Form Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Step */}
              {step === "address" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" /> Delivery Address
                      </h2>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="w-4 h-4" /> Add New
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            selectedAddress === addr.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{addr.name}</span>
                                <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">{addr.label}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{addr.address}</p>
                              <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAddress === addr.id ? "border-accent bg-accent" : "border-border"
                            }`}>
                              {selectedAddress === addr.id && <Check className="w-3 h-3 text-accent-foreground" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <Button 
                      variant="coral" 
                      size="lg" 
                      className="w-full mt-6 gap-2"
                      onClick={() => setStep("delivery")}
                      disabled={!selectedAddress}
                    >
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
                        <button
                          key={option.id}
                          onClick={() => setDeliveryMethod(option.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            deliveryMethod === option.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
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
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {option.price === 0 ? "FREE" : `₹${option.price}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" size="lg" onClick={() => setStep("address")}>
                        Back
                      </Button>
                      <Button 
                        variant="coral" 
                        size="lg" 
                        className="flex-1 gap-2"
                        onClick={() => setStep("payment")}
                      >
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
                        <button
                          key={option.id}
                          onClick={() => setPaymentMethod(option.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === option.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
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

                    {/* UPI Options */}
                    {paymentMethod === "upi" && (
                      <div className="p-4 bg-secondary/50 rounded-lg mb-6">
                        <p className="text-sm text-muted-foreground mb-3">Pay using UPI apps:</p>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                            <p className="text-sm font-medium text-foreground">Google Pay</p>
                          </button>
                          <button className="flex-1 py-3 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                            <p className="text-sm font-medium text-foreground">PhonePe</p>
                          </button>
                          <button className="flex-1 py-3 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                            <p className="text-sm font-medium text-foreground">Paytm</p>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" onClick={() => setStep("delivery")}>
                        Back
                      </Button>
                      <Button 
                        variant="coral" 
                        size="lg" 
                        className="flex-1 gap-2"
                        onClick={handlePlaceOrder}
                      >
                        Pay ₹{total} <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      🔒 Secured by Razorpay • 100% Safe & Secure
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>

                {orderItems.map((item, i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs text-muted-foreground">{item.options}</p>
                    </div>
                    <p className="font-semibold text-foreground">₹{item.price}</p>
                  </div>
                ))}

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">{deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (Included)</span>
                    <span className="text-muted-foreground">₹{gst}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />{total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Address & Delivery */}
                {step !== "address" && selectedAddress && (
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Delivering to</p>
                      <button onClick={() => setStep("address")} className="text-xs text-accent hover:underline">
                        <Edit2 className="w-3 h-3 inline mr-1" />Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {savedAddresses.find(a => a.id === selectedAddress)?.address.slice(0, 40)}...
                    </p>
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
