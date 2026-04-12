import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Copy, Check, Share2, Users, X, User as UserIcon, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const ReferralProgram = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showInvites, setShowInvites] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: invites = [] } = useQuery({
    queryKey: ["invites", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .eq("referred_by", user?.id);
      return data || [];
    },
    enabled: !!user,
  });

  const referralCode = profile?.referral_code || "---";
  const totalEarned = Number(profile?.wallet_balance || 0);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCode = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const newCode = `INK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: newCode })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Referral code generated!");
      // The query will automatically refetch
    } catch (err) {
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (referralCode === "---") {
      handleGenerateCode();
      return;
    }
    navigator.clipboard.writeText(`Use my code ${referralCode} to get ₹50 off on your first print at PrintFlow!`);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Hey! Use my referral code ${referralCode} at PrintFlow to get ₹50 credit on your first order! 🎨🚀\n\nCheck it out: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <>
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
              <code className={`flex-1 font-mono text-sm font-bold text-center tracking-wider ${referralCode === "---" ? "text-muted-foreground opacity-50" : "text-foreground"}`}>
                {referralCode}
              </code>
              <Button 
                variant={referralCode === "---" ? "coral" : "ghost"}
                size="sm" 
                className={referralCode === "---" ? "h-8 px-4 text-[10px] font-bold uppercase rounded-lg" : "h-8 w-8 p-0"} 
                onClick={handleCopy}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : referralCode === "---" ? (
                  "Claim Your Code"
                ) : copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 text-sm" onClick={shareOnWhatsApp}>
                <Share2 className="w-4 h-4" /> WhatsApp
              </Button>
              <Button variant="outline" className="gap-2 text-sm" onClick={() => setShowInvites(true)}>
                <Users className="w-4 h-4" /> My Invites
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Earned: ₹{totalEarned}</span>
              <span className="text-accent font-medium">Verified Program</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: totalEarned > 0 ? "100%" : "0%" }}
                className="h-full bg-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInvites && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-accent/5">
                <h4 className="font-display font-bold text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" /> Your Referrals
                </h4>
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => setShowInvites(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                {invites.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto opacity-20">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-muted-foreground italic">No invites yet. Start sharing!</p>
                  </div>
                ) : (
                  invites.map((invite: any) => (
                    <div key={invite.id} className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between group hover:bg-secondary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{invite.full_name || "New Partner"}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Joined {format(new Date(invite.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-border bg-secondary/10">
                <Button className="w-full rounded-xl h-12 shadow-lg shadow-coral/20" variant="coral" onClick={shareOnWhatsApp}>
                  Invite More Friends
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReferralProgram;
