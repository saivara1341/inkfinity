import { useState } from "react";
import { 
  Share2, Copy, Check, MessageCircle, 
  Facebook, Twitter, Link as LinkIcon, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ShareControlProps {
  title: string;
  text: string;
  url: string;
  variant?: "ghost" | "outline" | "secondary" | "coral";
  size?: "sm" | "md" | "lg" | "icon";
  showLabel?: boolean;
}

export const ShareControl = ({ 
  title, 
  text, 
  url, 
  variant = "outline", 
  size = "md",
  showLabel = true 
}: ShareControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = window.location.origin + "/#" + url;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { 
      name: "WhatsApp", 
      icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />, 
      href: `https://wa.me/?text=${encodeURIComponent(text + " " + fullUrl)}` 
    },
    { 
      name: "Facebook", 
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />, 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}` 
    },
    { 
      name: "Twitter", 
      icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />, 
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}` 
    },
  ];

  return (
    <div className="relative inline-block">
      <Button 
        variant={variant as any} 
        size={size === "icon" ? "icon" : "sm"}
        onClick={handleShare}
        className={size === "md" ? "h-9 gap-2" : size === "lg" ? "h-11 gap-2 px-6" : "h-8 gap-1.5"}
      >
        <Share2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {showLabel && (size === "sm" ? "Share" : "Share Now")}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card rounded-2xl border border-border shadow-elevated z-[101] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-foreground">Share this with friends</h3>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {shareLinks.map(link => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        {link.icon}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{link.name}</span>
                    </a>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Social Link</p>
                  <div className="p-1 px-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between gap-3 group">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <LinkIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <p className="text-xs text-foreground truncate">{fullUrl}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopy}
                      className="h-8 px-2 hover:bg-accent/10 hover:text-accent"
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-accent/5 p-4 text-center border-t border-accent/10">
                <p className="text-[10px] text-accent font-medium italic">"Sharing is caring! Help us grow the PrintFlow community."</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareControl;
