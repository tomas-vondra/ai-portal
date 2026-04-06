import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-surface-300 mb-4">
        {icon ?? <Inbox className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-surface-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-surface-500 mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}
