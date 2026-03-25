import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Store, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
}

interface OrderMessagesProps {
  orderId: string;
  shopOwnerId?: string;
  buyerId?: string;
  onClose?: () => void;
}

export const OrderMessages = ({ orderId, shopOwnerId, buyerId, onClose }: OrderMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`order_messages:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("order_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      if (file.type.startsWith("image/")) {
        setAttachmentPreview(URL.createObjectURL(file));
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || sending || !user) return;

    setSending(true);
    try {
      let attachmentUrl = null;

      if (attachment) {
        const fileExt = attachment.name.split(".").pop();
        const fileName = `${orderId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("designs")
          .upload(fileName, attachment);

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("designs").getPublicUrl(fileName);
        attachmentUrl = data.publicUrl;
      }

      const { error } = await supabase.from("order_messages").insert({
        order_id: orderId,
        sender_id: user.id,
        message: newMessage.trim(),
        attachment_url: attachmentUrl,
      });

      if (error) throw error;
      setNewMessage("");
      setAttachment(null);
      setAttachmentPreview(null);
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-accent/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Send className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Order Discussion</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Direct Communication</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-6">
            <Send className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium">Start the conversation</p>
            <p className="text-xs">Ask questions or request changes for this order here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                  isMe ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border"
                }`}>
                  {msg.attachment_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={msg.attachment_url} 
                        alt="Attachment" 
                        className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.attachment_url!, "_blank")}
                      />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.created_at), "h:mm a")}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {isMe ? "You" : (msg.sender_id === shopOwnerId ? "Shop Owner" : "Buyer")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <AnimatePresence>
          {attachment && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-2 bg-secondary rounded-lg flex items-center justify-between gap-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {attachmentPreview ? (
                  <img src={attachmentPreview} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center shrink-0">
                    <Paperclip className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{attachment.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAttachment(null)} className="h-6 w-6">
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 text-muted-foreground hover:text-accent hover:bg-accent/5"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="h-11 pr-12 rounded-xl bg-secondary/50 border-none focus-visible:ring-accent"
            />
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && !attachment) || sending}
              size="sm"
              className="absolute right-1 top-1 h-9 w-9 p-0 rounded-lg bg-accent text-accent-foreground shadow-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
