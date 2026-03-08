import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Search, Package, CheckCircle2, Clock, Printer, 
  Truck, MapPin, Phone, MessageCircle
} from "lucide-react";

const statusSteps = [
  { id: "received", label: "Order Received", icon: Package, description: "Order confirmed & payment received" },
  { id: "verified", label: "File Verified", icon: CheckCircle2, description: "Design checked & approved for print" },
  { id: "printing", label: "Printing", icon: Printer, description: "Your order is being printed" },
  { id: "ready", label: "Ready", icon: Package, description: "Quality checked & packed" },
  { id: "out", label: "Out for Delivery", icon: Truck, description: "On the way to your address" },
  { id: "delivered", label: "Delivered", icon: MapPin, description: "Order delivered successfully" },
];

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState("");
  const [orderFound, setOrderFound] = useState(true);
  
  // Mock order data
  const currentStep = 2; // "printing"
  const order = {
    id: "ORD-101234",
    product: "Standard Visiting Cards (500)",
    placedAt: "Mar 7, 2026, 2:30 PM",
    estimatedDelivery: "Mar 11, 2026",
    shop: {
      name: "QuickPrint Studio",
      phone: "+91 98765 12345",
      address: "123, MG Road, Indiranagar, Bangalore",
    },
    timeline: [
      { step: "Order Received", time: "Mar 7, 2:30 PM", completed: true },
      { step: "File Verified", time: "Mar 7, 4:15 PM", completed: true },
      { step: "Printing", time: "In progress...", completed: false, current: true },
      { step: "Ready for Pickup", time: "", completed: false },
      { step: "Delivered", time: "", completed: false },
    ],
  };

  const handleTrack = () => {
    // In real app, fetch order by tracking ID
    if (trackingId.length > 0) {
      setOrderFound(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Track Your Order
              </h1>
              <p className="text-muted-foreground">
                Enter your order ID to track real-time status
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card mb-8"
            >
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g., ORD-101234)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button variant="coral" size="lg" onClick={handleTrack}>
                  Track
                </Button>
              </div>
            </motion.div>

            {orderFound && (
              <>
                {/* Order Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card mb-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-display text-2xl font-bold text-foreground">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Printing in Progress
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Product</p>
                      <p className="font-medium text-foreground">{order.product}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ordered On</p>
                      <p className="font-medium text-foreground">{order.placedAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium text-accent">{order.estimatedDelivery}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card mb-6"
                >
                  <h3 className="font-display font-semibold text-foreground mb-6">Order Progress</h3>
                  
                  <div className="space-y-0">
                    {order.timeline.map((item, i) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            item.completed ? "bg-success text-accent-foreground" :
                            item.current ? "bg-accent text-accent-foreground ring-4 ring-accent/20" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : item.current ? (
                              <Printer className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">{i + 1}</span>
                            )}
                          </div>
                          {i < order.timeline.length - 1 && (
                            <div className={`w-0.5 h-16 ${
                              item.completed ? "bg-success" : "bg-border"
                            }`} />
                          )}
                        </div>
                        <div className="pb-12">
                          <p className={`font-medium ${
                            item.completed || item.current ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {item.step}
                          </p>
                          <p className={`text-sm ${
                            item.current ? "text-accent" : "text-muted-foreground"
                          }`}>
                            {item.time || "Pending"}
                          </p>
                          {item.current && (
                            <p className="text-sm text-accent mt-1 animate-pulse">
                              ● Currently in progress...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Shop Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card"
                >
                  <h3 className="font-display font-semibold text-foreground mb-4">Print Shop Contact</h3>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{order.shop.name}</p>
                      <p className="text-sm text-muted-foreground">{order.shop.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Phone className="w-4 h-4" /> Call
                      </Button>
                      <Button variant="coral" size="sm" className="gap-1">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/dashboard">View All Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
