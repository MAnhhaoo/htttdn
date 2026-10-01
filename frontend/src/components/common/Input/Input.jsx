import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-light-text dark:text-dark-text">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-card
          text-light-text dark:text-dark-text outline-none transition-all duration-200
          placeholder:text-light-muted dark:placeholder:text-dark-muted
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-light-border dark:border-dark-border focus:border-primary focus:ring-1 focus:ring-primary'
          }
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
