import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; to?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const backTo = '/';

  return (
    <div className="flex items-center gap-2 text-sm text-surface-500">
      {backTo && (
        <Link to={backTo} className="p-1 rounded hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3 h-3 text-surface-300" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-surface-700 no-underline text-surface-500">
              {item.label}
            </Link>
          ) : (
            <span className="text-surface-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
