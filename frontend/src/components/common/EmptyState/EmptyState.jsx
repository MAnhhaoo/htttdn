export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4 text-light-muted dark:text-dark-muted">
          <Icon className="w-8 h-8 opacity-50" />
        </div>
      )}
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">{title}</h3>
      {description && <p className="text-sm text-light-muted dark:text-dark-muted mb-6 max-w-sm">{description}</p>}
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
