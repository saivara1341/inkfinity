import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } })
  }

  try {
    const signature = req.headers.get("x-razorpay-signature")
    const bodyText = await req.text()

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      throw new Error("Missing signature or secret")
    }

    // Verify signature
    const hmac = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signed = await crypto.subtle.sign(
      "HMAC",
      hmac,
      new TextEncoder().encode(bodyText)
    )
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature")
    }

    const payload = JSON.parse(bodyText)
    const event = payload.event

    if (event === "payment.captured" || event === "order.paid") {
      let cleanOrderId = orderId;
      if (cleanOrderId && cleanOrderId.startsWith('receipt_')) {
        cleanOrderId = cleanOrderId.replace('receipt_', '');
      }
      
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      
      const { error } = await supabase
        .from("orders")
        .update({ 
          payment_status: "paid",
          status: "confirmed"
        })
        .filter("order_number", "ilike", `${cleanOrderId}%`)

      if (error) throw error
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    })
  }
})
