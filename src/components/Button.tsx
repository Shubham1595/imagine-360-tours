import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  children,
  className = '',
  href,
  external,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-tech font-medium transition-all duration-300 rounded-lg group overflow-hidden cursor-pointer select-none active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] font-semibold hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:brightness-105 border border-transparent",
    secondary: "bg-[#101419] text-white hover:bg-[#161C24] border border-white/10 hover:border-[#00F2FE]/40 hover:shadow-[0_0_20px_rgba(0,242,254,0.15)]",
    outline: "bg-transparent text-white border border-white/20 hover:border-[#00F2FE] hover:text-[#00F2FE] hover:bg-[#00F2FE]/5",
    ghost: "bg-transparent text-[#9BA3AE] hover:text-white hover:bg-white/5"
  };

  const content = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5 ${size === 'lg' ? 'w-5 h-5' : ''}`} />
      )}
      <span className="relative z-10">{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${size === 'lg' ? 'w-5 h-5' : ''}`} />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
};
