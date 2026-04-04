import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHATSAPP_API = "https://graph.facebook.com/v21.0";

// Helper to send WhatsApp messages
async function sendMessage(phoneNumberId: string, token: string, to: string, text: string) {
  await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
}

async function sendInteractiveButtons(phoneNumberId: string, token: string, to: string, bodyText: string, buttons: { id: string; title: string }[]) {
  await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({ type: "reply", reply: { id: b.id, title: b.title } })),
        },
      },
    }),
  });
}

async function sendInteractiveList(phoneNumberId: string, token: string, to: string, bodyText: string, buttonText: string, sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]) {
  await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: { button: buttonText, sections },
      },
    }),
  });
}

// Get or create session
async function getSession(supabase: any, phone: string) {
  const { data } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone_number", phone)
    .maybeSingle();
  if (data) return data;
  const { data: newSession } = await supabase
    .from("whatsapp_sessions")
    .insert({ phone_number: phone, conversation_state: "welcome" })
    .select()
    .single();
  return newSession;
}

async function updateSession(supabase: any, phone: string, updates: Record<string, any>) {
  await supabase
    .from("whatsapp_sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("phone_number", phone);
}

// Main conversation handler
async function handleMessage(supabase: any, phoneNumberId: string, token: string, from: string, messageText: string, buttonReplyId?: string) {
  const session = await getSession(supabase, from);
  const state = session.conversation_state;
  const input = buttonReplyId || messageText.trim().toLowerCase();

  // Reset command
  if (input === "reset" || input === "menu" || input === "hi" || input === "hello" || input === "start") {
    await updateSession(supabase, from, { conversation_state: "welcome", role: null, context: {} });
    await sendMessage(phoneNumberId, token, from,
      "🖨️ *Welcome to PrintFlow!*\n\nIndia's smartest printing platform. Order visiting cards, banners, stickers & more — right from WhatsApp!\n\nLet's get started 👇"
    );
    await sendInteractiveButtons(phoneNumberId, token, from,
      "What's your role?",
      [
        { id: "role_customer", title: "🛒 Customer" },
        { id: "role_shop", title: "🏪 Shop Owner" },
      ]
    );
    return;
  }

  switch (state) {
    case "welcome": {
      if (input === "role_customer") {
        await updateSession(supabase, from, { conversation_state: "customer_menu", role: "customer" });
        await sendCustomerMenu(phoneNumberId, token, from);
      } else if (input === "role_shop") {
        await updateSession(supabase, from, { conversation_state: "shop_menu", role: "shop_owner" });
        await sendShopMenu(phoneNumberId, token, from);
      } else {
        await sendMessage(phoneNumberId, token, from, "Please select your role using the buttons above, or type *hi* to restart.");
      }
      break;
    }

    case "customer_menu": {
      await handleCustomerMenu(supabase, phoneNumberId, token, from, input, session);
      break;
    }

    case "shop_menu": {
      await handleShopMenu(supabase, phoneNumberId, token, from, input, session);
      break;
    }

    case "browsing_catalog": {
      await handleCatalogBrowse(supabase, phoneNumberId, token, from, input, session);
      break;
    }

    case "placing_order": {
      await handleOrderFlow(supabase, phoneNumberId, token, from, input, messageText, session);
      break;
    }

    case "tracking_order": {
      await handleOrderTracking(supabase, phoneNumberId, token, from, input, messageText, session);
      break;
    }

    case "shop_orders": {
      await handleShopOrders(supabase, phoneNumberId, token, from, input, session);
      break;
    }

    default: {
      await updateSession(supabase, from, { conversation_state: "welcome", context: {} });
      await sendMessage(phoneNumberId, token, from, "Something went wrong. Type *hi* to restart.");
    }
  }
}

// ── Customer Menu ──
async function sendCustomerMenu(phoneNumberId: string, token: string, to: string) {
  await sendInteractiveList(phoneNumberId, token, to,
    "🛒 *Customer Menu*\n\nWhat would you like to do?",
    "Choose Option",
    [{
      title: "Services",
      rows: [
        { id: "cust_catalog", title: "📦 Browse Products", description: "View our printing catalog" },
        { id: "cust_order", title: "🛍️ Place an Order", description: "Start a new print order" },
        { id: "cust_track", title: "📍 Track Order", description: "Check your order status" },
        { id: "cust_quote", title: "💰 Get Quotation", description: "Get a price estimate" },
        { id: "cust_support", title: "💬 Support", description: "Talk to our team" },
      ],
    }]
  );
}

async function handleCustomerMenu(supabase: any, pid: string, token: string, from: string, input: string, session: any) {
  switch (input) {
    case "cust_catalog": {
      await updateSession(supabase, from, { conversation_state: "browsing_catalog" });
      await sendInteractiveList(pid, token, from,
        "📦 *Our Product Categories*\n\nChoose a category to explore:",
        "View Categories",
        [{
          title: "Categories",
          rows: [
            { id: "cat_visiting", title: "💳 Visiting Cards", description: "From ₹1.50/card" },
            { id: "cat_flyers", title: "📄 Flyers & Leaflets", description: "From ₹2/piece" },
            { id: "cat_banners", title: "🏷️ Banners & Flex", description: "From ₹150" },
            { id: "cat_stickers", title: "🏷️ Stickers & Labels", description: "From ₹2/piece" },
            { id: "cat_posters", title: "🖼️ Posters", description: "From ₹25" },
            { id: "cat_idcards", title: "🪪 ID Cards", description: "From ₹25/card" },
            { id: "cat_back", title: "⬅️ Back to Menu", description: "Return to main menu" },
          ],
        }]
      );
      break;
    }
    case "cust_order": {
      await updateSession(supabase, from, { conversation_state: "placing_order", context: { step: "category" } });
      await sendMessage(pid, token, from, "🛍️ *New Order*\n\nWhat product would you like to order? Type the product name, e.g.:\n\n• Visiting Cards\n• Flyers\n• Banners\n• Stickers\n• Posters\n• ID Cards");
      break;
    }
    case "cust_track": {
      await updateSession(supabase, from, { conversation_state: "tracking_order" });
      await sendMessage(pid, token, from, "📍 *Track Your Order*\n\nPlease enter your order number (e.g., PF-20260308-XXXX):");
      break;
    }
    case "cust_quote": {
      await sendMessage(pid, token, from,
        "💰 *Quick Quotation*\n\nVisiting Cards (100 qty): ~₹276 incl. GST\nFlyers A5 (500 qty): ~₹2,360\nBanners 4×6 ft: ~₹531\n\nFor a detailed quote, visit:\nhttps://printflow.in/customize/visiting-cards\n\nOr type *order* to place one now!"
      );
      break;
    }
    case "cust_support": {
      await sendMessage(pid, token, from, "💬 *Support*\n\nFor assistance, please:\n📧 Email: support@printflow.in\n🌐 Web: https://printflow.in\n\nOr describe your issue here and we'll get back to you.");
      break;
    }
    default: {
      await sendCustomerMenu(pid, token, from);
    }
  }
}

// ── Catalog browsing ──
async function handleCatalogBrowse(supabase: any, pid: string, token: string, from: string, input: string, session: any) {
  const catalogInfo: Record<string, string> = {
    cat_visiting: "💳 *Visiting Cards*\n\n📐 Sizes: Standard, Indian, Square, Mini, Folded\n📄 Papers: 300-400 GSM Art, Metallic, PVC, Velvet\n✨ Finishes: Spot UV, Gold/Silver Foil, Emboss\n💰 Starting: ₹1.50/card\n📦 Min: 100 cards\n⏱️ Turnaround: 2-3 days\n\nType *order* to place one!",
    cat_flyers: "📄 *Flyers & Leaflets*\n\n📐 Sizes: A6, A5, A4, DL\n📄 Papers: 100-200 GSM Art\n💰 Starting: ₹2/piece\n📦 Min: 100 pieces\n⏱️ Turnaround: 2-4 days",
    cat_banners: "🏷️ *Banners & Flex*\n\n📐 Sizes: 2×3 ft to 10×5 ft, Custom\n📄 Materials: Star Flex, Vinyl, Fabric, Mesh\n💰 Starting: ₹150\n⏱️ Turnaround: 1-3 days",
    cat_stickers: "🏷️ *Stickers & Labels*\n\n📐 Sizes: 2×2 to A4 sheet, Die-cut\n📄 Materials: Vinyl, Paper, Transparent, Holographic\n💰 Starting: ₹2/piece\n📦 Min: 50 pieces",
    cat_posters: "🖼️ *Posters*\n\n📐 Sizes: A4 to A0, Custom\n📄 Papers: Gloss, Matte, Canvas, Photo\n💰 Starting: ₹25\n⏱️ Turnaround: 1-3 days",
    cat_idcards: "🪪 *ID Cards*\n\n📐 Standard CR80 size\n📄 PVC, Teslin waterproof\n✨ Options: Lanyard, Holder\n💰 Starting: ₹25/card\n📦 Min: 10 cards",
  };

  if (input === "cat_back") {
    await updateSession(supabase, from, { conversation_state: "customer_menu" });
    await sendCustomerMenu(pid, token, from);
    return;
  }

  if (catalogInfo[input]) {
    await sendMessage(pid, token, from, catalogInfo[input]);
    await sendInteractiveButtons(pid, token, from, "What next?", [
      { id: "cust_order", title: "🛍️ Order Now" },
      { id: "cat_back", title: "⬅️ Back" },
    ]);
  } else {
    await sendMessage(pid, token, from, "Please select a category from the list, or type *menu* to go back.");
  }
}

// ── Order flow ──
async function handleOrderFlow(supabase: any, pid: string, token: string, from: string, input: string, rawText: string, session: any) {
  const ctx = session.context || {};

  if (ctx.step === "category") {
    const categories: Record<string, string> = {
      visiting: "visiting-cards", card: "visiting-cards", cards: "visiting-cards",
      flyer: "flyers", flyers: "flyers", leaflet: "flyers",
      banner: "banners", banners: "banners", flex: "banners",
      sticker: "stickers", stickers: "stickers", label: "stickers",
      poster: "posters", posters: "posters",
      id: "id-cards", idcard: "id-cards",
    };
    const match = Object.entries(categories).find(([k]) => input.includes(k));
    if (match) {
      await updateSession(supabase, from, { context: { ...ctx, step: "quantity", category: match[1] } });
      await sendMessage(pid, token, from, `Great! You selected *${match[1].replace("-", " ")}*.\n\nHow many do you need? (Enter a number)`);
    } else {
      await sendMessage(pid, token, from, "I didn't recognize that product. Please type one of:\n• Visiting Cards\n• Flyers\n• Banners\n• Stickers\n• Posters\n• ID Cards");
    }
  } else if (ctx.step === "quantity") {
    const qty = parseInt(rawText.trim());
    if (isNaN(qty) || qty < 1) {
      await sendMessage(pid, token, from, "Please enter a valid quantity (number).");
      return;
    }
    await updateSession(supabase, from, { context: { ...ctx, step: "confirm", quantity: qty } });
    // Simple pricing estimate
    const basePrice = ctx.category === "visiting-cards" ? 1.5 : ctx.category === "banners" ? 150 : 5;
    const subtotal = basePrice * qty;
    const gst = subtotal * 0.18;
    const delivery = 50;
    const total = subtotal + gst + delivery;

    await sendMessage(pid, token, from,
      `📋 *Order Summary*\n\n📦 Product: ${ctx.category.replace("-", " ")}\n🔢 Quantity: ${qty}\n💰 Subtotal: ₹${subtotal.toFixed(0)}\n🏛️ GST (18%): ₹${gst.toFixed(0)}\n🚚 Delivery: ₹${delivery}\n\n*Total: ₹${total.toFixed(0)}*`
    );
    await sendInteractiveButtons(pid, token, from, "Proceed with this order?", [
      { id: "order_confirm", title: "✅ Confirm Order" },
      { id: "order_cancel", title: "❌ Cancel" },
    ]);
  } else if (ctx.step === "confirm") {
    if (input === "order_confirm") {
      // Create order in DB
      const orderNumber = `PF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const basePrice = ctx.category === "visiting-cards" ? 1.5 : ctx.category === "banners" ? 150 : 5;
      const subtotal = basePrice * ctx.quantity;
      const gst = subtotal * 0.18;
      const total = subtotal + gst + 50;

      await supabase.from("orders").insert({
        order_number: orderNumber,
        product_name: ctx.category.replace("-", " "),
        product_category: ctx.category,
        quantity: ctx.quantity,
        unit_price: basePrice,
        total_price: subtotal,
        gst_amount: gst,
        delivery_charge: 50,
        grand_total: total,
        notes: `WhatsApp order from ${from}`,
      });

      await sendMessage(pid, token, from,
        `✅ *Order Placed Successfully!*\n\n🆔 Order No: *${orderNumber}*\n💰 Total: ₹${total.toFixed(0)}\n\nTrack your order anytime by sending the order number.\n\nVisit https://printflow.in/track for detailed tracking.\n\nType *menu* to go back.`
      );
      await updateSession(supabase, from, { conversation_state: "customer_menu", context: {} });
    } else {
      await sendMessage(pid, token, from, "Order cancelled. Type *menu* to go back.");
      await updateSession(supabase, from, { conversation_state: "customer_menu", context: {} });
    }
  }
}

// ── Order tracking ──
async function handleOrderTracking(supabase: any, pid: string, token: string, from: string, input: string, rawText: string, session: any) {
  const orderNumber = rawText.trim().toUpperCase();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (order) {
    const statusEmoji: Record<string, string> = {
      pending: "⏳", confirmed: "✅", designing: "🎨", printing: "🖨️",
      quality_check: "🔍", shipped: "🚚", delivered: "📦", cancelled: "❌",
    };
    const statusLabel: Record<string, string> = {
      pending: "Order Received", confirmed: "Confirmed", designing: "Designing",
      printing: "Printing", quality_check: "Quality Check", shipped: "Shipped",
      delivered: "Delivered", cancelled: "Cancelled",
    };
    const timeline = ["pending", "confirmed", "designing", "printing", "quality_check", "shipped", "delivered"];
    const currentIdx = timeline.indexOf(order.status);
    let timelineStr = timeline.map((s, i) => {
      const emoji = i <= currentIdx ? "✅" : "⬜";
      return `${emoji} ${statusLabel[s]}`;
    }).join("\n");

    if (order.status === "cancelled") {
      timelineStr = "❌ Order was cancelled";
    }

    await sendMessage(pid, token, from,
      `📍 *Order Tracking*\n\n🆔 ${order.order_number}\n📦 ${order.product_name}\n🔢 Qty: ${order.quantity}\n💰 Total: ₹${Number(order.grand_total).toLocaleString("en-IN")}\n\n*Status: ${statusEmoji[order.status] || "📋"} ${statusLabel[order.status] || order.status}*\n\n${timelineStr}\n\nType *menu* for main menu.`
    );
  } else {
    await sendMessage(pid, token, from, "❌ Order not found. Please check the order number and try again.\n\nType *menu* to go back.");
  }
  await updateSession(supabase, from, { conversation_state: "customer_menu", context: {} });
}

// ── Shop Owner Menu ──
async function sendShopMenu(pid: string, token: string, to: string) {
  await sendInteractiveList(pid, token, to,
    "🏪 *Shop Owner Menu*\n\nManage your shop from WhatsApp:",
    "Choose Option",
    [{
      title: "Management",
      rows: [
        { id: "shop_orders", title: "📋 View Orders", description: "See pending & active orders" },
        { id: "shop_update", title: "🔄 Update Status", description: "Change order status" },
        { id: "shop_stats", title: "📊 Quick Stats", description: "Today's summary" },
        { id: "shop_webapp", title: "🌐 Open Dashboard", description: "Full dashboard link" },
      ],
    }]
  );
}

async function handleShopMenu(supabase: any, pid: string, token: string, from: string, input: string, session: any) {
  switch (input) {
    case "shop_orders": {
      await updateSession(supabase, from, { conversation_state: "shop_orders" });
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "confirmed", "designing", "printing"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (!orders || orders.length === 0) {
        await sendMessage(pid, token, from, "📋 No active orders right now.\n\nType *menu* to go back.");
        await updateSession(supabase, from, { conversation_state: "shop_menu" });
      } else {
        let msg = "📋 *Active Orders*\n\n";
        orders.forEach((o: any, i: number) => {
          msg += `${i + 1}. *${o.order_number}*\n   📦 ${o.product_name} × ${o.quantity}\n   💰 ₹${Number(o.grand_total).toLocaleString("en-IN")}\n   📊 ${o.status}\n\n`;
        });
        msg += "To update an order, type the order number.";
        await sendMessage(pid, token, from, msg);
      }
      break;
    }
    case "shop_stats": {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", today + "T00:00:00Z");

      const count = todayOrders?.length || 0;
      const revenue = todayOrders?.reduce((s: number, o: any) => s + Number(o.grand_total), 0) || 0;
      const pending = todayOrders?.filter((o: any) => o.status === "pending").length || 0;

      await sendMessage(pid, token, from,
        `📊 *Today's Stats*\n\n📦 Orders: ${count}\n💰 Revenue: ₹${revenue.toLocaleString("en-IN")}\n⏳ Pending: ${pending}\n\nType *menu* for options.`
      );
      break;
    }
    case "shop_webapp": {
      await sendMessage(pid, token, from, "🌐 Open your full dashboard:\nhttps://printflow.in/shop\n\nType *menu* to continue here.");
      break;
    }
    default: {
      await sendShopMenu(pid, token, from);
    }
  }
}

async function handleShopOrders(supabase: any, pid: string, token: string, from: string, input: string, session: any) {
  // Check if input is an order number
  const orderNumber = input.toUpperCase();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (order) {
    await sendInteractiveList(pid, token, from,
      `🔄 *Update: ${order.order_number}*\n📦 ${order.product_name}\nCurrent: ${order.status}`,
      "New Status",
      [{
        title: "Status Options",
        rows: [
          { id: `status_${order.id}_confirmed`, title: "✅ Confirmed" },
          { id: `status_${order.id}_designing`, title: "🎨 Designing" },
          { id: `status_${order.id}_printing`, title: "🖨️ Printing" },
          { id: `status_${order.id}_quality_check`, title: "🔍 Quality Check" },
          { id: `status_${order.id}_shipped`, title: "🚚 Shipped" },
          { id: `status_${order.id}_delivered`, title: "📦 Delivered" },
        ],
      }]
    );
  } else if (input.startsWith("status_")) {
    const parts = input.split("_");
    const orderId = parts[1];
    const newStatus = parts.slice(2).join("_");
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      await sendMessage(pid, token, from, "❌ Failed to update. Try again.");
    } else {
      await sendMessage(pid, token, from, `✅ Order status updated to *${newStatus}*!\n\nType *menu* to continue.`);
    }
    await updateSession(supabase, from, { conversation_state: "shop_menu" });
  } else {
    await sendMessage(pid, token, from, "Please enter a valid order number, or type *menu* to go back.");
    await updateSession(supabase, from, { conversation_state: "shop_menu" });
  }
}

// ── Main serve ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

  // Webhook verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified!");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Incoming messages (POST)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages?.[0]) {
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      const message = value.messages[0];
      const from = message.from;
      const phoneNumberId = value.metadata?.phone_number_id || WHATSAPP_PHONE_ID;

      if (!WHATSAPP_TOKEN || !phoneNumberId) {
        console.error("Missing WhatsApp credentials");
        return new Response("Config error", { status: 500, headers: corsHeaders });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      let messageText = "";
      let buttonReplyId: string | undefined;

      if (message.type === "text") {
        messageText = message.text.body;
      } else if (message.type === "interactive") {
        if (message.interactive.type === "button_reply") {
          buttonReplyId = message.interactive.button_reply.id;
          messageText = message.interactive.button_reply.title;
        } else if (message.interactive.type === "list_reply") {
          buttonReplyId = message.interactive.list_reply.id;
          messageText = message.interactive.list_reply.title;
        }
      }

      await handleMessage(supabase, phoneNumberId, WHATSAPP_TOKEN, from, messageText, buttonReplyId);

      return new Response("OK", { status: 200, headers: corsHeaders });
    } catch (e) {
      console.error("Webhook error:", e);
      return new Response("Error", { status: 500, headers: corsHeaders });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
