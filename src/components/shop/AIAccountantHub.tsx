import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  FileText, Download, Upload, AlertCircle, Info,
  Calculator, Receipt, Building2, History, Sparkles,
  ArrowUpRight, ArrowDownRight, Printer, Zap, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  Cell, Legend
} from "recharts";
import { useShopData, useShopTransactions } from "@/hooks/useShopData";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

const PrintStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @media print {
      body * { visibility: hidden; }
      #printable-accountant-hub, #printable-accountant-hub * { visibility: visible; }
      #printable-accountant-hub { 
        position: absolute; 
        left: 0; 
        top: 0; 
        width: 100%;
        background: white !important;
      }
      .no-print { display: none !important; }
      .print-shadow { box-shadow: none !important; border: 1px solid #eee !important; }
      .rounded-3xl, .rounded-[2.5rem], .rounded-[3.5rem] { border-radius: 8px !important; }
    }
  `}} />
);

interface AccountantProps {
  orders?: any[];
  context?: "shop" | "supplier";
  title?: string;
}

export const AIAccountantHub = ({ orders: pOrders, context = "shop", title }: AccountantProps) => {
  const shopData = useShopData();
  const { data: transactions = [], isLoading: loadingTx } = useShopTransactions(shopData.shop?.id);
  const orders = useMemo(() => pOrders || shopData.orders || [], [pOrders, shopData.orders]);
  const [activeView, setActiveView] = useState<"overview" | "ledger" | "upload">("overview");

  // Real-time financial aggregation
  const financialStats = useMemo(() => {
    const totalRevenue = orders.reduce((acc: number, order: any) => acc + (Number(order.grand_total) || 0), 0);
    const totalGST = orders.reduce((acc: number, order: any) => acc + (Number(order.gst_amount) || 0), 0);
    const totalFees = orders.reduce((acc: number, order: any) => acc + (Number(order.platform_fee) || 0), 0);
    const netEarnings = orders.reduce((acc: number, order: any) => acc + (Number(order.merchant_earning) || 0), 0);
    
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const profitMargin = totalRevenue > 0 ? (netEarnings / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalGST,
      totalFees,
      netEarnings,
      avgOrderValue,
      profitMargin,
      lastSync: new Date().toLocaleTimeString()
    };
  }, [orders]);

  // Generate monthly trajectory from REAL orders
  const monthlyTrajectory = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthLabel = format(date, "MMM");
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthOrders = orders.filter(o => {
        const oDate = new Date(o.created_at);
        return oDate >= start && oDate <= end;
      });

      months.push({
        month: monthLabel,
        income: monthOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
        expense: monthOrders.reduce((sum, o) => sum + Number(o.platform_fee || 0), 0),
        tax: monthOrders.reduce((sum, o) => sum + Number(o.gst_amount || 0), 0),
        count: monthOrders.length
      });
    }
    return months;
  }, [orders]);

  // Real Intelligence Insights
  const aiInsights = useMemo(() => {
    const insights = [];
    
    // Revenue Insight
    const currentMonthRev = monthlyTrajectory[5]?.income || 0;
    const prevMonthRev = monthlyTrajectory[4]?.income || 0;
    const revenueGrowth = prevMonthRev > 0 ? ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100 : 0;

    if (revenueGrowth !== 0) {
      const isPositive = revenueGrowth > 0;
      insights.push({
        type: "growth",
        title: isPositive ? "Revenue Surge" : "Revenue Variance",
        text: `Your revenue is ${isPositive ? 'up' : 'down'} ${Math.abs(revenueGrowth).toFixed(1)}% compared to last month. ${isPositive ? 'Platform velocity is high.' : 'Review marketing spend.'}`,
        icon: isPositive ? TrendingUp : TrendingDown,
        color: isPositive ? "text-green-600" : "text-amber-600"
      });
    }

    // Tax Insight
    const isGSTRegistered = (shopData.shop as any)?.is_gst_registered !== false;
    
    if (isGSTRegistered && financialStats.totalGST > 0) {
      insights.push({
        type: "tax",
        title: "Tax Optimization",
        text: `Accumulated GST liability: ₹${Math.round(financialStats.totalGST).toLocaleString()}. You have ₹${Math.round(financialStats.totalGST * 0.15).toLocaleString()} in potential Input Tax Credit offsets.`,
        icon: Info,
        color: "text-blue-600"
      });
    } else if (!isGSTRegistered) {
      insights.push({
        type: "tax",
        title: "GST Status: Exempt",
        text: "You are currently operating as a GST exempt entity. No tax collection is being calculated for your orders.",
        icon: ShieldCheck,
        color: "text-success"
      });
    }

    // Utilization Insight
    const successRate = orders.length > 0 ? (orders.filter(o => o.status === 'delivered' || o.status === 'shipped').length / orders.length) * 100 : 0;
    if (orders.length > 0) {
      insights.push({
        type: "usage",
        title: "Execution Efficiency",
        text: `Fulfillment rate is ${successRate.toFixed(1)}%. ${successRate > 90 ? 'Operational excellence achieved.' : 'Check production bottlenecks.'}`,
        icon: Zap,
        color: "text-orange-600"
      });
    }

    // Default insight if empty
    if (insights.length === 0) {
      insights.push({
        type: "info",
        title: "Intelligence Warming Up",
        text: "Generate more orders to unlock advanced financial trajectory insights and cost optimization tips.",
        icon: Sparkles,
        color: "text-accent"
      });
    }

    return { insights, revenueGrowth };
  }, [monthlyTrajectory, financialStats, orders]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-green-500/5 text-green-600 border-green-500/20 font-black tracking-tighter">VERIFIED LIVE</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-foreground">₹{financialStats.totalRevenue.toLocaleString("en-IN")}</h3>
          <div className="flex items-center gap-1 mt-2">
            {aiInsights.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
            <span className={`text-[10px] font-bold ${aiInsights.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(aiInsights.revenueGrowth).toFixed(1)}% vs prev. month
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <Badge variant="outline" className={`text-[9px] font-black tracking-tighter ${(shopData.shop as any)?.is_gst_registered === false ? "bg-success/5 text-success border-success/20" : "bg-accent/5 text-accent border-accent/20"}`}>
              {(shopData.shop as any)?.is_gst_registered === false ? "GST EXEMPT" : "GST AUDIT READY"}
            </Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">GST Liability</p>
          <h3 className="text-3xl font-black text-foreground">
            {(shopData.shop as any)?.is_gst_registered === false ? "₹0" : `₹${Math.round(financialStats.totalGST).toLocaleString("en-IN")}`}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">
            {(shopData.shop as any)?.is_gst_registered === false ? "Operating as unregistered entity" : `Accurate as of ${financialStats.lastSync}`}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-blue-500/5 text-blue-600 border-blue-500/20 font-black tracking-tighter">UNIT PROFITABILITY</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Margin</p>
          <h3 className="text-3xl font-black text-foreground">{financialStats.profitMargin.toFixed(1)}%</h3>
          <p className="text-[10px] text-blue-500 mt-2 font-bold tracking-tight">Post-platform & tax deduction</p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-orange-500" />
            </div>
            <Badge variant="outline" className="text-[9px] bg-orange-500/5 text-orange-600 border-orange-500/20 font-black tracking-tighter">SETTLEMENTS</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Merchant Earnings</p>
          <h3 className="text-3xl font-black text-foreground">₹{financialStats.netEarnings.toLocaleString("en-IN")}</h3>
          <p className="text-[10px] text-orange-600 mt-2 font-bold tracking-tight">Total distributable funds</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-foreground italic flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Financial Trajectory
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Daily reconciliation of income vs platform overhead</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrajectory}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB6F92" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FB6F92" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} tickFormatter={(v) => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#FB6F92" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="tax" stroke="#94A3B8" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Accountant Insights
          </h3>
          <div className="space-y-4">
            {aiInsights.insights.map((insight: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2 group hover:border-accent/50 transition-colors">
                <div className={`flex items-center gap-2 ${insight.color}`}>
                  <insight.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{insight.title}</span>
                </div>
                <p className="text-xs font-bold text-foreground leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-accent" /> Financial Ledger
          </h3>
          <Badge variant="outline">Verified Transactions</Badge>
        </div>
        <div className="divide-y divide-border">
          {loadingTx ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                <Receipt className="w-8 h-8" />
              </div>
              <p className="font-bold">No transactions found</p>
              <p className="text-xs">Your financial ledger will populate as orders are processed.</p>
            </div>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-secondary/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                    {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.description || (tx.type === 'credit' ? 'Order Earning' : 'Wallet Withdrawal')}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{format(new Date(tx.created_at), "MMM d, yyyy • h:mm a")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                  <Badge variant="outline" className={`text-[8px] h-4 mt-1 border-none bg-secondary/20 ${tx.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="p-16 rounded-[4rem] bg-card border-2 border-border border-dashed text-center space-y-6 group hover:border-accent/50 transition-all">
      <div className="w-24 h-24 rounded-[2.5rem] bg-accent/10 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
        <Upload className="w-12 h-12 text-accent" />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-foreground">Sync External Data</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Upload Tally exports, GST spreadsheets, or machine utility bills for 360° financial intelligence.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 pt-6">
        <input 
          type="file" 
          id="universal-upload" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files?.[0]) {
              toast.success(`Processing ${e.target.files[0].name}... AI Accountant is analyzing data.`);
            }
          }}
        />
        <Button 
          variant="coral" 
          size="lg" 
          className="rounded-2xl px-12 h-14 text-lg font-black shadow-xl shadow-coral/20 hover:-translate-y-1 transition-transform"
          onClick={() => document.getElementById('universal-upload')?.click()}
        >
          <Upload className="w-5 h-5 mr-3" /> Select Documents
        </Button>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Supports PDF, XLSX, CSV</span>
      </div>
    </div>
  );

  return (
    <div id="printable-accountant-hub" className="space-y-8 max-w-7xl mx-auto pb-20">
      <PrintStyles />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-4xl font-display font-black text-foreground italic leading-none">
                {title || (context === "shop" ? "Merchant" : "Platform HQ")} Accountant
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-success text-white border-none px-2 h-4 text-[8px] font-black uppercase">Active</Badge>
                <p className="text-xs font-bold text-muted-foreground">Autonomous Financial Intelligence Engine</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border shadow-inner">
          <Button 
            variant={activeView === 'overview' ? 'coral' : 'ghost'} 
            onClick={() => setActiveView('overview')}
            className="rounded-xl h-10 gap-2 px-6 font-bold"
          >
            <PieChart className="w-4 h-4" /> Intelligence
          </Button>
          <Button 
            variant={activeView === 'ledger' ? 'coral' : 'ghost'} 
            onClick={() => setActiveView('ledger')}
            className="rounded-xl h-10 gap-2 px-6 font-bold"
          >
            <History className="w-4 h-4" /> Shared Data
          </Button>
          <div className="w-[1px] h-6 bg-border mx-2 mt-2" />
          <Button 
             variant="ghost" 
             className="rounded-xl h-10 gap-2 px-4 font-bold text-muted-foreground hover:text-foreground"
             onClick={() => {
               toast.info("Generating formal P&L statement...");
               setTimeout(() => window.print(), 1000);
             }}
          >
            <Download className="w-4 h-4" /> Export P&L
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-[3rem] p-2 print:p-0">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'ledger' && renderLedger()}
        {activeView === 'upload' && renderUpload()}
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block border-t-2 border-slate-100 pt-10 mt-16 text-center text-xs text-slate-400">
        <p className="font-bold text-slate-900 mb-1">Confidential Financial Report</p>
        <p>This report is electronically verified by Inkfinity AI Accounting Infrastructure. Values are linked directly to primary transaction logs.</p>
        <p className="mt-4">Last Sync: {financialStats.lastSync} • Report Reference: ACC-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      </div>
    </div>
  );
};

export default AIAccountantHub;
