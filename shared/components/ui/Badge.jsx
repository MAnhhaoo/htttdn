export function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    brand: 'bg-[#EEF5F1] text-[#1A3A2C] dark:bg-[#1A3A2C]/50 dark:text-[#8BBAA1]',
    gold: 'bg-[#FBF7EC] text-[#8C6B1F] border border-[#C9A84C]/30 dark:bg-[#C9A84C]/15 dark:text-[#DEC47E]',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300',
    error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300',
    info: 'bg-[#EEF5F1] text-[#2A5C4A] dark:bg-[#1A3A2C]/45 dark:text-[#8BBAA1]',
    purple: 'bg-[#FBF7EC] text-[#8C6B1F] dark:bg-[#C9A84C]/20 dark:text-[#EAD8A6]',
    outline: 'border border-slate-300 text-slate-700 bg-transparent dark:border-slate-700 dark:text-slate-300',
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

