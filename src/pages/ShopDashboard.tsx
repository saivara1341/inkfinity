import { useState } from "react";
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Truck, CreditCard, 
  BarChart3, Settings, ChevronDown, Download, Eye, Clock, CheckCircle2, 
  Printer, PackageCheck, AlertCircle, IndianRupee, TrendingUp, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Tab = "overview" | "orders" | "products" | "customers" | "delivery" | "payments" | "analytics" | "settings";

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const mockOrders = [
  { id: "ORD-1001", customer: "Rahul Sharma", product: "Visiting Cards (500)", total: "₹899", status: "Order Received", date: "Today, 2:30 PM" },
  { id: "ORD-1002", customer: "Priya Patel", product: "A3 Poster (10)", total: "₹490", status: "Printing", date: "Today, 11:15 AM" },
  { id: "ORD-1003", customer: "Amit Kumar", product: "Vinyl Banner 6×3 ft", total: "₹3,594", status: "File Verified", date: "Today, 9:00 AM" },
  { id: "ORD-1004", customer: "Sneha Gupta", product: "Die-Cut Stickers (200)", total: "₹400", status: "Ready for Pickup", date: "Yesterday" },
  { id: "ORD-1005", customer: "Vikram Singh", product: "A4 Flyers (100)", total: "₹500", status: "Delivered", date: "Yesterday" },
  { id: "ORD-1006", customer: "Meera Nair", product: "PVC ID Cards (50)", total: "₹1,250", status: "Out for Delivery", date: "Yesterday" },
];

const statusColors: Record<string, string> = {
  "Order Received": "bg-warning/20 text-warning",
  "File Verified": "bg-accent/20 text-accent",
  "Printing": "bg-blue-100 text-blue-700",
  "Ready for Pickup": "bg-green-100 text-green-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  "Delivered": "bg-success/20 text-success",
};

const ShopDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-coral flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5 text-accent-foreground" />
          </div>
          {sidebarOpen && <span className="font-display font-bold text-foreground">My Print Shop</span>}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            </button>
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">SP</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "delivery" && <DeliveryTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

const OverviewTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Today's Orders", value: "12", change: "+3 from yesterday", icon: ShoppingCart, color: "text-accent" },
        { label: "Revenue Today", value: "₹8,450", change: "+18% vs avg", icon: IndianRupee, color: "text-success" },
        { label: "Pending Orders", value: "5", change: "2 urgent", icon: Clock, color: "text-warning" },
        { label: "Completed", value: "7", change: "This week: 42", icon: CheckCircle2, color: "text-success" },
      ].map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
        </div>
      ))}
    </div>

    {/* Recent Orders */}
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.slice(0, 5).map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{order.id}</td>
                <td className="px-5 py-3 text-sm text-foreground">{order.customer}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{order.product}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{order.total}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);

const OrdersTab = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const statuses = ["all", "Order Received", "File Verified", "Printing", "Ready for Pickup", "Out for Delivery", "Delivered"];
  const filtered = statusFilter === "all" ? mockOrders : mockOrders.filter((o) => o.status === statusFilter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{order.id}</td>
                <td className="px-5 py-3 text-sm text-foreground">{order.customer}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{order.product}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{order.total}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{order.date}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                    <Button variant="coral" size="sm" className="h-8 text-xs">Update Status</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const ProductsTab = () => {
  const shopProducts = [
    { name: "Standard Visiting Card", category: "Visiting Cards", basePrice: "₹1.50/card", active: true },
    { name: "Premium Visiting Card", category: "Visiting Cards", basePrice: "₹3/card", active: true },
    { name: "A5 Flyer", category: "Flyers", basePrice: "₹3/piece", active: true },
    { name: "A3 Poster", category: "Posters", basePrice: "₹49/each", active: false },
    { name: "Vinyl Banner", category: "Banners", basePrice: "₹199/sq ft", active: true },
    { name: "Die-Cut Sticker", category: "Stickers", basePrice: "₹2/piece", active: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{shopProducts.length} products configured</p>
        <Button variant="coral">Add Product</Button>
      </div>

      <div className="grid gap-4">
        {shopProducts.map((p) => (
          <div key={p.name} className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
            <div>
              <h4 className="font-display font-semibold text-foreground">{p.name}</h4>
              <p className="text-sm text-muted-foreground">{p.category} • Base price: {p.basePrice}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                {p.active ? "Active" : "Inactive"}
              </span>
              <Button variant="outline" size="sm">Edit Pricing</Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CustomersTab = () => {
  const customers = [
    { name: "Rahul Sharma", email: "rahul@email.com", orders: 12, totalSpent: "₹15,400", lastOrder: "Today" },
    { name: "Priya Patel", email: "priya@email.com", orders: 8, totalSpent: "₹9,200", lastOrder: "Today" },
    { name: "Amit Kumar", email: "amit@email.com", orders: 5, totalSpent: "₹12,800", lastOrder: "Today" },
    { name: "Sneha Gupta", email: "sneha@email.com", orders: 3, totalSpent: "₹2,100", lastOrder: "Yesterday" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Email</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Orders</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total Spent</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.email}</td>
                <td className="px-5 py-3 text-sm text-foreground">{c.orders}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{c.totalSpent}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const DeliveryTab = () => {
  const deliveryOptions = [
    { method: "Shop Pickup", enabled: true, description: "Customer picks up from your shop" },
    { method: "Shop Delivery", enabled: true, description: "Your own delivery staff" },
    { method: "Rapido Parcel", enabled: false, description: "Fast delivery via Rapido" },
    { method: "Porter Delivery", enabled: false, description: "Courier delivery via Porter" },
    { method: "Local Courier", enabled: true, description: "Partner courier services" },
    { method: "Customer Arranged", enabled: true, description: "Customer arranges own pickup" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <p className="text-muted-foreground">Configure delivery methods available for your shop.</p>
      <div className="grid gap-4">
        {deliveryOptions.map((d) => (
          <div key={d.method} className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-display font-semibold text-foreground">{d.method}</h4>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </div>
            </div>
            <button className={`w-12 h-7 rounded-full transition-colors relative ${d.enabled ? "bg-accent" : "bg-secondary"}`}>
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${d.enabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PaymentsTab = () => {
  const payments = [
    { id: "PAY-3001", order: "ORD-1001", customer: "Rahul Sharma", amount: "₹899", method: "UPI", status: "Completed", date: "Today" },
    { id: "PAY-3002", order: "ORD-1002", customer: "Priya Patel", amount: "₹490", method: "Card", status: "Completed", date: "Today" },
    { id: "PAY-3003", order: "ORD-1003", customer: "Amit Kumar", amount: "₹3,594", method: "UPI", status: "Pending", date: "Today" },
    { id: "PAY-3004", order: "ORD-1005", customer: "Vikram Singh", amount: "₹500", method: "Net Banking", status: "Completed", date: "Yesterday" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
          <p className="text-2xl font-display font-bold text-foreground">₹4,983</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
          <p className="text-2xl font-display font-bold text-warning">₹3,594</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-display font-bold text-success">₹1,24,500</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Payment ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Method</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{p.id}</td>
                <td className="px-5 py-3 text-sm text-accent">{p.order}</td>
                <td className="px-5 py-3 text-sm text-foreground">{p.customer}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{p.amount}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{p.method}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.status === "Completed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const AnalyticsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Orders", value: "1,247", change: "+12% this month" },
        { label: "Total Revenue", value: "₹4,85,200", change: "+18% this month" },
        { label: "Avg Order Value", value: "₹389", change: "+5% this month" },
        { label: "Repeat Customers", value: "68%", change: "+3% this month" },
      ].map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
          <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{stat.change}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Products</h3>
        <div className="space-y-3">
          {["Visiting Cards (42%)", "Flyers (25%)", "Banners (15%)", "Posters (10%)", "Stickers (8%)"].map((p, i) => (
            <div key={p} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{p.split(" (")[0]}</span>
                  <span className="text-muted-foreground">{p.match(/\((.+)\)/)?.[1]}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: p.match(/\((.+)\)/)?.[1] }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Daily Revenue (Last 7 Days)</h3>
        <div className="flex items-end gap-3 h-40">
          {[4200, 6800, 5100, 8450, 7200, 9100, 8450].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-coral rounded-t-md transition-all" 
                style={{ height: `${(val / 9100) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const SettingsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
      <h3 className="font-display font-semibold text-foreground">Shop Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Shop Name", value: "QuickPrint Studio" },
          { label: "Phone", value: "+91 98765 43210" },
          { label: "Email", value: "shop@quickprint.in" },
          { label: "Address", value: "123, MG Road, Bangalore" },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
            <input 
              type="text" 
              defaultValue={f.value}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
      </div>
      <Button variant="coral">Save Changes</Button>
    </div>
  </motion.div>
);

export default ShopDashboard;
