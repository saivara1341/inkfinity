import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, User, Bot, ShoppingBag,
  Upload, CheckCircle2, Zap, MapPin, Package, IndianRupee, Printer, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { productCategories } from "@/data/printingProducts";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  options?: string[];
  action?: "upload" | "order" | "location" | "success";
  preview?: string;
}

export const QuickOrderBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Namaste! I am your Printing Assistant. I can help you from requirement to delivery in minutes. What shall we print for you today?",
      options: productCategories.map(c => c.name),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<any>({
    categoryId: "",
    productId: "",
    productName: "",
    paperId: "",
    finishId: "",
    quantity: 0,
    customQuantity: false
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionClick = (option: string) => {
    addMessage("user", option);
    processStep(option);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const val = inputValue;
    addMessage("user", val);
    setInputValue("");
    processStep(val);
  };

  const addMessage = (type: "user" | "bot", content: string, options?: string[], action?: "upload" | "order" | "location") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      options,
      action
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processStep = (input: string) => {
    setTimeout(() => {
      if (step === 1) {
        const category = productCategories.find(c => c.name === input);
        if (category) {
          setOrderData({ ...orderData, categoryId: category.id });
          addMessage("bot", `Excellent. ${category.name} is a fine choice. Which specific style would you like?`, category.subcategories.map(s => s.name));
          setStep(2);
        } else {
          addMessage("bot", "I apologize, I didn't recognize that category. Please select from the options below:", productCategories.map(c => c.name));
        }
      } else if (step === 2) {
        const category = productCategories.find(c => c.id === orderData.categoryId);
        const product = category?.subcategories.find(s => s.name === input);
        if (product) {
          setOrderData({ ...orderData, productId: product.id, productName: product.name });
          addMessage("bot", `A mark of distinction! Now, let us select the base material (Quality).`, product.papers.map(p => p.label));
          setStep(3);
        }
      } else if (step === 3) {
        const category = productCategories.find(c => c.id === orderData.categoryId);
        const product = category?.subcategories.find(s => s.id === orderData.productId);
        const paper = product?.papers.find(p => p.label === input);
        if (paper) {
          setOrderData({ ...orderData, paperId: paper.id });
          addMessage("bot", `Strong and elegant. Would you like to add a protective finish?`, product?.finishes.map(f => f.label));
          setStep(4);
        }
      } else if (step === 4) {
        const category = productCategories.find(c => c.id === orderData.categoryId);
        const product = category?.subcategories.find(s => s.id === orderData.productId);
        const finish = product?.finishes.find(f => f.label === input);
        if (finish) {
          setOrderData({ ...orderData, finishId: finish.id });
          addMessage("bot", `Beautifully done. How many pieces shall we craft for you?`, ["100", "500", "1000", "Custom Quantity"]);
          setStep(5);
        }
      } else if (step === 5) {
        if (input === "Custom Quantity") {
          setOrderData({ ...orderData, customQuantity: true });
          addMessage("bot", "Please type the exact quantity you need (e.g., 250):");
        } else {
          setOrderData({ ...orderData, quantity: parseInt(input) });
          addMessage("bot", "Perfect. To find the nearest weaver (shop) for your order, please provide your Pincode or City.", undefined, "location");
          setStep(6);
        }
      } else if (step === 6) {
        if (orderData.customQuantity && !orderData.quantity) {
          const qty = parseInt(input);
          if (!isNaN(qty)) {
            setOrderData({ ...orderData, quantity: qty });
            addMessage("bot", `Noted: ${qty} pieces. Now, please provide your Pincode or City to find nearby shops.`, undefined, "location");
          } else {
            addMessage("bot", "Please enter a valid number for quantity.");
          }
        } else {
          setOrderData({ ...orderData, location: input });
          addMessage("bot", `Searching for expert weavers near ${input}...`);

          setTimeout(() => {
            addMessage("bot", "Splendid! We found 3 premium shops nearby. Would you prefer 'Shop Pickup' or 'Home Delivery'?", ["Shop Pickup", "Home Delivery"]);
            setStep(7);
          }, 1000);
        }
      } else if (step === 7) {
        setOrderData({ ...orderData, deliveryType: input });
        if (input.includes("Home")) {
          addMessage("bot", "Where shall we deliver this masterpiece? Please provide your full address.");
          setStep(8);
        } else {
          addMessage("bot", "Excellent. You can pick it up from 'Supreme Prints, MG Road' once ready. Proceed to finalize?", ["Proceed to Payment", "Review Details"]);
          setStep(9);
        }
      } else if (step === 8) {
        setOrderData({ ...orderData, address: input });
        addMessage("bot", "Address noted. Your order is almost ready. Total Estimate: ₹899. Proceed to payment?", ["Proceed to Payment", "Review Details"]);
        setStep(9);
      } else if (step === 9) {
        if (input.includes("Payment")) {
          addMessage("bot", `Processing your artisanal print request #INK-Q${Math.floor(Math.random() * 9000) + 1000}...`);

          setTimeout(() => {
            addMessage("bot", "Order Successful! Your Master Craftsman has been notified. You can track this in your dashboard or here.", ["Track Order", "Finish"]);
            setStep(10);
          }, 1500);
        } else {
          addMessage("bot", "Let's refine the details. What would you like to update?", ["Product", "Quality", "Quantity"]);
          setStep(1);
        }
      } else if (step === 10) {
        if (input.includes("Track")) {
          navigate("/track");
        }
        setIsOpen(false);
      }
    }, 800);
  };

  return (
    <>
      <button
        id="quick-order-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-[#8B0000] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group border-4 border-[#DAA520]/20"
        aria-label="Quick Order"
      >
        <Printer className="w-9 h-9 group-hover:rotate-12 transition-transform text-[#DAA520]" />
        <div className="bg-[#8B0000]/10 px-2 py-1 rounded flex items-center gap-1.5 self-start">
          <Sparkles className="w-3 h-3 text-[#8B0000] fill-[#8B0000]" />
          <span className="text-[#8B0000] text-[10px] font-bold tracking-wider">Fast Track</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-10 right-8 w-[480px] h-[750px] max-w-[90vw] max-h-[85vh] bg-[#FDF5E6] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-[#8B0000]/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 bg-[#1A1A1A] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-elements-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c16.568 0 30 13.432 30 30s-13.432 30-30 30S0 46.568 0 30 13.432 0 30 0zm0 10c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z' fill='%23DAA520' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }} />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#5a0000] flex items-center justify-center shadow-lg border-2 border-[#DAA520]/40 transition-transform hover:rotate-6 duration-500">
                    <Printer className="w-8 h-8 text-[#DAA520]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl tracking-tight text-white uppercase italic">Master Weaver Assistant</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#DAA520] rounded-full animate-pulse" />
                      <span className="text-[11px] text-[#DAA520] font-black uppercase tracking-[0.2em]">Crafting Masterpieces</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/20 group"
                  aria-label="Close Assistant"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Decorative Borders */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#8B0000]/10" />
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#8B0000]/10" />

            {/* Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 relative"
              style={{
                backgroundImage: 'radial-gradient(#8B000008 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} items-end gap-3`}>
                  {m.type === "bot" && (
                    <div className="w-8 h-8 rounded-xl bg-[#8B0000]/5 flex items-center justify-center shrink-0 border border-[#8B0000]/10">
                      <Bot className="w-4 h-4 text-[#8B0000]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] space-y-4`}>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-5 rounded-3xl text-sm font-medium leading-relaxed ${m.type === "user"
                        ? "bg-[#8B0000] text-white rounded-br-none shadow-xl shadow-[#8B0000]/20 font-sans"
                        : "bg-white text-[#1A1A1A] border-2 border-[#8B0000]/5 rounded-bl-none shadow-sm font-serif italic text-[15px]"
                        }`}
                    >
                      {m.content}
                    </motion.div>

                    {m.options && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionClick(opt)}
                            className="px-4 py-2 bg-white hover:bg-[#8B0000] hover:text-white border-2 border-[#8B0000]/10 rounded-full text-[11px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-[#8B0000]/20 active:scale-95"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {m.action === 'upload' && (
                      <label className="flex flex-col items-center justify-center p-8 bg-white border-4 border-dashed border-[#8B0000]/10 rounded-[2.5rem] hover:bg-[#8B0000]/5 cursor-pointer transition-all group shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-[#8B0000]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-[#8B0000]" />
                        </div>
                        <span className="text-[11px] font-black uppercase text-[#8B0000] tracking-widest">Select Your Masterpiece</span>
                        <span className="text-[9px] text-[#8B0000]/50 mt-1 uppercase font-bold tracking-wider">PDF, AI, CDR, or PNG (Max 50MB)</span>
                        <input type="file" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast.success(`${file.name} uploaded successfully!`);
                            handleOptionClick("Artwork Uploaded ✅");
                          }
                        }} />
                      </label>
                    )}

                    {m.action === 'location' && (
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B0000]" />
                        <Input
                          placeholder="Enter Pincode..."
                          className="pl-11 h-12 rounded-2xl border-2 border-[#8B0000]/10 focus:border-[#8B0000] bg-white text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                          }}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-white border-t-2 border-[#8B0000]/5">
              <div className="relative flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-5 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-[#8B0000]/20 outline-none text-sm font-medium transition-all"
                />
                <button
                  onClick={handleSend}
                  className="w-14 h-14 bg-[#8B0000] text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#8B0000]/20"
                >
                  <Send className="w-6 h-6" />
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
;
