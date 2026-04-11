import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Briefcase, ExternalLink, ShieldCheck, Zap, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Collaboration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  cta_link: string;
  target_roles: string[];
}

interface PartnerNetworkProps {
  userRole?: 'customer' | 'shop_owner' | 'supplier';
  title?: string;
  description?: string;
  layout?: 'grid' | 'carousel';
}

const categoryIcons: Record<string, any> = {
  Machinery: Zap,
  Logistics: Truck,
  'Raw Materials': ShieldCheck,
  Software: Users,
  'Growth & Capital': Briefcase,
};

const PartnerNetwork: React.FC<PartnerNetworkProps> = ({ 
  userRole = 'customer', 
  title = "Strategic Growth Partners",
  description = "Exclusive resources and partnerships to scale your operations.",
  layout = 'grid'
}) => {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['collaborations', userRole],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborations')
        .select('*')
        .eq('is_active', true)
        .contains('target_roles', [userRole])
        .order('sort_order', { ascending: true });
      return (data as Collaboration[]) || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (partners.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>

      <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex gap-6 overflow-x-auto pb-6"}>
        {partners.map((partner, index) => {
          const Icon = categoryIcons[partner.category] || Briefcase;
          
          return (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card group rounded-2xl border border-border p-6 shadow-sm hover:border-accent/40 hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border group-hover:bg-accent/5 transition-colors">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-secondary/30 px-2 py-1 rounded-sm">
                  {partner.category}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">{partner.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {partner.description}
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-6 rounded-xl border-border bg-secondary/20 hover:bg-accent hover:text-white hover:border-accent group/btn transition-all h-10"
                onClick={() => window.open(partner.cta_link, '_blank')}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Access Resource</span>
                <ExternalLink className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerNetwork;
