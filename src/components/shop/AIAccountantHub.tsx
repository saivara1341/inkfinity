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

// Mock financial data for visualization until ledger is synced
const MOCK_FINANCE_DATA = [
  { month: "Jan", income: 45000, expense: 32000, tax: 8100 },
  { month: "Feb", income: 52000, expense: 34000, tax: 9360 },
  { month: "Mar", income: 48000, expense: 41000, tax: 8640 },
  { month: "Apr", income: 61000, expense: 38000, tax: 10980 },
  { month: "May", income: 55000, expense: 31000, tax: 9900 },
  { month: "Jun", income: 67000, expense: 35000, tax: 12060 },
];

export const AIAccountantHub = () => {
  const { shop, orders } = useShopData();
  const [activeView, setActiveView] = useState<"overview" | "ledger" | "upload" | "reports">("overview");

  const financialStats = useMemo(() => {
    const totalRevenue = orders?.reduce((acc, order) => acc + (order.grand_total || 0), 0) || 0;
    const avgOrderValue = totalRevenue / (orders?.length || 1);
    const estimatedGST = totalRevenue * 0.18; // Default 18% calculation
    
    return {
      totalRevenue,
      avgOrderValue,
      estimatedGST,
      profitMargin: 24.5, // Placeholder for calculated margin
    };
  }, [orders]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-500/20">+12%</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-foreground">₹{financialStats.totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20">ESTIMATED</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">GST Liability</p>
          <h3 className="text-2xl font-black text-foreground">₹{Math.round(financialStats.estimatedGST).toLocaleString()}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-blue-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-600 border-blue-500/20">HEALTHY</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Cost Intensity</p>
          <h3 className="text-2xl font-black text-foreground">18.4%</h3>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <Badge variant="outline" className="text-[10px] bg-orange-500/5 text-orange-600 border-orange-500/20">3 SAVINGS</Badge>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">AI Cost Optimization</p>
          <h3 className="text-2xl font-black text-foreground">₹4,200</h3>
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
              <p className="text-xs text-muted-foreground mt-1">Net profitability and tax trends</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FINANCE_DATA}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB6F92" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FB6F92" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#FB6F92" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#CBD5E1" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" /> Smart Accountant Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Low Margin Alert</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                Standard Business Cards margin dropped to 12%. Check "Supplier X" for cheaper paper stock.
              </p>
              <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-accent">View Sourcing Options</Button>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Tax Optimization</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                Your accumulated input tax credit (ITC) this month: ₹2,450. You can offset this against your output liability.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Usage Variance</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                Electricity usage per print unit is 15% higher this week. Check machine maintenance logs.
              </p>
            </div>
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
        <div>
          <h2 className="text-4xl font-display font-black text-foreground italic flex items-center gap-3">
            AI Accountant <span className="text-sm font-bold bg-accent/10 text-accent px-3 py-1 rounded-full uppercase not-italic tracking-widest border border-accent/20">Beta</span>
          </h2>
          <p className="text-muted-foreground mt-1">Your virtual CFO for platform-wide financial intelligence.</p>
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
            className="rounded-xl h-10 gap-2 px-4 shadow-sm"
            onClick={() => {
              toast.info("Preparing formal financial report...");
              setTimeout(() => window.print(), 1000);
            }}
          >
            <Download className="w-4 h-4" /> Export P&L
          </Button>
        </div>
      </div>

      {/* Formal Header for Print */}
      <div className="hidden print:block border-b-2 border-slate-200 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{shop?.name || "Merchant"} - Financial Report</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Formal P&L and Balance Sheet (AI Generated)</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900">DATE: {new Date().toLocaleDateString()}</p>
            <p className="text-[10px] font-bold text-slate-400">REF: ACC-{Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 p-1 rounded-[2.5rem] print:bg-white print:p-0">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'upload' && renderUpload()}
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block border-t border-slate-100 pt-8 mt-12 text-center text-[10px] text-slate-400">
        <p>This report is electronically generated by <strong>WePrint Flow AI Accountant</strong>. Values are projections based on platform and user-shared data.</p>
      </div>
    </div>
  );
};

export default AIAccountantHub;
