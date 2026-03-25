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
  private keyId: string = import.meta.env.VITE_RAZORPAY_KEY_ID;

  async initiateRazorpayPayment(options: PaymentOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: options.keyId || this.keyId,
        amount: options.amount * 100, // Amount in paise
        currency: options.currency,
        name: "PrintFlow",
        description: `Order #${options.orderId}`,
        image: "/favicon.png",
        order_id: "", // This should ideally be created on server, using direct checkout for now
        handler: async (response: any) => {
          try {
            // Log payment success in Supabase
            const { error } = await supabase
              .from("orders")
              .update({ 
                payment_status: "paid",
                payment_id: response.razorpay_payment_id,
                status: "processing"
              })
              .eq("id", options.orderId);

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
  }
}

export const paymentService = new PaymentService();
