import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, Check, X, Clock, MessageSquare, 
  IndianRupee, Calendar, User, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { logisticsApi } from "@/services/logisticsApi";
import { ShippingLabel } from "./ShippingLabel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SupplierQuotesProps {
  supplierId: string;
}

export const SupplierQuotes = ({ supplierId }: SupplierQuotesProps) => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [printingQuote, setPrintingQuote] = useState<any | null>(null);
  const [fulfillmentQuote, setFulfillmentQuote] = useState<any | null>(null);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err: any) {
      toast.error("Error fetching quotes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [supplierId]);

  const handleUpdateStatus = async (quoteId: string, status: string, vendorNotes?: string) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status, vendor_notes: vendorNotes, updated_at: new Date().toISOString() })
        .eq("id", quoteId);

      if (error) throw error;
      toast.success(`Quote ${status} successfully`);
      fetchQuotes();
    } catch (err: any) {
      toast.error("Failed to update: " + err.message);
    }
  };

  const handleManualFulfill = async () => {
    if (!fulfillmentQuote || !courierName || !trackingNumber) {
      toast.error("Please provide both Courier Name and Tracking Number");
      return;
    }
    
    setIsFulfilling(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ 
          status: 'shipped', 
          tracking_number: trackingNumber,
          courier_partner: courierName,
          updated_at: new Date().toISOString() 
        })
        .eq("id", fulfillmentQuote.id);

      if (error) throw error;
      
      toast.success(`Shipment created via ${courierName}! Tracking: ${trackingNumber}`);
      setFulfillmentQuote(null);
      setCourierName("");
      setTrackingNumber("");
      fetchQuotes();
    } catch (err: any) {
      toast.error("Fulfillment failed: " + err.message);
    } finally {
      setIsFulfilling(false);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesFilter = filter === "all" || q.status === filter;
    const matchesSearch = q.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 uppercase text-[10px]">New Inquiry</Badge>;
      case 'quoted': return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 uppercase text-[10px]">Price Sent</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 uppercase text-[10px]">Order Confirmed</Badge>;
      case 'shipped': return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 uppercase text-[10px]">In Transit</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 uppercase text-[10px]">Rejected</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2">
          {["all", "requested", "quoted", "accepted"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "coral" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="capitalize rounded-full px-4"
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9 bg-white rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center animate-pulse text-muted-foreground">Loading inquiries...</div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground font-medium">No quote requests found</p>
          <p className="text-sm text-muted-foreground mt-1">When customers request bulk pricing, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredQuotes.map((quote) => (
              <motion.div
                key={quote.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[1.5rem] border border-border p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        {getStatusBadge(quote.status)}
                        <h4 className="text-xl font-bold text-foreground mt-2">{quote.product_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(quote.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5 font-bold text-foreground"><User className="w-4 h-4" /> Qty: {quote.quantity.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Estimated Budget</p>
                        <p className="text-xl font-display font-bold text-foreground">₹{quote.specifications?.grandTotal?.toLocaleString() || "TBD"}</p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Specifications</p>
                      <p className="text-sm text-foreground leading-relaxed">{quote.specifications?.details || "No special instructions provided."}</p>
                    </div>

                    {quote.vendor_notes && (
                      <div className="flex gap-2 items-start text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-blue-700">Your Response:</p>
                          <p className="text-blue-600">{quote.vendor_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 justify-center border-l border-border pl-6 min-w-[160px]">
                    {quote.status === "requested" && (
                      <>
                        <Button 
                          variant="coral" 
                          className="w-full gap-2 rounded-xl"
                          onClick={() => {
                            const price = prompt("Enter your quoted price (Grand Total in ₹):", quote.specifications?.grandTotal || "");
                            if (price) handleUpdateStatus(quote.id, 'quoted', `We can offer this at ₹${price}. Total lead time: 7 days.`);
                          }}
                        >
                          <IndianRupee className="w-4 h-4" /> Send Quote
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => handleUpdateStatus(quote.id, 'rejected', 'Sorry, we cannot fulfill this order at the moment.')}
                        >
                          <X className="w-4 h-4" /> Decline
                        </Button>
                      </>
                    )}
                    {quote.status === "accepted" && (
                      <Button 
                        variant="coral" 
                        className="w-full gap-2 rounded-xl h-12"
                        onClick={() => {
                          setFulfillmentQuote(quote);
                          setCourierName("");
                          setTrackingNumber("");
                        }}
                      >
                        Create Shipment
                      </Button>
                    )}
                    {quote.status === "shipped" && (
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 rounded-xl text-xs h-9 bg-success/5 border-success/20 text-success"
                          onClick={() => setPrintingQuote(quote)}
                        >
                          <FileText className="w-3 h-3" /> Print Label
                        </Button>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">Tracking ID</p>
                          <p className="text-xs font-mono font-bold">{quote.tracking_number}</p>
                        </div>
                      </div>
                    )}
                    {quote.status === "quoted" && (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2 text-success">
                          <Check className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-success uppercase">Response Sent</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Waiting for customer</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!printingQuote} onOpenChange={() => setPrintingQuote(null)}>
        <DialogContent className="max-w-fit p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Shipping Label</DialogTitle>
          </DialogHeader>
          {printingQuote && (
            <div className="p-8">
              <ShippingLabel 
                order={printingQuote} 
                supplierName="PrintFlow Verified Partner" 
              />
              <Button 
                variant="coral" 
                className="w-full mt-4 rounded-xl"
                onClick={() => window.print()}
              >
                Download PDF Label
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!fulfillmentQuote} onOpenChange={(open) => !open && setFulfillmentQuote(null)}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Assign Courier Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Partner (e.g., VRL, Delhivery, Local Transport)</label>
              <Input 
                placeholder="Enter courier name" 
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number / LR No.</label>
              <Input 
                placeholder="Enter tracking ID" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <Button 
              variant="coral" 
              className="w-full mt-4" 
              onClick={handleManualFulfill}
              disabled={isFulfilling || !courierName || !trackingNumber}
            >
              {isFulfilling ? "Confirming..." : "Confirm Shipment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

