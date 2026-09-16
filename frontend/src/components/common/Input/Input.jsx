import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white dark:bg-dark-card border rounded-md text-sm transition-all outline-none 
        text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted
        ${error 
          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
          : 'border-light-border dark:border-dark-border focus:border-primary focus:ring-2 focus:ring-primary-light'} 
        ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
