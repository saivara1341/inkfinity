import { motion } from "framer-motion";
import { User, Store, Truck, Printer, CheckCircle2 } from "lucide-react";

export const roles = [
  {
    id: "customer",
    title: "Customer",
    description: "Order visiting cards, banners, and personalized prints.",
    icon: User,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-600",
    features: ["Quick Checkout", "Order Tracking", "Local Discovery"]
  },
  {
    id: "shop", // Changed to match Signup.tsx expectations
    title: "Shop Owner",
    description: "Manage your print shop, receive orders, and grow online.",
    icon: Store,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-600",
    features: ["Order Management", "Digital Storefront", "Sourcing Portal"]
  },
  {
    id: "distributor",
    title: "Distributor / Raw Materials",
    description: "Supply paper, ink, and machinery to printing shops.",
    icon: Truck,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
    features: ["Bulk Sales", "Inventory Management", "Direct Payouts"]
  },
  {
    id: "manufacturer",
    title: "Manufacturer",
    description: "Bulk production and specialized printing solutions.",
    icon: Printer,
    color: "from-purple-500/20 to-fuchsia-500/20",
    iconColor: "text-purple-600",
    features: ["White Labeling", "Custom Quotes", "Enterprise Logistics"]
  }
];

interface RoleSelectionProps {
  onSelect: (roleId: string) => void;
  selectedRole?: string;
}

export const RoleSelection = ({ onSelect, selectedRole }: RoleSelectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {roles.map((role, idx) => (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * idx }}
          onClick={() => onSelect(role.id)}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden group ${
            selectedRole === role.id 
              ? "border-primary bg-primary/5 shadow-glow-sm" 
              : "border-border/60 bg-card hover:border-primary/40"
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl bg-background shadow-sm border border-border/50 flex items-center justify-center mb-4 ${role.iconColor}`}>
              <role.icon className="w-5 h-5" />
            </div>
            
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              {role.title}
            </h3>
            
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
              {role.description}
            </p>

            <div className="space-y-1.5">
              {role.features.slice(0, 2).map(feature => (
                <div key={feature} className="flex items-center gap-2 text-[10px] font-medium text-foreground/70">
                  <CheckCircle2 className="w-3 h-3 text-primary/60" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
