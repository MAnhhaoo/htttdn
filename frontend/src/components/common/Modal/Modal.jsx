import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  // Prevent body scroll when modal is open
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

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Box */}
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-luxury-dark w-full max-w-lg max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-light-muted hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3 bg-gray-50 dark:bg-dark-bg/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
