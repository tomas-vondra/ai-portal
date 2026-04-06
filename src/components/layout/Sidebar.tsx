import { Link, useParams } from 'react-router-dom';
import { PHASE_CONFIGS, SINGLE_PHASE_IDS } from '../../utils/phaseConfig';
import type { PhaseStatus } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { formatDateTime } from '../../utils/formatters';
import clsx from 'clsx';

function StatusIcon({ status, type }: { status: PhaseStatus; type: 'single' | 'continuous' }) {
  if (status === 'running') {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
      </span>
    );
  }

  const styles: Record<PhaseStatus, string> = {
    locked: 'text-surface-300',
    waiting: 'text-surface-400',
    running: 'text-blue-500',
    review: 'text-amber-500',
    approved: 'text-green-500',
    error: 'text-red-500',
    ready: 'text-green-500',
    rejected: 'text-red-500',
  };

  const icons: Record<PhaseStatus, string> = {
    locked: '·',
    waiting: '○',
    running: '◎',
    review: '◉',
    approved: '✓',
    error: '✗',
    ready: '↻',
    rejected: '⊘',
  };

  return <span className={`text-base font-bold ${styles[status]}`}>{icons[status]}</span>;
}

export function Sidebar() {
  const { projectId, phaseId } = useParams();
  const project = useProjectStore((s) => s.getProject(projectId ?? ''));
  if (!project) return null;

  const activePhaseId = phaseId ? parseInt(phaseId) : 1;

  const approvedSingleCount = SINGLE_PHASE_IDS.filter(
    (id) => project.phases[id]?.status === 'approved',
  ).length;

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col shrink-0 overflow-y-auto">
      {/* Progress bar */}
      <div className="p-4 border-b border-surface-200">
        <div className="text-xs text-surface-500 mb-2">
          {approvedSingleCount} z {SINGLE_PHASE_IDS.length} klíčových fází dokončeno
        </div>
        <div className="w-full bg-surface-100 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(approvedSingleCount / SINGLE_PHASE_IDS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Phase list */}
      <nav className="flex-1 py-2">
        {PHASE_CONFIGS.map((cfg) => {
          const phase = project.phases[cfg.id];
          if (!phase) return null;

          const isActive = cfg.id === activePhaseId;

          return (
            <Link
              key={cfg.id}
              to={`/projects/${projectId}/phase/${cfg.id}`}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-surface-700 hover:bg-surface-50',
              )}
            >
              <StatusIcon status={phase.status} type={cfg.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium">
                    F{cfg.id}. {cfg.name}
                  </span>
                  {cfg.type === 'continuous' && (
                    <span className="text-surface-400 text-xs shrink-0">↻</span>
                  )}
                </div>
                {cfg.type === 'continuous' && phase.lastRunAt && (phase.status === 'ready' || phase.status === 'approved') && (
                  <div className="text-xs text-green-600 truncate mt-0.5">
                    ↻ {formatDateTime(phase.lastRunAt)}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
