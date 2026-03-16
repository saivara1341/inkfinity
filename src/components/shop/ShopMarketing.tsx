import { useState } from "react";
import { 
  Megaphone, Star, TrendingUp, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ShopMarketing = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = (tier: string) => {
    setLoading(tier);
    setTimeout(() => {
      setLoading(null);
      toast({
        title: "Successfully Subscribed!",
        description: `Your shop is now a ${tier} partner. Enjoy your premium ranking.`,
      });
    }, 1500);
  };

  const tiers = [
    {
      name: "Basic",
      price: "Free",
      description: "Standard visibility in marketplace",
      features: [
        "Standard search ranking",
        "Basic 3D previews",
        "Community support",
        "10% platform commission"
      ],
      current: true
    },
    {
      name: "Preferred Provider",
      price: "₹1,499",
      period: "/month",
      description: "Boost your shop to the top of the list",
      features: [
        "Priority ranking in 'Smart Selection'",
        "Preferred Partner Badge",
        "AI Design Hub (45+ variations)",
        "Zero AI export fees for customers",
        "7% platform commission"
      ],
      recommended: true,
      icon: Crown,
      color: "text-accent"
    },
    {
      name: "Elite Network",
      price: "₹3,999",
      period: "/month",
      description: "Maximum growth for professional labs",
      features: [
        "Top-tier exclusive ranking",
        "Featured on homepage",
        "Dedicated account manager",
        "Early access to new features",
        "4% platform commission"
      ],
      icon: Zap,
      color: "text-amber-500"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Marketing & Growth</h2>
          <p className="text-muted-foreground">Boost your shop's visibility and attract more customers.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 gap-1 border-accent/30 text-accent">
          <TrendingUp className="w-3 H-3" /> Shop Visibility: +24% this week
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`relative flex flex-col h-full overflow-hidden transition-all duration-300 ${tier.recommended ? 'border-accent shadow-lg scale-105 z-10' : 'hover:border-accent/40 shadow-sm'}`}>
            {tier.recommended && (
              <div className="absolute top-0 right-0">
                <div className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-8 py-1 rotate-45 translate-x-3 -translate-y-1">
                  Popular
                </div>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {tier.icon && <tier.icon className={`w-5 h-5 ${tier.color}`} />}
                <CardTitle className="text-xl">{tier.name}</CardTitle>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
              </div>
              
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.recommended ? 'text-accent' : 'text-muted-foreground'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={tier.recommended ? "coral" : "outline"}
                disabled={tier.current || loading === tier.name}
                onClick={() => handleSubscribe(tier.name)}
              >
                {tier.current ? "Current Plan" : loading === tier.name ? "Processing..." : `Upgrade to ${tier.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
            <Megaphone className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground">Why become a Preferred Provider?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              On average, Preferred Providers receive <strong>3.5x more orders</strong> because they appear first in the customer's "Smart Selection" during checkout.
            </p>
          </div>
          <Button variant="ghost" className="gap-2 group">
            Learn more about rankings <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopMarketing;
