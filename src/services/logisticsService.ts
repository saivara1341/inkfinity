import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShippingRate {
  provider: string;
  service_name: string;
  rate: number;
  estimated_days: number;
  tracking_available: boolean;
}

export const LogisticsService = {
  /**
   * Calculates real-time shipping rates based on pickup and delivery pincodes.
   * In production, this would call the Shiprocket/Delhivery API via an Edge Function.
   */
  async getShippingRates(
    fromPincode: string,
    toPincode: string,
    weightKg: number = 0.5
  ): Promise<ShippingRate[]> {
    console.log(`Calculating logistics from ${fromPincode} to ${toPincode}...`);
    
    // Mocking real-time calculation logic
    // Distance Factor: Simplified as the difference in first digits (Zones)
    const zoneDiff = Math.abs(parseInt(fromPincode[0]) - parseInt(toPincode[0]));
    const baseRate = 59;
    const distancePrice = zoneDiff * 25;
    const weightPrice = weightKg > 1 ? (weightKg - 1) * 30 : 0;
    
    const finalRate = baseRate + distancePrice + weightPrice;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        provider: "Shiprocket",
        service_name: "Standard Delivery",
        rate: finalRate,
        estimated_days: 3 + zoneDiff,
        tracking_available: true
      },
      {
        provider: "Delhivery",
        service_name: "Express (Air)",
        rate: finalRate + 40,
        estimated_days: 1 + Math.min(1, zoneDiff),
        tracking_available: true
      },
      {
        provider: "Shop Delivery",
        service_name: "Local Pickup/Native",
        rate: 0,
        estimated_days: 2,
        tracking_available: false
      }
    ];
  },

  /**
   * Generates a tracking URL based on provider and tracking ID
   */
  getTrackingUrl(provider: string, trackingId: string): string {
    switch (provider.toLowerCase()) {
      case 'shiprocket':
        return `https://www.shiprocket.in/shipment-tracking/${trackingId}`;
      case 'delhivery':
        return `https://www.delhivery.com/track/package/${trackingId}`;
      default:
        return '#';
    }
  },

  /**
   * Updates order status with tracking information
   */
  async attachTracking(orderId: string, provider: string, trackingId: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        shipping_status: 'shipped',
        shipping_provider: provider,
        tracking_id: trackingId,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      toast.error("Failed to update tracking info");
      throw error;
    }
    
    toast.success(`Tracking ID ${trackingId} attached!`);
  }
};
