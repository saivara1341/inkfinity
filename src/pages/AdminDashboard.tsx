import { useState } from "react";
import {
  LayoutDashboard, Store, Users, CreditCard, BarChart3, Settings,
  Shield, ChevronDown, CheckCircle2, XCircle, Clock, IndianRupee,
  TrendingUp, AlertTriangle, Bell, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Tab = "overview" | "shops" | "users" | "transactions" | "analytics" | "platform" | "settings";

const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shops", label: "Shops", icon: Store },
  { id: "users", label: "Users", icon: Users },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "platform", label: "Platform Fees", icon: IndianRupee },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-primary text-primary-foreground flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-primary-foreground/10 gap-3">
          <Shield className="w-6 h-6 text-accent shrink-0" />
          {sidebarOpen && <span className="font-display font-bold">PrintFlow Admin</span>}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary-foreground/15 text-accent"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-primary-foreground/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab === "platform" ? "Platform Fees" : activeTab}</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "shops" && <ShopsManagement />}
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "platform" && <PlatformFees />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

const AdminOverview = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Shops", value: "524", change: "+12 this week", icon: Store },
        { label: "Total Users", value: "18,432", change: "+340 this week", icon: Users },
        { label: "Total Revenue", value: "₹24.5L", change: "+22% this month", icon: IndianRupee },
        { label: "Platform Fees", value: "₹2.45L", change: "10% commission", icon: TrendingUp },
      ].map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-success mt-1">{stat.change}</p>
        </div>
      ))}
    </div>

    {/* Pending Approvals */}
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" /> Pending Shop Approvals
        </h3>
        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-medium">3 pending</span>
      </div>
      <div className="divide-y divide-border">
        {[
          { name: "PixelPrint Labs", location: "Mumbai", date: "Mar 7, 2026" },
          { name: "InkJet Express", location: "Delhi", date: "Mar 6, 2026" },
          { name: "ColorCraft Studio", location: "Chennai", date: "Mar 5, 2026" },
        ].map((shop) => (
          <div key={shop.name} className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{shop.name}</p>
              <p className="text-xs text-muted-foreground">{shop.location} • Applied {shop.date}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="coral" size="sm">Approve</Button>
              <Button variant="outline" size="sm">Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ShopsManagement = () => {
  const shops = [
    { name: "QuickPrint Studio", location: "Bangalore", owner: "Suresh K", orders: 1247, revenue: "₹4.85L", status: "Active" },
    { name: "PrintHub Central", location: "Mumbai", owner: "Rajesh M", orders: 892, revenue: "₹3.21L", status: "Active" },
    { name: "StickerWorld", location: "Delhi", owner: "Anita S", orders: 634, revenue: "₹1.87L", status: "Active" },
    { name: "PixelPrint Labs", location: "Mumbai", owner: "Vikash P", orders: 0, revenue: "₹0", status: "Pending" },
    { name: "InkJet Express", location: "Delhi", owner: "Ravi T", orders: 0, revenue: "₹0", status: "Pending" },
    { name: "OldPrint Co", location: "Kolkata", owner: "Mohan D", orders: 23, revenue: "₹8,400", status: "Suspended" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Shop Name", "Location", "Owner", "Orders", "Revenue", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.name} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{s.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{s.location}</td>
                <td className="px-5 py-3 text-sm text-foreground">{s.owner}</td>
                <td className="px-5 py-3 text-sm text-foreground">{s.orders}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{s.revenue}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.status === "Active" ? "bg-success/20 text-success" :
                    s.status === "Pending" ? "bg-warning/20 text-warning" :
                    "bg-destructive/20 text-destructive"
                  }`}>{s.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                    {s.status === "Pending" && <Button variant="coral" size="sm" className="h-8 text-xs">Approve</Button>}
                    {s.status === "Active" && <Button variant="outline" size="sm" className="h-8 text-xs">Suspend</Button>}
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

const UsersManagement = () => {
  const users = [
    { name: "Rahul Sharma", email: "rahul@email.com", role: "Customer", orders: 12, joined: "Feb 2026", status: "Active" },
    { name: "Priya Patel", email: "priya@email.com", role: "Customer", orders: 8, joined: "Jan 2026", status: "Active" },
    { name: "Suresh K", email: "suresh@quickprint.in", role: "Shop Owner", orders: 0, joined: "Dec 2025", status: "Active" },
    { name: "Blocked User", email: "blocked@email.com", role: "Customer", orders: 1, joined: "Mar 2026", status: "Blocked" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Name", "Email", "Role", "Orders", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${u.role === "Shop Owner" ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground"}`}>{u.role}</span></td>
                <td className="px-5 py-3 text-sm text-foreground">{u.orders}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{u.joined}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const TransactionsView = () => {
  const txns = [
    { id: "TXN-5001", order: "ORD-1001", shop: "QuickPrint Studio", amount: "₹899", fee: "₹89.90", method: "UPI", status: "Settled", date: "Mar 7" },
    { id: "TXN-5002", order: "ORD-1002", shop: "PrintHub Central", amount: "₹490", fee: "₹49.00", method: "Card", status: "Settled", date: "Mar 7" },
    { id: "TXN-5003", order: "ORD-1003", shop: "QuickPrint Studio", amount: "₹3,594", fee: "₹359.40", method: "UPI", status: "Pending", date: "Mar 7" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Total Processed</p>
          <p className="text-2xl font-display font-bold text-foreground">₹24.5L</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Platform Fees Earned</p>
          <p className="text-2xl font-display font-bold text-accent">₹2.45L</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Pending Settlement</p>
          <p className="text-2xl font-display font-bold text-warning">₹45,200</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Txn ID", "Order", "Shop", "Amount", "Platform Fee", "Method", "Status", "Date"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{t.id}</td>
                <td className="px-5 py-3 text-sm text-accent">{t.order}</td>
                <td className="px-5 py-3 text-sm text-foreground">{t.shop}</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{t.amount}</td>
                <td className="px-5 py-3 text-sm text-accent">{t.fee}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{t.method}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.status === "Settled" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{t.status}</span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const AdminAnalytics = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Orders This Month", value: "4,820", change: "+22%" },
        { label: "New Users", value: "1,340", change: "+15%" },
        { label: "New Shops", value: "12", change: "+8%" },
        { label: "Avg Order Value", value: "₹412", change: "+5%" },
      ].map((s) => (
        <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
          <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{s.change}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Shops by Revenue</h3>
        <div className="space-y-3">
          {[
            { name: "QuickPrint Studio", revenue: "₹4.85L", share: "42%" },
            { name: "PrintHub Central", revenue: "₹3.21L", share: "28%" },
            { name: "StickerWorld", revenue: "₹1.87L", share: "16%" },
            { name: "BannerKing", revenue: "₹0.98L", share: "8%" },
            { name: "Others", revenue: "₹0.69L", share: "6%" },
          ].map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.revenue}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: s.share }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Revenue by City</h3>
        <div className="space-y-3">
          {[
            { city: "Bangalore", revenue: "₹8.2L", share: "34%" },
            { city: "Mumbai", revenue: "₹6.1L", share: "25%" },
            { city: "Delhi", revenue: "₹4.8L", share: "20%" },
            { city: "Chennai", revenue: "₹3.2L", share: "13%" },
            { city: "Others", revenue: "₹2.2L", share: "8%" },
          ].map((c, i) => (
            <div key={c.city} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{c.city}</span>
                  <span className="text-muted-foreground">{c.revenue}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-coral rounded-full" style={{ width: c.share }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const PlatformFees = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
      <h3 className="font-display font-semibold text-foreground">Commission Settings</h3>
      <div className="space-y-4">
        {[
          { label: "Default Platform Commission", value: "10", suffix: "%" },
          { label: "Payment Gateway Fee", value: "2", suffix: "%" },
          { label: "Minimum Order Value", value: "99", suffix: "₹" },
        ].map((f) => (
          <div key={f.label} className="flex items-center justify-between">
            <label className="text-sm text-foreground">{f.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={f.value}
                className="w-20 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="coral">Save Fee Settings</Button>
    </div>
  </motion.div>
);

const AdminSettings = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
      <h3 className="font-display font-semibold text-foreground">Platform Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Platform Name", value: "PrintFlow" },
          { label: "Support Email", value: "support@printflow.in" },
          { label: "Support Phone", value: "+91 1800 123 456" },
          { label: "Razorpay Key", value: "rzp_live_••••••••" },
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
      <Button variant="coral">Save Settings</Button>
    </div>
  </motion.div>
);

export default AdminDashboard;
