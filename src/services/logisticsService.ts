import { supabase } from "@/integrations/supabase/client";

export interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingDetails {
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string;
  events: TrackingEvent[];
}

class LogisticsService {
  /**
   * Simulates fetching real-time tracking from a provider like Shiprocket or Delhivery
   */
  async getTrackingDetails(trackingNumber: string, carrier: string = "Delhivery"): Promise<TrackingDetails | null> {
    if (!trackingNumber) return null;

    // In a real app, this would be an API call to our backend which proxies to the carrier
    // For now, we simulate realistic tracking events based on the tracking number
    
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const dayBefore = new Date(now); dayBefore.setDate(now.getDate() - 2);

    // Mock response
    return {
      tracking_number: trackingNumber,
      carrier: carrier,
      status: "In Transit",
      estimated_delivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          status: "In Transit",
          location: "Regional Hub, Mumbai",
          timestamp: now.toISOString(),
          description: "Package is currently in transit to the destination city."
        },
        {
          status: "Processed",
          location: "Sorting Center, Mumbai",
          timestamp: yesterday.toISOString(),
          description: "Package has been sorted and processed."
        },
        {
          status: "Picked Up",
          location: "Merchant Location, Bengaluru",
          timestamp: dayBefore.toISOString(),
          description: "Package picked up by courier partner."
        }
      ]
    };
  }

  /**
   * Updates order with tracking info (Admin/Shop usage)
   */
  async updateTrackingInfo(orderId: string, trackingNumber: string, carrier: string) {
    const trackingUrl = this.getTrackingUrl(trackingNumber, carrier);
    
    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        courier_partner: carrier,
        tracking_url: trackingUrl,
        status: 'shipped'
      })
      .eq("id", orderId);

    return { error };
  }

  private getTrackingUrl(num: string, carrier: string): string {
    const urls: Record<string, string> = {
      "Delhivery": `https://www.delhivery.com/track/package/${num}`,
      "Shiprocket": `https://www.shiprocket.in/shipment-tracking/${num}`,
      "BlueDart": `https://www.bluedart.com/maintracking.html?trackNo=${num}`,
    };
    return urls[carrier] || "#";
  }
}

export const logisticsService = new LogisticsService();
