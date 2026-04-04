import { motion } from "framer-motion";
import { productCategories, type ProductCategory } from "@/data/printingProducts";
import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface CategoryBarProps {
  activeCategory: string;
  onSelect: (id: string) => void;
  counts: Record<string, number>;
}

const CategoryBar = ({ activeCategory, onSelect, counts }: CategoryBarProps) => {
  return (
    <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 overflow-x-auto no-scrollbar">
      <div className="container mx-auto px-4 flex gap-8 min-w-max items-center">
        <button
          onClick={() => onSelect("all")}
          className={`flex flex-col items-center gap-2 group transition-all shrink-0 ${
            activeCategory === "all" ? "scale-110" : "opacity-80 hover:opacity-100"
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            activeCategory === "all" ? "bg-black shadow-xl" : "bg-white border-2 border-gray-200"
          }`}>
            <LucideIcons.LayoutGrid className={`w-6 h-6 ${activeCategory === "all" ? "text-white" : "text-black"}`} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-black">
            ALL ({counts.all || 0})
          </span>
        </button>

        {productCategories.map((cat) => {
          const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Paintbrush;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex flex-col items-center gap-2 group transition-all shrink-0 ${
                isActive ? "scale-110" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isActive ? "bg-black shadow-xl" : "bg-white border-2 border-gray-200"
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-black"}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-black">
                {cat.name.toUpperCase()} ({counts[cat.id] || 0})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
