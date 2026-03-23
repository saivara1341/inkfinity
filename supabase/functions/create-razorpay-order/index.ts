import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } })
  }

  try {
    const { amount, currency, receipt, notes } = await req.json()

    if (!amount || !currency || !receipt) {
      throw new Error("Missing required parameters")
    }

    // Convert amount to paisa (Razorpay requirement)
    const amountInPaisa = Math.round(amount * 100)

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      },
      body: JSON.stringify({
        amount: amountInPaisa,
        currency,
        receipt,
        notes: {
          ...notes,
          platform: "PrintFlow"
        }
      })
    })

    const order = await response.json()

    if (!response.ok) {
      console.error("Razorpay Error:", order)
      throw new Error(order.error?.description || "Failed to create Razorpay order")
    }

    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 400
    })
  }
})
