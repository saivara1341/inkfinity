import { supabase } from "@/integrations/supabase/client";
import { calculateNetEarnings } from "@/utils/algorithms";

export interface FinancialMetric {
  date: string;
  income: number;
  expense: number;
  tax: number;
  profit: number;
}

export const getFinancialSummary = async (shopId: string) => {
  // 1. Fetch Sales Income
  const { data: sales, error: salesError } = await supabase
    .from("orders")
    .select("grand_total, created_at, product_category")
    .eq("shop_id", shopId)
    .eq("payment_status", "paid");

  if (salesError) throw salesError;

  // 2. Fetch Procurement Expenses (Quotes)
  // Assuming quotes where status is 'accepted' or 'paid' represent expenses
  const { data: procurement, error: procurementError } = await supabase
    .from("quotations")
    .select("grand_total, created_at, status")
    .eq("shop_id", shopId)
    .eq("status", "accepted");

  if (procurementError) throw procurementError;

  // 3. Process data into monthly buckets (last 6 months)
  // This logic would normally use the finance_ledger table if it existed,
  // but for now we aggregate dynamically.
  
  const revenue = sales.reduce((acc, curr) => acc + curr.grand_total, 0);
  const costs = procurement.reduce((acc, curr) => acc + curr.grand_total, 0);
  
  return {
    revenue,
    costs,
    taxEstimate: revenue * 0.18,
    grossProfit: revenue - costs,
  };
};

export const getCostOptimizationSuggestions = async (shopId: string) => {
  // Logic to compare current sourcing prices with available supplier products
  // Mocking for now to demonstrate the "AI" capability
  return [
    {
      type: "Material Saving",
      message: "You can save 8% on 300GSM Glossy Paper by switching to Manufacturer 'SwiftPrint Mills'.",
      impact: "₹1,200/month",
      actionLink: "/sourcing?query=300gsm"
    },
    {
      type: "Usage Alert",
      message: "Your ink wastage has increased by 15% in the last 10 days. Recalibrate machine 'Canon-X1'.",
      impact: "High Waste",
      actionLink: "/inventory"
    }
  ];
};
