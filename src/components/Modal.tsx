import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#07090C]/85 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#101419] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden`}>
        {/* Subtle cyan corner indicator */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00F2FE]/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm font-mono text-[#00F2FE] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9BA3AE] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
