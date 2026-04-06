import { X, Clock, RotateCcw, Sparkles, Pencil, ArchiveRestore, Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { OutputVersion, VersionStatus } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { Button } from '../common/Button';

interface VersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  versions: OutputVersion[];
  currentVersionId: string | null;
  currentOutput: Record<string, unknown> | null;
  onRestore: (versionId: string) => void;
}

/* ── action config (how version was created) ──────────────── */

const actionConfig: Record<string, { label: string; icon: typeof Sparkles }> = {
  generated: { label: 'Vygenerováno', icon: Sparkles },
  edited:    { label: 'Upraveno',     icon: Pencil },
  restored:  { label: 'Obnoveno',     icon: ArchiveRestore },
};

/* ── status config (current state of the version) ─────────── */

const statusConfig: Record<VersionStatus, { label: string; icon: typeof Loader2; className: string }> = {
  running:  { label: 'Probíhá',       icon: Loader2,      className: 'bg-blue-100 text-blue-700' },
  review:   { label: 'Ke kontrole',   icon: Eye,          className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Schváleno',     icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Zamítnuto',     icon: XCircle,      className: 'bg-red-100 text-red-700' },
};

/* ── dot color for timeline spine ─────────────────────────── */

const dotColors: Record<VersionStatus, string> = {
  running:  'bg-blue-500',
  review:   'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-400',
};

export function VersionHistoryPanel({ open, onClose, versions, currentVersionId, currentOutput, onRestore }: VersionHistoryPanelProps) {
  if (!open) return null;

  const reversedVersions = [...versions].reverse();

  // Build version number map (1-based, original order)
  const versionNumberMap = new Map<string, number>();
  versions.forEach((v, i) => versionNumberMap.set(v.id, i + 1));

  // Compare against actual phase output (null after rejection), not version data
  const outputJson = currentOutput ? JSON.stringify(currentOutput) : null;

  const isRestorable = (version: OutputVersion) => {
    if (version.id === currentVersionId) return false;
    if (version.status === 'running') return false;
    if (!version.data || Object.keys(version.data).length === 0) return false;
    // Prevent duplicate restore — only when phase has output matching this version
    if (outputJson && JSON.stringify(version.data) === outputJson) return false;
    return true;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-surface-900/10 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-white shadow-2xl z-40 flex flex-col border-l border-surface-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 tracking-tight">Historie verzí</h3>
              <p className="text-xs text-surface-400">
                {versions.length} {versions.length === 1 ? 'záznam' : versions.length < 5 ? 'záznamy' : 'záznamů'}
              </p>
            </div>
          </div>
          <Button variant="icon" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Timeline body */}
        <div className="flex-1 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-surface-300" />
              </div>
              <p className="text-sm text-surface-500 font-medium">Zatím žádné verze</p>
              <p className="text-xs text-surface-400 mt-1">Verze se vytvoří po prvním spuštění agenta.</p>
            </div>
          ) : (
            <div className="py-2">
              {reversedVersions.map((version, idx) => {
                const isCurrent = version.id === currentVersionId;
                const isRejected = version.status === 'rejected';
                const isRunning = version.status === 'running';
                const action = actionConfig[version.action] ?? actionConfig.generated;
                const status = statusConfig[version.status];
                const ActionIcon = action.icon;
                const StatusIcon = status.icon;
                const versionNum = versionNumberMap.get(version.id) ?? 0;
                const isLast = idx === reversedVersions.length - 1;
                const canRestore = isRestorable(version);

                return (
                  <div key={version.id} className="relative flex px-6">
                    {/* Timeline spine */}
                    <div className="flex flex-col items-center mr-4 shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full mt-4 ring-2 ring-white shrink-0 ${
                          isCurrent ? `${dotColors[version.status]} ring-primary-100` : dotColors[version.status]
                        } ${isRejected && !isCurrent ? 'opacity-60' : ''} ${isRunning ? 'animate-pulse' : ''}`}
                      />
                      {!isLast && <div className="w-px flex-1 bg-surface-200 mt-1" />}
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 mb-3 rounded-lg border transition-all duration-150 ${
                        isCurrent
                          ? 'border-primary-200 bg-primary-50/40 shadow-sm'
                          : isRejected
                            ? 'border-red-100 bg-red-50/20'
                            : 'border-surface-150 bg-white hover:border-surface-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-3.5">
                        {/* Top row: version number + action + status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${
                              isCurrent ? 'text-primary-700' : isRejected ? 'text-red-400' : 'text-surface-400'
                            }`}>
                              v{versionNum}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-surface-500">
                              <ActionIcon className="w-3 h-3" />
                              {action.label}
                            </span>
                          </div>

                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${status.className}`}>
                            <StatusIcon className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                            {status.label}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <p className={`text-xs ${isRejected ? 'text-surface-400' : 'text-surface-500'}`}>
                          {formatDateTime(version.createdAt)}
                        </p>

                        {/* Note (rejection feedback, restore source) */}
                        {version.note && (
                          <p className={`text-xs mt-2 pl-2.5 border-l-2 italic leading-relaxed ${
                            isRejected
                              ? 'border-red-200 text-red-500'
                              : 'border-surface-200 text-surface-500'
                          }`}>
                            {version.note}
                          </p>
                        )}

                        {/* Restore button */}
                        {canRestore && (
                          <button
                            onClick={() => onRestore(version.id)}
                            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
                              isRejected
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100 hover:text-primary-700'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Obnovit tuto verzi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {versions.length > 0 && (
          <div className="px-6 py-3 border-t border-surface-100 bg-surface-50/30">
            <p className="text-[11px] text-surface-400 text-center">
              Obnovení verze vytvoří nový záznam a přepne fázi do režimu kontroly.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
