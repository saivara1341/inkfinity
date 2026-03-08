import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, MapPin, Clock, Share2, Download, Printer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccess = () => {
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-14 h-14 text-success" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-muted-foreground">
                Thank you for your order. We've sent confirmation to your email & WhatsApp.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card mb-6"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-display text-xl font-bold text-foreground">{orderId}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" /> Invoice
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">Order Received</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Delivery</p>
                    <p className="font-medium text-foreground">{estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-medium text-foreground">Shop Pickup</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Visiting Cards × 500</span>
                    <span className="text-foreground">₹899</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3.5×2 in • 300gsm Art Card • Glossy</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Paid</span>
                      <span className="text-foreground">₹899</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card mb-6"
            >
              <h3 className="font-display font-semibold text-foreground mb-4">What happens next?</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: "File Verification", desc: "Our team will verify your design file within 2 hours", done: false },
                  { step: 2, title: "Printing Starts", desc: "Your order goes to print after verification", done: false },
                  { step: 3, title: "Quality Check", desc: "We check every print for color & finish quality", done: false },
                  { step: 4, title: "Ready for Pickup/Delivery", desc: "You'll receive a notification when ready", done: false },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? "bg-success text-accent-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {item.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-medium">{item.step}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shop Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl border border-border p-6 shadow-card mb-8"
            >
              <h3 className="font-display font-semibold text-foreground mb-4">Print Shop</h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-coral flex items-center justify-center shrink-0">
                  <Printer className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">QuickPrint Studio</p>
                  <p className="text-sm text-muted-foreground">123, MG Road, Indiranagar, Bangalore - 560038</p>
                  <p className="text-sm text-accent mt-1">+91 98765 12345</p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="coral" size="lg" asChild>
                <Link to="/dashboard">Track Your Order</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/catalog">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
