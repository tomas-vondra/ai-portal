import clsx from 'clsx';

interface DiffItem {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

interface DiffViewProps {
  items: DiffItem[];
}

export function DiffView({ items }: DiffViewProps) {
  return (
    <div className="rounded-lg border border-surface-200 overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          className={clsx(
            'flex items-start gap-3 px-4 py-2 text-sm border-b border-surface-100 last:border-0',
            item.type === 'added' && 'bg-green-50',
            item.type === 'removed' && 'bg-red-50',
          )}
        >
          <span
            className={clsx(
              'shrink-0 w-4 text-center font-mono font-bold',
              item.type === 'added' && 'text-green-600',
              item.type === 'removed' && 'text-red-600',
              item.type === 'unchanged' && 'text-surface-300',
            )}
          >
            {item.type === 'added' ? '+' : item.type === 'removed' ? '−' : ' '}
          </span>
          <span
            className={clsx(
              item.type === 'removed' && 'line-through text-red-600',
              item.type === 'added' && 'text-green-700',
              item.type === 'unchanged' && 'text-surface-600',
            )}
          >
            {item.content}
          </span>
        </div>
      ))}
    </div>
  );
}

// Helper to generate mock diff from two lists
export function generateMockDiff(current: string[], previous: string[]): DiffItem[] {
  const items: DiffItem[] = [];
  const prevSet = new Set(previous);
  const currSet = new Set(current);

  for (const item of previous) {
    if (!currSet.has(item)) {
      items.push({ type: 'removed', content: item });
    }
  }
  for (const item of current) {
    if (prevSet.has(item)) {
      items.push({ type: 'unchanged', content: item });
    } else {
      items.push({ type: 'added', content: item });
    }
  }
  return items;
}
