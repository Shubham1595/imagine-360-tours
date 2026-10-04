import React from 'react';

interface TechnicalGridProps {
  className?: string;
}

export const TechnicalGrid: React.FC<TechnicalGridProps> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-60" />
      
      {/* Subtle top & bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090C] via-transparent to-[#07090C] opacity-90" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#00F2FE]/10 via-[#4FACFE]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};
