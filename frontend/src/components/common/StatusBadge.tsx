import type { PhaseStatus } from '../../types';
import clsx from 'clsx';

const statusConfig: Record<PhaseStatus, { label: string; classes: string }> = {
  locked: { label: 'Zamčeno', classes: 'bg-surface-100 text-surface-400' },
  waiting: { label: 'Čeká na vstup', classes: 'bg-surface-100 text-surface-600' },
  running: { label: 'Probíhá', classes: 'bg-blue-50 text-blue-700 animate-pulse' },
  review: { label: 'Čeká na schválení', classes: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Dokončeno', classes: 'bg-green-50 text-green-700' },
  error: { label: 'Chyba', classes: 'bg-red-50 text-red-700' },
  ready: { label: 'Připraveno', classes: 'bg-green-50 text-green-700' },
  rejected: { label: 'Zamítnuto', classes: 'bg-red-50 text-red-700' },
};

export function StatusBadge({ status }: { status: PhaseStatus }) {
  const config = statusConfig[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.classes)}>
      {config.label}
    </span>
  );
}
