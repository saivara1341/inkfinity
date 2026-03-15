import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ReferralProgram = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "PRINT50-EXPERT"; // This would come from the user's profile/DB

  const handleCopy = () => {
    navigator.clipboard.writeText(`Use my code ${referralCode} to get ₹50 off on your first print at PrintFlow!`);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-6 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Invite & Earn</h3>
            <p className="text-sm text-muted-foreground italic">Give ₹50, Get ₹50</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Share your love for high-quality printing. When a friend places their first order using your link, you both get <span className="text-accent font-bold">₹50 credit</span>.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg p-3 group hover:border-accent/30 transition-colors">
            <code className="flex-1 font-mono text-sm font-bold text-center tracking-wider text-foreground">
              {referralCode}
            </code>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2 text-sm" onClick={() => window.open(`https://wa.me/?text=Get high-quality prints at PrintFlow! Use my code ${referralCode} for a discount.`)}>
              <Share2 className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="gap-2 text-sm">
              <Users className="w-4 h-4" /> My Invites
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Earned: ₹0</span>
            <span className="text-accent font-medium">Coming Soon</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "0%" }}
              className="h-full bg-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
