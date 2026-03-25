import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
  variant?: 'accent' | 'coral';
  textColor?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className, 
  width = 180, 
  height = 60,
  variant = 'accent',
  textColor,
  ...props 
}) => {
  const colorClass = variant === 'coral' ? 'stroke-coral' : 'stroke-accent';
  const fillClass = variant === 'coral' ? 'fill-coral/10 group-hover:fill-coral/20' : 'fill-accent/10 group-hover:fill-accent/20';
  const textClass = variant === 'coral' ? 'group-hover:text-coral' : 'group-hover:text-accent';

  // SVG points for the polyline based on width/height
  const points = `1,1 ${width - 1},1 ${width - 1},${height - 1} 1,${height - 1} 1,1`;

  return (
    <div className={cn("relative inline-flex items-center justify-center group cursor-pointer overflow-hidden", className)} style={{ width, height }}>
      <button 
        className="w-full h-full bg-transparent border-none outline-none cursor-pointer flex items-center justify-center relative z-10 transition-colors duration-500 hover:bg-black/5"
        {...props}
      >
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`} 
          className="absolute inset-0 pointer-events-none"
        >
          {/* Background Line */}
          <polyline 
            points={points} 
            className={cn("stroke-[3px] transition-all duration-500", fillClass, variant === 'coral' ? 'stroke-coral/30' : 'stroke-accent/30')}
          />
          {/* Highlight Line (Animated) */}
          <polyline 
            points={points} 
            className={cn("fill-none stroke-[3px] opacity-0 group-hover:opacity-100 btn-045-hl", colorClass)}
          />
        </svg>
        <span className={cn(
          "font-display font-bold uppercase tracking-widest transition-colors duration-500", 
          textColor || "text-foreground",
          !textColor && textClass
        )}>
          {children}
        </span>
      </button>
    </div>
  );
};

export default AnimatedButton;
