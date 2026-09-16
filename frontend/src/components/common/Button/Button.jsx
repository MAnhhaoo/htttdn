export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all duration-200 cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-luxury',
    secondary: 'bg-light-card text-light-text border border-light-border hover:bg-gray-50 dark:bg-dark-card dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-border',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-light-muted hover:bg-gray-100 hover:text-light-text dark:text-dark-muted dark:hover:bg-dark-border dark:hover:text-dark-text',
    dark: 'bg-light-text text-light-bg hover:opacity-90 dark:bg-dark-text dark:text-dark-bg',
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
