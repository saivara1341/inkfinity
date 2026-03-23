import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productType, businessName, tagline, phone, email, colors, style } = await req.json();
    // To remove Lovable dependency, we switch to a direct AI provider (e.g., OpenAI or Google Gemini)
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY not configured");

    const prompt = `Generate a professional ${productType || "visiting card"} design for an Indian business with these details:
- Business Name: ${businessName || "Sample Business"}
- Tagline: ${tagline || "Quality Service Since 2020"}
- Phone: ${phone || "+91 98765 43210"}
- Email: ${email || "info@business.com"}
- Color scheme: ${colors || "professional blue and white"}
- Style: ${style || "modern minimalist"}

Create a clean, print-ready design on a solid white background. Include the business name prominently, contact details, and a subtle decorative element.`;

    // Direct Integration (Example: OpenAI DALL-E or Google Gemini)
    // You should update this URL to your preferred provider's endpoint
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI API error:", status, text);
      throw new Error(`AI API error: ${status}`);
    }

    const data = await response.json();
    const images = data.data?.map((img: { url: string }) => img.url) || [];
    const text = "Design generated successfully.";

    return new Response(JSON.stringify({ images, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-design error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
