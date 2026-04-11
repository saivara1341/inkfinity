import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  MapPin, Truck, Store, CreditCard, IndianRupee,
  ChevronRight, ChevronDown, Check, Edit2, Plus, Bike, Package,
  Smartphone, Building2, Star, Zap, ThumbsUp, Crown, AlertTriangle,
  Info, Copy, ExternalLink, QrCode, X, Gift, Sparkles, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, type CartItem } from "@/hooks/useCart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { paymentService } from "@/services/PaymentService";
import { LogisticsService, type ShippingRate } from "@/services/logisticsService";
import { calculateNetEarnings } from "@/utils/algorithms";
import { PerformanceAnalytics } from "@/utils/PerformanceAnalytics";

type Address = Database["public"]["Tables"]["user_addresses"]["Row"];
type Shop = Database["public"]["Tables"]["shops"]["Row"];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal: cartSubtotal, platformFee: customerPlatformFee, totalAmount, clearCart, loading: cartLoading } = useCart(user?.id);
  const [step, setStep] = useState<"address" | "delivery" | "payment">("address");

  // Address form
  const [addressForm, setAddressForm] = useState({
    name: user?.user_metadata?.full_name?.split(" ").length > 2 ? user?.user_metadata?.full_name?.split(" ").slice(0, 2).join(" ") : user?.user_metadata?.full_name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    businessName: "",
    gstin: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("shop-pickup");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [selectedPaymentApp, setSelectedPaymentApp] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState<"home_delivery" | "shop_pickup">("home_delivery");
  const [waivedQA, setWaivedQA] = useState(false);
  const [qaWarnings, setQaWarnings] = useState<string[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const fullAddress = `${addressForm.address}, ${addressForm.city} - ${addressForm.pincode}`;

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const walletBalance = Number(profile?.wallet_balance || 0);

  const { data: shops = [], isLoading: loadingShops } = useQuery({
    queryKey: ["checkout-shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        icon: Store,
        badges: (s.rating || 0) >= 4.5 ? ["Highly Rated"] : ["Verified"]
      }));
    }
  });

  const { data: savedAddresses = [], isLoading: loadingAddresses } = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) navigate("/login");
    
    const saved = sessionStorage.getItem("customize_product");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.qaWarnings) setQaWarnings(parsed.qaWarnings);
      } catch (e) {
        console.error("Failed to parse customize_product:", e);
      }
    }
  }, [user, navigate]);

  // Load Razorpay Script Dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Sync address form with default address - only once on mount or when addresses load
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      setAddressForm(prev => ({
        ...prev,
        phone: user?.user_metadata?.phone || prev.phone,
        address: defaultAddr.address,
        city: defaultAddr.city || "",
        pincode: defaultAddr.pincode || "",
      }));
    }
  }, [savedAddresses, selectedAddressId, user?.user_metadata?.phone]);

  const [selectedShopId, setSelectedShopId] = useState<string>(() => {
    const saved = sessionStorage.getItem("customize_product");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.shopId) return parsed.shopId;
      } catch (e) {
        console.error("Failed to parse customize_product for shopId:", e);
      }
    }
    return "";
  });

  const currentShop = shops.find(s => s.id === (items[0]?.shop_id || selectedShopId));

  // Dynamic Shipping Calculation
  useEffect(() => {
    const fetchRates = async () => {
      if (addressForm.pincode.length === 6 && currentShop?.pincode) {
        setIsCalculatingShipping(true);
        try {
          const weight = items.reduce((acc, item) => acc + (item.quantity * 0.1), 0); // Est. 100g per item
          const rates = await LogisticsService.getShippingRates(
            currentShop.pincode,
            addressForm.pincode,
            weight
          );
          setShippingRates(rates);
          if (deliveryMethod === "home-delivery") {
            setSelectedRate(rates[0]);
          }
        } catch (err) {
          console.error("Shipping calculation failed:", err);
        } finally {
          setIsCalculatingShipping(false);
        }
      }
    };
    fetchRates();
  }, [addressForm.pincode, currentShop?.pincode, items, deliveryMethod]);

  const deliveryOptions = [
    { id: "shop-pickup", label: "Shop Pickup", price: 0, time: "Ready in 2-3 days", icon: Store, description: `Pick up from ${currentShop?.name || "the shop"}` },
    { id: "home-delivery", label: "Door Delivery", price: selectedRate?.rate || 59, time: `Est. ${selectedRate?.estimated_days || 3} days`, icon: Truck, description: "Standard Express Delivery" },
  ];

  const deliveryPrice = deliveryMethod === "shop-pickup" ? 0 : (selectedRate?.rate || 59);
  
  // Define payment options for the UI
  const paymentOptions = [
    { id: "upi", label: "UPI / QR Code", icon: Smartphone, description: "Pay using any UPI app" },
    { id: "card", label: "Card / Netbanking", icon: CreditCard, description: "Credit/Debit Cards, Netbanking" },
    { id: "manual", label: "Shop Direct", icon: IndianRupee, description: "Pay directly to shop UPI" },
  ];

  const hasRazorpay = !!import.meta.env.VITE_RAZORPAY_KEY_ID;

  // The grand total calculation: Cart Subtotal + Shipping - Wallet (Fees removed as requested)
  // We calculate totals for display correctly
  const totals = {
    subtotal: cartSubtotal || 0,
    gstAdded: Math.round((cartSubtotal || 0) * 0.12),
  };

  const rawGrandTotal = totals.subtotal + totals.gstAdded + deliveryPrice + (customerPlatformFee || 0);
  const walletDiscount = useWallet ? Math.min(walletBalance, rawGrandTotal) : 0;
  const grandTotal = Math.round(rawGrandTotal - walletDiscount);



  const placeOrderMutation = useMutation({
    mutationFn: async (initialStatus?: { paymentStatus?: string; orderStatus?: string }) => {
      if (!user) throw new Error("You must be logged in to place an order");
      
      const designFromCustomize = sessionStorage.getItem("design_file_url");
      const backDesignFromCustomize = sessionStorage.getItem("back_design_file_url");
      const orderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
      const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const orderPromises = items.map(async (item) => {
        const product = (item as CartItem).product;
        const unitPrice = (item.specifications as any)?.unitPrice || product?.base_price || 0;
        const itemSubtotal = unitPrice * item.quantity;
        
        // Fix isIncl: check shop settings or default to true
        const isIncl = (item as any).shop?.price_includes_gst ?? true;
        const itemGst = isIncl ? 0 : Math.round(itemSubtotal * 0.12);
        const itemPriceWithGst = itemSubtotal + itemGst;
        const itemDelivery = items.length === 1 ? deliveryPrice : Math.round(deliveryPrice / items.length);
        
        const itemGrandTotal = itemPriceWithGst + itemDelivery;
        
        // Marketplace 2.0 Standard: 15% Commission + 18% GST on service
        const category = (product?.category?.toLowerCase() || "general").includes("bulk") ? "bulk" : "general";
        const financials = calculateNetEarnings(itemGrandTotal, category);
        const platformTotalFee = financials.commission + financials.taxOnCommission;
        const vendorPayout = financials.net;

        const itemOrderNumber = items.length > 1
          ? orderNumber + "-" + item.product_id.slice(0, 4).toUpperCase()
          : orderNumber;

        const { error } = await supabase.from("orders").insert({
          order_number: itemOrderNumber,
          customer_id: user.id,
          shop_id: item.shop_id || selectedShopId,
          product_id: (item as any).product_id,
          product_name: product?.name || "Product",
          product_category: product?.category || "Other",
          quantity: item.quantity,
          grand_total: itemGrandTotal,
          unit_price: unitPrice,
          total_price: itemSubtotal,
          gst_amount: itemGst,
          delivery_charge: itemDelivery,
          status: (initialStatus?.orderStatus || "pending") as any,
          payment_status: (initialStatus?.paymentStatus || "pending") as any,
          platform_commission_rate: 5.0,
          specifications: {
            ...(item.specifications as object || {}),
            shipping_method: shippingMethod,
            business_name: addressForm.businessName,
            gstin: addressForm.gstin,
            delivery_address: fullAddress,
            delivery_charge: itemDelivery,
            gst_amount: itemGst,
            grand_total: itemGrandTotal,
            design_file_url: item.design_file_url || (item.specifications as any)?.frontDesign || designFromCustomize || null,
            estimated_delivery: estimatedDelivery,
            unit_price: unitPrice,
            total_price: itemSubtotal,
            notes: `Delivery Address: ${fullAddress}. Total: ₹${itemGrandTotal}`,
            transaction_id: transactionId || null,
            payment_screenshot: screenshotUrl || null,
            payment_method: paymentMethod,
          },
          platform_fee: platformTotalFee,
          merchant_earning: vendorPayout,
        } as any);
        if (error) throw error;
      });

      // Save address if requested (wrap in try-catch as table might be missing)
      if (saveAddress && !selectedAddressId) {
        try {
          await supabase.from("user_addresses").insert({
            user_id: user.id,
            address: addressForm.address,
            city: addressForm.city,
            pincode: addressForm.pincode,
            label: newAddressLabel,
            is_default: savedAddresses.length === 0,
          });
        } catch (e) {
          console.warn("Could not save address - user_addresses table might be missing", e);
        }
      }
      
      // Deduct from wallet if used
      if (useWallet && walletDiscount > 0) {
        const { error: walletError } = await supabase
          .from("profiles")
          .update({ wallet_balance: walletBalance - walletDiscount })
          .eq("user_id", user.id);
        if (walletError) throw walletError;
      }

      await Promise.all(orderPromises);
      return orderNumber;
    },
    onSuccess: (orderNumber) => {
      clearCart();
      sessionStorage.removeItem("design_file_url");
      sessionStorage.removeItem("back_design_file_url");
      sessionStorage.removeItem("customize_product");
      toast.success("Order placed successfully! 🎉");
      navigate(`/order-success?order=${orderNumber}`);
    },
    onError: (error: any) => {
      toast.error("Failed to place order: " + error.message);
    }
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!addressForm.address || !addressForm.city || addressForm.pincode.length !== 6) {
      toast.error("Please complete your delivery address details");
      setStep("address");
      return;
    }

    if (deliveryMethod === "home-delivery" && !selectedRate) {
      toast.error("Please select a shipping method");
      setStep("delivery" as any);
      return;
    }

    // 1. Automated Razorpay Payment Flow
    if (paymentMethod === "upi" || paymentMethod === "card") {
      try {
        // Create the order in "Pending" state first to avoid ghost orders
        const orderNumber = await placeOrderMutation.mutateAsync({
          paymentStatus: "pending",
          orderStatus: "pending"
        });

        const response = await paymentService.initiateRazorpayPayment({
          amount: grandTotal,
          currency: "INR",
          orderId: orderNumber, // Use the real order number
          customerName: addressForm.name,
          customerEmail: user?.email || "",
          customerPhone: addressForm.phone,
          keyId: currentShop?.use_custom_razorpay ? currentShop?.razorpay_key_id : undefined
        });

        if (response.razorpay_payment_id) {
          // Success! Clear cart and move on
          clearCart();
          sessionStorage.removeItem("design_file_url");
          sessionStorage.removeItem("back_design_file_url");
          sessionStorage.removeItem("customize_product");
          toast.success("Payment Received & Order Confirmed! 🎉");
          navigate(`/order-success?order=${orderNumber}`);
        }
      } catch (error: any) {
        console.error("Payment Error:", error);
        toast.error(error.message || "Payment attempt failed.");
        // We don't delete the order here; it stays as "pending" so user can try again or admin can follow up
      }
      return;
    }

    // 2. Manual/Shop Direct Fallback
    if (paymentMethod === "manual") {
      if (!transactionId || transactionId.length < 8) {
        toast.error("Please enter a valid Transaction ID / UTR");
        return;
      }
      // Temporarily disabled for testing ordering flow
      /*
      if (!screenshotFile) {
        toast.error("Please upload a screenshot of your payment for manual verification");
        return;
      }
      */
      placeOrderMutation.mutate();
    }
  };

  if (!user) return null;

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
          {/* Progress Steps (Swiggy Style) */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-12 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary -z-10" />
            {[
              { id: "address", label: "Address", icon: MapPin },
              { id: "delivery", label: "Shipping", icon: Truck },
              { id: "payment", label: "Payment", icon: CreditCard },
            ].map((s, i) => {
              const isActive = step === s.id;
              const isCompleted = (step === "delivery" && i === 0) || (step === "payment" && i < 2);
              
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive ? "bg-accent text-white shadow-lg ring-4 ring-accent/20" :
                    isCompleted ? "bg-success text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? "text-accent" : "text-muted-foreground"
                  }`}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Address & Shop Step */}
              {step === "address" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="space-y-6">
                    {/* Address Card */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                        <MapPin className="w-5 h-5 text-accent" /> Delivery Address
                      </h2>

                      {savedAddresses.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <label className="text-sm font-medium text-foreground block">Saved Addresses</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  setAddressForm({
                                    ...addressForm,
                                    address: addr.address,
                                    city: addr.city || "",
                                    pincode: addr.pincode || "",
                                  });
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  selectedAddressId === addr.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-accent">{addr.label}</span>
                                  {selectedAddressId === addr.id && <Check className="w-3.5 h-3.5 text-accent" />}
                                </div>
                                <p className="text-xs text-foreground line-clamp-2">{addr.address}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{addr.city}, {addr.pincode}</p>
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setSelectedAddressId(null);
                                setAddressForm({
                                  ...addressForm,
                                  address: "",
                                  city: "",
                                  pincode: "",
                                });
                              }}
                              className={`p-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-accent hover:border-accent transition-all ${
                                selectedAddressId === null ? "border-accent bg-accent/5 text-accent" : ""
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-xs font-medium">New Address</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                            <input value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})}
                              placeholder="e.g. John Doe"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Phone *</label>
                            <input value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="Enter mobile number"
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
                              placeholder="e.g. Mumbai, Bangalore"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                            <input value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} maxLength={6}
                              placeholder="e.g. 400001"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>

                        {!selectedAddressId && (
                          <div className="pt-4 border-t border-border mt-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={saveAddress} 
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="w-4 h-4 rounded border-input text-accent focus:ring-accent" 
                              />
                              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">Save this address for future use</span>
                            </label>
                            
                            {saveAddress && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {["Home", "Office", "Other"].map((label) => (
                                  <button
                                    key={label}
                                    onClick={() => setNewAddressLabel(label)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                      newAddressLabel === label ? "bg-accent text-white border-accent shadow-sm" : "bg-background text-muted-foreground border-border hover:border-accent/50"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* B2B: Business Details */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-card bg-secondary/5">
                      <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-accent" /> Business Details (Optional)
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Business Name</label>
                          <input value={addressForm.businessName} onChange={e => setAddressForm({...addressForm, businessName: e.target.value})} placeholder="e.g. Raj Digital Pvt Ltd"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">GSTIN</label>
                          <input value={addressForm.gstin} onChange={e => setAddressForm({...addressForm, gstin: e.target.value})} placeholder="27XXXXX0000X1Z5"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      {!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.pincode ? (
                        <p className="text-xs text-amber-500 flex items-center gap-1 px-1">
                          <Info className="w-3 h-3" /> Please fill all required fields to continue
                        </p>
                      ) : null}
                      <Button variant="coral" size="lg" className="w-full gap-2 shadow-lg shadow-accent/20"
                        onClick={() => {
                          if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.pincode) {
                            toast.error("Please fill in all required fields");
                            return;
                          }
                          if (!/^\d{6}$/.test(addressForm.pincode)) {
                            toast.error("Please enter a valid 6-digit pincode");
                            return;
                          }
                          setStep("delivery" as any);
                          window.scrollTo(0, 0);
                        }}>
                        Select Shipping Method <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Delivery Step */}
              {step === "delivery" as any && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Truck className="w-5 h-5 text-accent" /> Shipping Method
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deliveryOptions.map((option) => (
                        <button 
                          key={option.id} 
                          onClick={() => {
                            setDeliveryMethod(option.id);
                            setShippingMethod(option.id === "shop-pickup" ? "shop_pickup" : "home_delivery");
                            if (option.id === "shop-pickup") setSelectedRate(null);
                            else if (shippingRates.length > 0) setSelectedRate(shippingRates[0]);
                          }}
                          className={`p-5 rounded-2xl border-2 text-left transition-all ${
                            deliveryMethod === option.id ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border hover:border-accent/40"
                          }`}
                        >
                          <div className="flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              deliveryMethod === option.id ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                            }`}>
                              <option.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-black text-foreground">{option.label}</p>
                                <p className={`text-sm font-black ${option.price === 0 ? "text-green-500" : "text-foreground"}`}>
                                  {option.price === 0 ? "FREE" : `₹${option.price}`}
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{option.time}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {isCalculatingShipping && deliveryMethod === "home-delivery" && (
                      <div className="p-4 rounded-xl border border-border bg-slate-50 flex items-center gap-3 animate-pulse">
                        <RefreshCw className="w-4 h-4 text-accent animate-spin" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recalculating rates...</span>
                      </div>
                    )}

                    {/* Shop Confirmation - Only show if not all items have shop_id already */}
                    {items.some(i => !i.shop_id) && (
                      <div className="mt-8 pt-8 border-t border-border">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                          <Store className="w-4 h-4 text-accent" /> Fulfillment Partner
                        </h3>
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                              <Store className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {items.length === 1 ? (items[0] as CartItem).product?.name : `${items.length} Products`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Assigned to: <span className="text-foreground font-medium">
                                  {shops.find(s => s.id === (items[0]?.shop_id || selectedShopId))?.name || "Official Partner"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-500 border-none text-[10px]">Verified Partner</Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-8">
                      <Button variant="outline" size="lg" onClick={() => setStep("address")}>Back</Button>
                      <Button variant="coral" size="lg" className="flex-1 gap-2" onClick={() => setStep("payment")}>
                        Review &amp; Pay <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Step */}
              {step === "payment" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="space-y-6">
                    {/* Order Summary Review */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                        <Check className="w-5 h-5 text-success" /> Review Your Order
                      </h2>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/10 border border-border">
                          <MapPin className="w-5 h-5 text-accent mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-foreground">Delivery to:</p>
                            <p className="text-sm text-foreground">{addressForm.name}</p>
                            <p className="text-xs text-muted-foreground">{fullAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/10 border border-border">
                          <Truck className="w-5 h-5 text-accent mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-foreground">Shipping Method:</p>
                            <p className="text-sm text-foreground">
                              {deliveryOptions.find(d => d.id === deliveryMethod)?.label} 
                              ({deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice}`})
                            </p>
                            <p className="text-xs text-muted-foreground">{deliveryOptions.find(d => d.id === deliveryMethod)?.time}</p>
                          </div>
                        </div>
                      </div>

                      {walletBalance > 0 && (
                        <div className={`p-4 rounded-xl border-2 mb-6 transition-all ${
                          useWallet ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border hover:border-accent/20"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                useWallet ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                              }`}>
                                <Gift className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">Use Wallet Credits</p>
                                <p className="text-xs text-muted-foreground">Available Balance: ₹{walletBalance}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setUseWallet(!useWallet)}
                              className={`w-12 h-6 rounded-full relative transition-colors ${
                                useWallet ? "bg-accent" : "bg-secondary"
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                useWallet ? "left-7" : "left-1"
                              }`} />
                            </button>
                          </div>
                          {useWallet && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              className="text-[10px] text-accent font-bold mt-2 pt-2 border-t border-accent/10"
                            >
                              ✨ Applied ₹{walletDiscount} discount from your wallet!
                            </motion.p>
                          )}
                        </div>
                      )}

                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-accent" /> Select Payment Method
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        {paymentOptions.map((option) => (
                          <button 
                            key={option.id} 
                            onClick={() => setPaymentMethod(option.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                              paymentMethod === option.id ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border hover:border-accent/30"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                paymentMethod === option.id ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                              }`}>
                                <option.icon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-foreground">{option.label}</p>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === option.id ? "border-accent" : "border-muted-foreground/30"
                            }`}>
                              {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                            </div>
                          </button>
                        ))}
                      </div>

                      {(paymentMethod === "upi" || paymentMethod === "card") && hasRazorpay && (
                        <div className="p-4 bg-success/5 rounded-lg border border-success/10 mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {paymentMethod === "upi" ? <Smartphone className="w-5 h-5 text-success" /> : <CreditCard className="w-5 h-5 text-success" />}
                            <span className="text-sm text-foreground font-medium">
                              Selected: {paymentMethod === "upi" ? "UPI (Online via Razorpay)" : "Card Payment via Razorpay"}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30">Secure</Badge>
                        </div>
                      )}

                      {/* If UPI selected but no Razorpay, show Shop UPI details */}
                      {paymentMethod === "upi" && !hasRazorpay && (
                        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20 mb-6 space-y-4">
                          <div className="flex items-center gap-3 text-accent font-bold">
                            <Info className="w-5 h-5" />
                            <span className="text-sm">Pay using Shop's Direct UPI</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Shop doesn't support online gateway. Please pay directly to their UPI ID below.</p>
                          <div className="p-3 bg-white rounded-lg border border-border flex items-center justify-between">
                             <p className="text-sm font-bold text-foreground">{currentShop?.upi_id || "Contact Shop"}</p>
                             <Button size="sm" variant="ghost" className="h-8 text-accent" onClick={() => {
                               navigator.clipboard.writeText(currentShop?.upi_id || "");
                               toast.success("UPI ID copied!");
                             }}>Copy</Button>
                          </div>
                          {(currentShop as any)?.qr_code_url && (
                             <img src={(currentShop as any).qr_code_url} alt="Shop QR" className="w-32 h-32 mx-auto rounded-lg border p-1" />
                          )}
                        </div>
                      )}

                      {paymentMethod === "manual" && (
                        <div className="p-5 bg-card rounded-xl border-2 border-accent/20 mb-6 space-y-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-accent" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-foreground">Direct Pay to Shop</span>
                                <span className="text-[10px] text-muted-foreground block">Requires manual UTR verification</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-200">Manual</Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Shop UPI ID</p>
                              <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center justify-between">
                                <span className="text-sm font-mono font-bold text-foreground">{currentShop?.upi_id || "Contact Shop"}</span>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  navigator.clipboard.writeText(currentShop?.upi_id || "");
                                  toast.success("UPI ID copied!");
                                }}><Copy className="w-4 h-4" /></Button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Transaction ID / UTR *</label>
                              <input 
                                value={transactionId} 
                                onChange={e => setTransactionId(e.target.value)}
                                placeholder="12-digit UPI UTR"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Payment Screenshot *</label>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {qaWarnings.length > 0 && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-amber-800">Design Quality Warning</p>
                              <p className="text-xs text-amber-700 mt-1">Our AI detected potential issues with your design quality. This may affect print results.</p>
                              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={waivedQA} 
                                  onChange={(e) => setWaivedQA(e.target.checked)}
                                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                                />
                                <span className="text-[10px] font-medium text-amber-800">I acknowledge and want to proceed anyway.</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button variant="outline" size="lg" onClick={() => setStep("delivery" as any)}>Back</Button>
                        <Button 
                          variant="coral" 
                          size="lg" 
                          className="flex-1 gap-2 shadow-lg shadow-coral/20" 
                          onClick={handlePlaceOrder} 
                          disabled={placeOrderMutation.isPending || (qaWarnings.length > 0 && !waivedQA)}
                        >
                          {placeOrderMutation.isPending ? "Processing..." : `Complete Order • ₹${grandTotal.toLocaleString("en-IN")}`} <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground mt-4">
                        🔒 Secure 256-bit SSL Encrypted Payment Handling
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>


            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl border border-border p-6 shadow-elevated sticky top-24 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-coral" />
                <h3 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" /> Order Summary
                </h3>

                <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border group-hover:border-accent/30 transition-colors">
                        {item.design_file_url || (item.specifications as any)?.frontDesign ? (
                          <img src={item.design_file_url || (item.specifications as any)?.frontDesign} alt="Design" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-7 h-7 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate leading-tight">{(item as any).product?.name || "Product"}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Quantity: {item.quantity}</p>
                        <p className="font-bold text-accent text-xs mt-1">₹{(((item.specifications as any)?.total || ((item as any).product?.base_price || 0) * item.quantity)).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className="text-foreground font-medium">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {totals.gstAdded > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (12%)</span>
                      <span className="text-foreground font-medium">₹{totals.gstAdded.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Partner Fee</span>
                    <span className={`font-bold ${deliveryPrice === 0 ? "text-success" : "text-foreground"}`}>
                      {deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="text-foreground font-medium">₹{customerPlatformFee?.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-accent/10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-0.5">To Pay</p>
                        <p className="text-2xl font-display font-black text-foreground">₹{grandTotal.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-success font-bold flex items-center gap-1 justify-end">
                          <Check className="w-3 h-3" /> Secure Checkout
                        </p>
                        <p className="text-[8px] text-muted-foreground">Inclusive of all taxes</p>
                      </div>
                    </div>
                  </div>

                  {useWallet && walletDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3 shadow-lg shadow-accent/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                      </div>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest leading-tight">
                        Referral Bonus Applied! You saved ₹{walletDiscount} on this order.
                      </p>
                    </motion.div>
                  )}
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
