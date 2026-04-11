import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Briefcase, ChevronRight, Globe, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PartnerNetworkProps {
  role: 'customer' | 'shop_owner' | 'supplier';
}

export const PartnerNetwork = ({ role }: PartnerNetworkProps) => {
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ["collaborations", role],
    queryFn: async () => {
      const { data } = await supabase
        .from("collaborations")
        .select("*")
        .contains("target_roles", [role])
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  if (collaborations.length === 0) {
    return (
      <div className="p-12 text-center bg-secondary/20 rounded-[2rem] border border-dashed border-border">
        <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display font-bold text-lg text-foreground mb-2">Grow Your Ecosystem</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We're working on partnerships with logistics providers and machinery experts to help you scale. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collaborations.map((collab) => (
        <motion.div
          key={collab.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative bg-card rounded-[2rem] border border-border p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/20">
                {collab.logo_url ? (
                  <img src={collab.logo_url} alt={collab.name} className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="w-6 h-6 text-accent" />
                )}
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-accent border-accent/30">
                {collab.category}
              </Badge>
            </div>
            
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors leading-tight mb-2">
              {collab.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3">
              {collab.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Info className="w-3 h-3" /> Exclusive Partner
            </span>
            <Button 
              size="sm" 
              variant="coral" 
              className="rounded-xl gap-2 font-bold text-xs h-9 px-4"
              onClick={() => window.open(collab.cta_link, '_blank')}
            >
              Learn More <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
