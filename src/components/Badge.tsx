import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'violet' | 'neutral' | 'hot' | 'warm' | 'cold' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'cyan', 
  className = '' 
}) => {
  const variantStyles = {
    cyan: 'border-[#00F2FE]/30 bg-[#00F2FE]/10 text-[#00F2FE]',
    blue: 'border-[#4FACFE]/30 bg-[#4FACFE]/10 text-[#38BDF8]',
    violet: 'border-[#8A2387]/30 bg-[#8A2387]/10 text-[#C084FC]',
    neutral: 'border-white/10 bg-white/5 text-[#9BA3AE]',
    hot: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    warm: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    cold: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
    outline: 'border-white/10 bg-transparent text-[#9BA3AE]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase border backdrop-blur-md ${variantStyles[variant]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
};
