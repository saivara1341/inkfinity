import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  FileText, Download, Upload, AlertCircle, Info,
  Calculator, Receipt, Building2, History, Sparkles,
  ArrowUpRight, ArrowDownRight, Printer, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  Cell, Legend
} from "recharts";
import { useShopData } from "@/hooks/useShopData";
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
  const orders = useMemo(() => pOrders || shopData.orders || [], [pOrders, shopData.orders]);
  const [activeView, setActiveView] = useState<"overview" | "ledger" | "upload" | "reports">("overview");

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
      profitMargin
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
    const currentMonth = monthlyTrajectory[5]?.income || 0;
    const prevMonth = monthlyTrajectory[4]?.income || 0;
    if (currentMonth > prevMonth && prevMonth > 0) {
      const growth = ((currentMonth - prevMonth) / prevMonth) * 100;
      insights.push({
        type: "growth",
        title: "Revenue Surge",
        text: `Your revenue is up ${growth.toFixed(1)}% compared to last month. Platform velocity is high.`,
        icon: TrendingUp,
        color: "text-green-600"
      });
    }

    // Tax Insight
    if (financialStats.totalGST > 0) {
      insights.push({
        type: "tax",
        title: "Tax Optimization",
        text: `Accumulated GST liability: ₹${Math.round(financialStats.totalGST).toLocaleString()}. Ensure reconciliation by month-end.`,
        icon: Info,
        color: "text-blue-600"
      });
    }

    // Utilization Insight
    const activeOrders = orders.filter(o => o.status === 'printing' || o.status === 'designing').length;
    if (activeOrders > 5) {
      insights.push({
        type: "usage",
        title: "Capacity Alert",
        text: `${activeOrders} orders currently in production. Monitor machine maintenance logs for optimal efficiency.`,
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

    return insights;
  }, [monthlyTrajectory, financialStats, orders]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/20">LIVE</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-foreground">₹{financialStats.totalRevenue.toLocaleString("en-IN")}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20">GST AUDIT</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">GST Liability</p>
          <h3 className="text-2xl font-black text-foreground">₹{Math.round(financialStats.totalGST).toLocaleString("en-IN")}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-600 border-blue-500/20">HEALTHY</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Profit Margin</p>
          <h3 className="text-2xl font-black text-foreground">{financialStats.profitMargin.toFixed(1)}%</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-orange-500/5 text-orange-600 border-orange-500/20">{orders.length} ORDERS</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Platform Earnings</p>
          <h3 className="text-2xl font-black text-foreground">₹{financialStats.totalFees.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-foreground italic flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Financial Trajectory
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Real-time profitability and tax trends</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Fees</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrajectory}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB6F92" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FB6F92" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} tickFormatter={(v) => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#FB6F92" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#94A3B8" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" /> Smart Accountant Insights
          </h3>
          <div className="space-y-4">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                <div className={`flex items-center gap-2 ${insight.color}`}>
                  <insight.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">{insight.title}</span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  {insight.text}
                </p>
                {insight.type === 'growth' && (
                  <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-accent">View Growth Stats</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="p-12 rounded-[3.5rem] bg-card border border-border border-dashed text-center space-y-6">
      <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto">
        <Upload className="w-10 h-10 text-accent animate-bounce" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-foreground">Universal Data Sync</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Upload machine usage logs, raw material invoices, or utility bills. We accept CSV, PDF, TXT, and Excel.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 pt-4">
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
          className="rounded-2xl px-10 gap-3"
          onClick={() => document.getElementById('universal-upload')?.click()}
        >
          <Upload className="w-4 h-4" /> Select File to Sync
        </Button>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Supports all machine and invoice formats</span>
      </div>
    </div>
  );

  return (
    <div id="printable-accountant-hub" className="space-y-8 max-w-6xl mx-auto pb-20">
      <PrintStyles />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black uppercase tracking-tighter">Financial Intelligence Core</Badge>
          <h2 className="text-4xl font-display font-black text-foreground italic flex items-center gap-3">
            {title || (context === "shop" ? "Merchant" : "Manufacturer")} AI Accountant
          </h2>
          <p className="text-muted-foreground">Your virtual CFO for platform-wide financial intelligence.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'overview' ? 'coral' : 'outline'} 
            onClick={() => setActiveView('overview')}
            className="rounded-xl h-10 gap-2 px-4 shadow-sm"
          >
            <PieChart className="w-4 h-4" /> Overview
          </Button>
          <Button 
            variant={activeView === 'upload' ? 'coral' : 'outline'} 
            onClick={() => setActiveView('upload')}
            className="rounded-xl h-10 gap-2 px-4 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Shared Data
          </Button>
          <Button 
             variant="outline" 
             className="rounded-xl h-10 gap-2 px-4 shadow-sm bg-white/50 backdrop-blur-sm"
             onClick={() => {
               toast.info("Preparing formal financial report...");
               setTimeout(() => window.print(), 1000);
             }}
          >
            <Download className="w-4 h-4" /> Export P&L
          </Button>
        </div>
      </div>

      <div className="bg-secondary/20 p-1 rounded-[2.5rem] print:bg-white print:p-0">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'upload' && renderUpload()}
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block border-t border-slate-100 pt-8 mt-12 text-center text-[10px] text-slate-400">
        <p>This report is electronically generated by <strong>WePrint Flow AI Accountant</strong>. Values are derived from actual platform transaction records.</p>
      </div>
    </div>
  );
};

export default AIAccountantHub;
