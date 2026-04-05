/**
 * PrintFlow Intelligent Engine (PIE)
 * Advanced algorithms for shop ranking, pricing, and business intelligence.
 */

interface Shop {
  id: string;
  name: string;
  rating: number;
  is_verified: boolean;
  city: string;
  turnaround_days?: number;
}

interface Product {
  id: string;
  base_price: number;
  shop_id: string;
}

/**
 * Calculates a composite score for a shop based on multiple quality factors.
 * Weights: 40% Rating, 30% Verification, 30% Turnaround Speed.
 */
export const calculateShopScore = (shop: Shop): number => {
  const ratingWeight = 0.4;
  const verificationWeight = 0.3;
  const speedWeight = 0.3;

  // Normalized rating (0 to 1)
  const normalizedRating = (shop.rating || 4.0) / 5;

  // Verification bonus
  const verificationScore = shop.is_verified ? 1 : 0.5;

  // Turnaround speed score (Lower days is better)
  // Assume 1 day = 1.0 score, 7+ days = 0.2 score
  const turnaround = shop.turnaround_days || 3;
  const speedScore = Math.max(0.2, 1 - (turnaround - 1) * 0.15);

  const totalScore = 
    (normalizedRating * ratingWeight) + 
    (verificationScore * verificationWeight) + 
    (speedScore * speedWeight);

  return parseFloat(totalScore.toFixed(2));
};

/**
 * Finds the "Best Match" shop from a list using the PIE Ranking Algorithm.
 */
export const rankShops = (shops: Shop[], userCity?: string): Shop[] => {
  return [...shops].sort((a, b) => {
    let scoreA = calculateShopScore(a);
    let scoreB = calculateShopScore(b);

    // City proximity bonus (20% boost for local shops)
    if (userCity) {
      if (a.city?.toLowerCase() === userCity.toLowerCase()) scoreA += 0.2;
      if (b.city?.toLowerCase() === userCity.toLowerCase()) scoreB += 0.2;
    }

    return scoreB - scoreA;
  });
};

/**
 * Centralized Pricing Engine for PrintFlow.
 * Handles base price, material multipliers, finish addons, and quantity tiers.
 */
export const calculatePrintingPrice = (
  basePrice: number,
  quantity: number,
  multipliers: { paper?: number; size?: number } = {},
  addons: number = 0,
  quantityTiers: { min: number; pricePerUnit: number }[] = []
): number => {
  // 1. Find applicable tier price if available
  let unitPrice = basePrice;
  if (quantityTiers.length > 0) {
    const sortedTiers = [...quantityTiers].sort((a, b) => b.min - a.min);
    const applicableTier = sortedTiers.find(t => quantity >= t.min);
    if (applicableTier) {
      unitPrice = applicableTier.pricePerUnit;
    }
  }

  // 2. Apply multipliers (Geometrically)
  const paperMult = multipliers.paper || 1;
  const sizeMult = multipliers.size || 1;
  
  // 3. Addon flat fees per unit
  const finalUnitCost = (unitPrice * paperMult * sizeMult) + addons;

  // 4. Total and Rounding
  const total = finalUnitCost * quantity;
  return Math.ceil(total); // Always round up for printing quotes
};

/**
 * RFM Scoring Algorithm for Shop CRM.
 * Recency (days since last order), Frequency (count), Monetary (total spend).
 */
export const calculateCustomerLTVRank = (
  totalSpend: number,
  orderCount: number,
  daysSinceLastOrder: number
): "Diamond" | "Platinum" | "Gold" | "Silver" | "New" => {
  // Simple heuristic for Indian market
  if (totalSpend > 50000 || (orderCount > 20 && daysSinceLastOrder < 30)) return "Diamond";
  if (totalSpend > 15000 || orderCount > 10) return "Platinum";
  if (totalSpend > 5000 || orderCount > 3) return "Gold";
  if (totalSpend > 1000 || orderCount > 1) return "Silver";
  return "New";
};
/**
 * Marketplace 2.0 Commission & Financial Engine.
 * Standardized 15% platform commission + 18% GST on commission.
 */
export const calculateNetEarnings = (
  salePrice: number,
  category: string = "general"
): { gross: number; commission: number; taxOnCommission: number; net: number } => {
  // Tiered commission (Diginaat style)
  const TIERED_RATES: Record<string, number> = {
    premium: 0.20, // High-end branding
    bulk: 0.10,    // Large scale banners
    general: 0.15  // Standard products
  };

  const rate = TIERED_RATES[category] || TIERED_RATES.general;
  const commission = salePrice * rate;
  const taxOnCommission = commission * 0.18; // GST on Platform Service
  const net = salePrice - commission - taxOnCommission;

  return {
    gross: Math.round(salePrice),
    commission: Math.round(commission),
    taxOnCommission: Math.round(taxOnCommission),
    net: Math.round(net)
  };
};
