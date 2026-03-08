import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer, User, Store, ArrowRight, Check } from "lucide-react";

type UserType = "customer" | "shop";

const Signup = () => {
  const [userType, setUserType] = useState<UserType>("customer");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    shopName: "",
    shopAddress: "",
    city: "",
    gstNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
    "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Indore", 
    "Nagpur", "Coimbatore", "Kochi", "Chandigarh", "Vadodara", "Bhopal"
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-coral flex items-center justify-center">
              <Printer className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">PrintFlow</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Join India's largest print ordering network</p>

          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { setUserType("customer"); setStep(1); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                userType === "customer"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <User className={`w-6 h-6 mb-2 ${userType === "customer" ? "text-accent" : "text-muted-foreground"}`} />
              <p className="font-semibold text-foreground">Customer</p>
              <p className="text-xs text-muted-foreground">Order prints online</p>
            </button>
            <button
              onClick={() => { setUserType("shop"); setStep(1); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                userType === "shop"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <Store className={`w-6 h-6 mb-2 ${userType === "shop" ? "text-accent" : "text-muted-foreground"}`} />
              <p className="font-semibold text-foreground">Shop Owner</p>
              <p className="text-xs text-muted-foreground">List your print shop</p>
            </button>
          </div>

          {/* Progress Steps for Shop */}
          {userType === "shop" && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-accent" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Customer Form */}
          {userType === "customer" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-16 px-3 py-2.5 rounded-lg border border-input bg-secondary text-sm text-foreground flex items-center justify-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="coral" size="lg" className="w-full gap-2">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Shop Owner Form */}
          {userType === "shop" && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Suresh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-16 px-3 py-2.5 rounded-lg border border-input bg-secondary text-sm text-foreground flex items-center justify-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="shop@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="coral" size="lg" className="w-full gap-2" onClick={() => setStep(2)}>
                Next: Shop Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {userType === "shop" && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Shop / Business Name</label>
                <input
                  type="text"
                  name="shopName"
                  placeholder="Raj Digital / Krishna Prints"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select your city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Shop Address</label>
                <input
                  type="text"
                  name="shopAddress"
                  placeholder="123, MG Road, Near Bus Stand"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">GST Number (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="coral" size="lg" className="flex-1 gap-2">
                  Submit for Approval <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Your shop will be reviewed and approved within 24-48 hours
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <Button variant="outline" className="w-full gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-coral items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl font-bold text-accent-foreground mb-6">
            {userType === "customer" 
              ? "Order prints from anywhere in India" 
              : "Grow your printing business online"
            }
          </h2>
          <div className="space-y-4 text-left">
            {userType === "customer" ? (
              <>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">500+ Verified Shops</p>
                    <p className="text-sm text-accent-foreground/80">Quality checked print partners</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">UPI & Easy Payments</p>
                    <p className="text-sm text-accent-foreground/80">Pay via GPay, PhonePe, Paytm</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">Fast Delivery</p>
                    <p className="text-sm text-accent-foreground/80">Rapido, Porter & local couriers</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">Get Online Orders</p>
                    <p className="text-sm text-accent-foreground/80">Beyond walk-in & WhatsApp orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">Automate Operations</p>
                    <p className="text-sm text-accent-foreground/80">Order management & file handling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-accent-foreground/10 rounded-lg p-4">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-foreground">Zero Setup Fees</p>
                    <p className="text-sm text-accent-foreground/80">Pay only 10% on successful orders</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
