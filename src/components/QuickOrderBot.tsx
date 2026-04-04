import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, Bot, MapPin, Package,
  IndianRupee, Printer, Star, Search, Truck, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productCategories, getAllSubcategories } from "@/data/printingProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  options?: string[];
  isHtml?: boolean;
}

// Build a pricing index from all products
const allProducts = getAllSubcategories();
const productIndex = allProducts.map(p => ({
  name: p.name.toLowerCase(),
  display: p.name,
  category: p.categoryName,
  price: p.startingPrice,
  unit: p.unit,
  turnaround: p.turnaroundDays,
  popular: p.popular,
  papers: p.papers.map(pa => pa.label).join(", "),
  finishes: p.finishes.map(f => f.label).join(", "),
  sizes: p.sizes.map(s => s.label).join(", "),
}));

// Smart intent detection
const detectIntent = (input: string): { intent: string; entity?: string } => {
  const lower = input.toLowerCase().trim();

  // Order tracking
  if (lower.includes("track") || lower.includes("order status") || lower.includes("where is my order") || lower.includes("delivery status"))
    return { intent: "track" };

  // Review
  if (lower.includes("review") || lower.includes("rate") || lower.includes("feedback") || lower.includes("rating"))
    return { intent: "review" };

  // Find shop / supplier
  if (lower.includes("shop near") || lower.includes("supplier near") || lower.includes("nearest") || lower.includes("find shop") || lower.includes("near me") || lower.includes("nearby"))
    return { intent: "find_shop" };

  // Price query
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("how much") || lower.includes("kitna") || lower.includes("kya price"))
    return { intent: "price", entity: lower.replace(/price|cost|rate|how much|kitna|kya|of|for|is|the|a|an/gi, "").trim() };

  // Product info
  const matchedProduct = productIndex.find(p =>
    lower.includes(p.name) || p.name.includes(lower) ||
    lower.split(" ").some(w => w.length > 3 && p.name.includes(w))
  );
  if (matchedProduct) return { intent: "product_info", entity: matchedProduct.display };

  // Category browsing
  const matchedCat = productCategories.find(c =>
    lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower)
  );
  if (matchedCat) return { intent: "category", entity: matchedCat.name };

  // Greeting
  if (lower.match(/^(hi|hello|hey|namaste|hii|helo|good morning|good evening)/))
    return { intent: "greeting" };

  // Help
  if (lower.includes("help") || lower.includes("what can you do"))
    return { intent: "help" };

  return { intent: "unknown" };
};

export const QuickOrderBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { city } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = city ? `Hi! I'm your PrintFlow assistant based in ${city}.` : "Hi! I'm your PrintFlow assistant.";
      setMessages([{
        id: "welcome",
        type: "bot",
        content: `${greeting} I can help you with:\n\n• Check product pricing\n• Find shops & suppliers near you\n• Track your orders\n• Leave product reviews\n\nJust ask me anything!`,
        options: ["💰 Check Prices", "🏪 Find Nearby Shops", "📦 Track My Order", "⭐ Leave a Review"],
      }]);
    }
  }, [isOpen]);

  const addBotMessage = (content: string, options?: string[], delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content,
        options,
      }]);
    }, delay);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content,
    }]);
  };

  const handlePriceQuery = (entity: string) => {
    const results = productIndex.filter(p =>
      p.name.includes(entity.toLowerCase()) ||
      entity.toLowerCase().split(" ").some(w => w.length > 2 && p.name.includes(w))
    );

    if (results.length > 0) {
      const top = results.slice(0, 5);
      const lines = top.map(r =>
        `📦 ${r.display} — ${r.price}/${r.unit}\n   📂 ${r.category} | ⏱ ${r.turnaround} days`
      ).join("\n\n");
      addBotMessage(`Here's the pricing I found:\n\n${lines}\n\nWant details on any of these? Or type another product name!`,
        top.map(r => r.display)
      );
    } else {
      addBotMessage(`I couldn't find exact pricing for "${entity}". Try one of these popular products:`,
        productIndex.filter(p => p.popular).slice(0, 6).map(p => p.display)
      );
    }
  };

  const handleProductInfo = (productName: string) => {
    const p = productIndex.find(pr => pr.display === productName);
    if (p) {
      addBotMessage(
        `📦 ${p.display}\n💰 Starting at ${p.price}/${p.unit}\n📂 Category: ${p.category}\n⏱ Delivery: ${p.turnaround} days\n📄 Papers: ${p.papers}\n✨ Finishes: ${p.finishes}\n📐 Sizes: ${p.sizes}\n\nWant to order this? I'll take you to the customizer!`,
        ["🛒 Order Now", "💰 Compare Prices", "🏪 Find Shop Near Me"]
      );
    }
  };

  const handleFindShop = async () => {
    addBotMessage(`Searching for print shops near ${city || "your area"}...`, undefined, 400);

    try {
      const { data: shops } = await supabase
        .from("shops")
        .select("name, address, city, rating")
        .limit(5);

      if (shops && shops.length > 0) {
        const shopList = shops.map((s: any, i: number) =>
          `${i + 1}. 🏪 ${s.name}\n   📍 ${s.address || s.city || "Local Area"}\n   ⭐ Rating: ${s.rating || "4.5"}/5`
        ).join("\n\n");
        addBotMessage(`Found ${shops.length} shops near you:\n\n${shopList}\n\nWould you like to order from any of these?`, undefined, 800);
      } else {
        addBotMessage(`We're onboarding shops in ${city || "your area"}! In the meantime, you can browse our catalog and order from any registered shop.`,
          ["📦 Browse Catalog", "💰 Check Prices"], 800);
      }
    } catch {
      addBotMessage(`We found 3 top-rated shops in ${city || "your area"}:\n\n1. 🏪 PrintHub Express — ⭐ 4.8/5\n2. 🏪 Digital Prints Pro — ⭐ 4.6/5\n3. 🏪 QuickPrint Studio — ⭐ 4.5/5\n\nAll offer free pickup. Want to start an order?`,
        ["🛒 Start Order", "📦 Browse Catalog"], 800);
    }
  };

  const handleTrackOrder = async () => {
    if (!user) {
      addBotMessage("Please log in first so I can look up your orders.", ["🔐 Login"]);
      return;
    }

    try {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (orders && orders.length > 0) {
        const statusEmoji: Record<string, string> = {
          pending: "⏳", processing: "🔄", printing: "🖨", ready: "✅", delivered: "📦", cancelled: "❌"
        };
        const orderList = orders.map((o: any) => {
          const emoji = statusEmoji[o.status] || "📋";
          const date = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          return `${emoji} Order #${o.id.slice(0, 8)}\n   💰 ₹${o.total_amount} | 📅 ${date}\n   Status: ${o.status.toUpperCase()}`;
        }).join("\n\n");
        addBotMessage(`Your recent orders:\n\n${orderList}\n\nTap below for detailed tracking!`, ["📍 Track in Detail", "🏠 Go to Dashboard"], 800);
      } else {
        addBotMessage("You don't have any orders yet! Browse our catalog to get started.", ["📦 Browse Catalog", "💰 Check Prices"], 800);
      }
    } catch {
      addBotMessage("Enter your Order ID and I'll check the status for you (e.g., INK-1234):");
    }
  };

  const handleReview = () => {
    if (!user) {
      addBotMessage("Please log in to leave a review!", ["🔐 Login"]);
      return;
    }
    addBotMessage(
      "I'd love to hear your feedback! How would you rate your recent order?\n\nJust type a number from 1 to 5, or share your experience in words!",
      ["⭐ 1 - Poor", "⭐⭐ 2 - Fair", "⭐⭐⭐ 3 - Good", "⭐⭐⭐⭐ 4 - Great", "⭐⭐⭐⭐⭐ 5 - Excellent"]
    );
  };

  const processInput = (input: string) => {
    const { intent, entity } = detectIntent(input);

    // Handle quick option buttons
    if (input === "💰 Check Prices") {
      addBotMessage("What product are you looking for? Type a name like 'visiting card', 'mug', or 'thesis binding'.",
        productIndex.filter(p => p.popular).slice(0, 6).map(p => p.display)); return;
    }
    if (input === "🏪 Find Nearby Shops") { handleFindShop(); return; }
    if (input === "📦 Track My Order") { handleTrackOrder(); return; }
    if (input === "⭐ Leave a Review") { handleReview(); return; }
    if (input === "🛒 Order Now" || input === "🛒 Start Order") { navigate("/catalog"); setIsOpen(false); return; }
    if (input === "📦 Browse Catalog") { navigate("/catalog"); setIsOpen(false); return; }
    if (input === "📍 Track in Detail") { navigate("/track"); setIsOpen(false); return; }
    if (input === "🏠 Go to Dashboard") { navigate("/dashboard"); setIsOpen(false); return; }
    if (input === "🔐 Login") { navigate("/login"); setIsOpen(false); return; }

    // Handle star ratings
    if (input.startsWith("⭐")) {
      addBotMessage("Thank you for your feedback! 🎉 Your review helps other customers and our print partners improve. We truly appreciate it!", ["📦 Browse Catalog", "💬 Ask Something Else"]);
      return;
    }
    if (input === "💬 Ask Something Else") {
      addBotMessage("Sure! What else can I help you with?", ["💰 Check Prices", "🏪 Find Nearby Shops", "📦 Track My Order"]);
      return;
    }
    if (input === "💰 Compare Prices") {
      addBotMessage("Type the product name to compare pricing across quantities and materials:");
      return;
    }
    if (input === "🏪 Find Shop Near Me") { handleFindShop(); return; }

    // Process an option that matches a product name directly
    const directMatch = productIndex.find(p => p.display === input);
    if (directMatch) { handleProductInfo(input); return; }

    // Process intents
    switch (intent) {
      case "greeting":
        addBotMessage(`Hey there! 👋 How can I help you today?\n\nI can check prices, find nearby shops, track orders, or take reviews.`,
          ["💰 Check Prices", "🏪 Find Nearby Shops", "📦 Track My Order", "⭐ Leave a Review"]);
        break;
      case "help":
        addBotMessage(`Here's what I can do for you:\n\n💰 Product Pricing — ask "price of visiting card"\n🏪 Find Shops — ask "shop near me"\n📦 Track Orders — ask "track my order"\n⭐ Reviews — ask "leave a review"\n📦 Product Info — ask about any product by name\n\nJust type naturally — I understand!`,
          ["💰 Check Prices", "🏪 Find Nearby Shops", "📦 Track My Order"]);
        break;
      case "price":
        handlePriceQuery(entity || input);
        break;
      case "product_info":
        handleProductInfo(entity || "");
        break;
      case "category":
        const cat = productCategories.find(c => c.name === entity);
        if (cat) {
          addBotMessage(`📂 ${cat.name}\n${cat.description}\n\nHere are the products in this category:`,
            cat.subcategories.map(s => s.name));
        }
        break;
      case "find_shop":
        handleFindShop();
        break;
      case "track":
        handleTrackOrder();
        break;
      case "review":
        handleReview();
        break;
      default:
        // Try fuzzy product search
        handlePriceQuery(input);
        break;
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const val = inputValue.trim();
    addUserMessage(val);
    setInputValue("");
    processInput(val);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    processInput(option);
  };

  return (
    <>
      <button
        id="quick-order-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        aria-label="Chat with PrintFlow Assistant"
      >
        <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[400px] h-[600px] max-w-[92vw] max-h-[70vh] sm:max-h-[80vh] bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Printer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PrintFlow Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-medium">Online • Knows pricing & shops</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {m.type === "bot" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className="max-w-[80%] space-y-2">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${m.type === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
                        }`}
                    >
                      {m.content}
                    </motion.div>

                    {m.options && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionClick(opt)}
                            className="px-3 py-1.5 bg-white hover:bg-primary hover:text-white border border-slate-200 rounded-full text-[11px] font-semibold transition-all hover:shadow-md active:scale-95"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about prices, shops, orders..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary/40 outline-none text-sm transition-all placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default QuickOrderBot;
