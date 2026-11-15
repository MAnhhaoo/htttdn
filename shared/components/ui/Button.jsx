export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#1A3A2C] text-white hover:bg-[#2A5C4A] focus:ring-[#2A5C4A] dark:bg-[#2A5C4A] dark:hover:bg-[#35755B] shadow-sm',
    gold:
      'bg-[#C9A84C] text-[#14221B] hover:bg-[#B08A2E] focus:ring-[#C9A84C] font-semibold shadow-sm',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-[#2A5C4A] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
    ghost:
      'text-slate-600 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
}

