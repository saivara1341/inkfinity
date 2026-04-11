import { supabase } from "@/integrations/supabase/client";

export interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  keyId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

class PaymentService {
  private keyId: string = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

  async initiateRazorpayPayment(options: PaymentOptions): Promise<any> {
    try {
      // 1. Create Order securely via Edge Function
      let orderData, functionError;
      
      try {
        const response = await supabase.functions.invoke('create-razorpay-order', {
          body: {
            amount: options.amount,
            currency: options.currency || "INR",
            receipt: `receipt_${options.orderId}`,
            notes: {
              customer_email: options.customerEmail,
              customer_phone: options.customerPhone
            }
          }
        });
        orderData = response.data;
        functionError = response.error;
      } catch (err: any) {
        console.warn("Standard Edge Function invoke failed, attempting direct fetch fallback...", err);
        
        // Manual Fetch Fallback (solves most connection issues)
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const fetchResponse = await fetch(`${baseUrl}/functions/v1/create-razorpay-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
            "apikey": anonKey,
          },
          body: JSON.stringify({
            amount: options.amount,
            currency: options.currency || "INR",
            receipt: `receipt_${options.orderId}`,
            notes: {
              customer_email: options.customerEmail,
              customer_phone: options.customerPhone
            }
          })
        });

        if (!fetchResponse.ok) {
          const errData = await fetchResponse.json().catch(() => ({}));
          throw new Error(errData.error || `Direct fetch failed with status ${fetchResponse.status}`);
        }
        
        orderData = await fetchResponse.json();
      }

      if (functionError) {
        console.error("Function Error Details:", functionError);
        throw new Error(functionError.message || "Failed to initialize payment gateway");
      }
      
      if (!orderData || !orderData.id) {
        console.error("Invalid response from function:", orderData);
        throw new Error("Invalid response from payment gateway");
      }

      return new Promise((resolve, reject) => {
        const razorpayOptions = {
          key: options.keyId || this.keyId,
          amount: orderData.amount, // from edge function
          currency: orderData.currency,
          name: "PrintFlow",
          description: `Order #${options.orderId}`,
          image: "/favicon.png",
          order_id: orderData.id, // Secure order ID from Razorpay
          handler: async (response: any) => {
            try {
              // Log payment success in Supabase
              const { error } = await supabase
                .from("orders")
                .update({ 
                  payment_status: "paid",
                  payment_id: response.razorpay_payment_id,
                  status: "confirmed"
                })
                .filter("order_number", "ilike", `${options.orderId}%`);

              if (error) throw error;
              resolve(response);
            } catch (err) {
              reject(err);
            }
          },
          prefill: {
            name: options.customerName,
            email: options.customerEmail,
            contact: options.customerPhone,
          },
          theme: {
            color: "#e8613a", // PrintFlow Brand Color
          },
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.on("payment.failed", (response: any) => {
          reject(new Error(response.error.description));
        });
        rzp.open();
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      throw error;
    }
  }
}


export const paymentService = new PaymentService();
