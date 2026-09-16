import Button from '../Button/Button';
import { Search } from 'lucide-react';

export default function EmptyState({ 
  title = "No data found", 
  description = "There is nothing to display here at the moment.", 
  actionText, 
  onAction,
  icon: Icon = Search 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="text-light-muted dark:text-dark-muted mb-6 opacity-50">
        <Icon className="w-16 h-16" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">{title}</h3>
      <p className="text-sm text-light-muted dark:text-dark-muted mb-6 max-w-sm">{description}</p>
      
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
