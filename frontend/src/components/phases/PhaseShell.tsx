import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Code2, AlertTriangle, RefreshCw, Info, Download } from 'lucide-react';
import type { PhaseState } from '../../types';
import { getPhaseConfig, PHASE_CONFIGS } from '../../utils/phaseConfig';
import { StatusBadge } from '../common/StatusBadge';
import { AgentLog } from '../common/AgentLog';
import { Button } from '../common/Button';
import { VersionHistoryPanel } from '../panels/VersionHistoryPanel';
import { SystemPromptPanel } from '../panels/SystemPromptPanel';
import { Modal } from '../common/Modal';
import { useProjectStore } from '../../store/projectStore';
import { formatDateTime } from '../../utils/formatters';

interface PhaseShellProps {
  projectId: string;
  phase: PhaseState;
  inputSection?: ReactNode;
  outputSection?: ReactNode;
  onStart?: () => void;
  startLabel?: string;
  canApprove?: boolean;
  children?: ReactNode;
}

export function PhaseShell({ projectId, phase, inputSection, outputSection, onStart, startLabel, canApprove = true, children }: PhaseShellProps) {
  const config = getPhaseConfig(phase.phaseId);
  const store = useProjectStore();
  const navigate = useNavigate();

  const [showVersions, setShowVersions] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovedRejectModal, setShowApprovedRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [rejectTags, setRejectTags] = useState<string[]>([]);

  const isContinuous = config.type === 'continuous';
  const isLocked = phase.status === 'locked';
  const isRunning = phase.status === 'running';
  const isReview = phase.status === 'review';
  const isError = phase.status === 'error';
  const isApproved = phase.status === 'approved';
  const isRejected = phase.status === 'rejected';
  const isReady = phase.status === 'ready'; // continuous completed
  const hasOutput = phase.output !== null;
  const canStart = phase.status === 'waiting' || phase.status === 'ready' || phase.status === 'rejected';
  const inputsDisabled = isLocked || isApproved || isReady || isRunning;

  const blockingDep = isLocked
    ? config.dependencies.find((depId) => {
        const depPhase = store.getProject(projectId)?.phases[depId];
        return depPhase && depPhase.status !== 'approved' && depPhase.status !== 'ready';
      })
    : null;
  const blockingConfig = blockingDep ? getPhaseConfig(blockingDep) : null;

  const tags = ['Chybný obsah', 'Špatný formát', 'Nepochopil zadání', 'Jiné'];

  const handleReject = () => {
    store.rejectPhase(projectId, phase.phaseId, rejectFeedback);
    setShowRejectModal(false);
    setRejectFeedback('');
    setRejectTags([]);
  };

  const handleApprovedReject = () => {
    store.rejectApprovedPhase(projectId, phase.phaseId, rejectFeedback);
    setShowApprovedRejectModal(false);
    setRejectFeedback('');
  };

  const handleApprove = () => {
    store.approvePhase(projectId, phase.phaseId);
    // Navigate to next waiting phase
    const updatedProject = store.getProject(projectId);
    if (updatedProject) {
      const nextPhase = PHASE_CONFIGS.find((cfg) =>
        cfg.id > phase.phaseId && updatedProject.phases[cfg.id]?.status === 'waiting',
      );
      if (nextPhase) {
        navigate(`/projects/${projectId}/phase/${nextPhase.id}`);
      }
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(phase.output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `F${phase.phaseId}-${config.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTogglePrompt = () => {
    setShowPrompt((prev) => !prev);
    setShowVersions(false);
  };

  const handleToggleVersions = () => {
    setShowVersions((prev) => !prev);
    setShowPrompt(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-surface-900">
                F{config.id}. {config.name}
              </h1>
              <StatusBadge status={phase.status} />
              {phase.systemPromptModified && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Upravený prompt</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-500">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                config.type === 'continuous' ? 'bg-purple-50 text-purple-700' : 'bg-surface-100 text-surface-600'
              }`}>
                {config.type === 'continuous' ? 'Kontinuální' : 'Jednorázová'}
              </span>
              <span>{config.description}</span>
            </div>
            {config.type === 'continuous' && phase.lastRunAt && (
              <div className="text-sm text-green-600 mt-1">
                ↻ Naposledy spuštěno: {formatDateTime(phase.lastRunAt)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="icon"
              size="icon-md"
              onClick={handleTogglePrompt}
              title="Systémový prompt"
            >
              <Code2 className="w-5 h-5" />
            </Button>
            {phase.versions.length > 0 && (
              <Button
                variant="icon"
                size="icon-md"
                onClick={handleToggleVersions}
                title="Historie verzí"
                className="relative"
              >
                <Clock className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {phase.versions.length}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Locked banner */}
        {isLocked && blockingConfig && (
          <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-surface-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-surface-700">
                Tato fáze bude dostupná po dokončení:{' '}
                <Link
                  to={`/projects/${projectId}/phase/${blockingConfig.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                  F{blockingConfig.id}. {blockingConfig.name}
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">Agent narazil na chybu</p>
              <p className="text-sm text-red-600 mt-1">Zkontrolujte log pro detail chyby a zkuste to znovu.</p>
            </div>
            <Button
              variant="danger"
              size="md"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => store.retryAgent(projectId, phase.phaseId)}
              className="shrink-0 !bg-red-600 !text-white hover:!bg-red-700 !border-red-600"
            >
              Zkusit znovu
            </Button>
          </div>
        )}

        {/* Rejected banner */}
        {isRejected && phase.rejectionFeedback && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">Fáze byla zamítnuta</p>
              <p className="text-sm text-red-600 mt-1">{phase.rejectionFeedback}</p>
            </div>
          </div>
        )}

        {/* Input section */}
        {inputSection && (
          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-3">Vstup</h2>
            <div className={inputsDisabled ? 'opacity-60 pointer-events-none' : ''}>
              {inputSection}
            </div>
          </section>
        )}

        {/* Start button */}
        {(canStart || isLocked) && onStart && (
          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              disabled={isLocked}
              title={isLocked && blockingConfig ? `Nejprve dokončete F${blockingConfig.id}. ${blockingConfig.name}` : undefined}
            >
              {startLabel ?? 'Spustit'}
            </Button>
          </div>
        )}

        {/* Agent Log */}
        <AgentLog entries={phase.log} isRunning={isRunning} hasError={isError} />

        {/* Output section */}
        {hasOutput && outputSection && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-surface-900">Výstup</h2>
            </div>
            {outputSection}
          </section>
        )}

        {children}

        {/* Review action buttons (not for continuous — they auto-approve) */}
        {isReview && !isContinuous && (
          <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
            <Button variant="success" size="lg" onClick={handleApprove} disabled={!canApprove}>
              Schválit
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => setShowRejectModal(true)}
            >
              Zamítnout & Přegenerovat
            </Button>
          </div>
        )}

        {/* Approve existing output (phase re-unlocked after upstream regen) */}
        {canStart && hasOutput && !isContinuous && (
          <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
            <Button variant="success" size="lg" onClick={handleApprove} disabled={!canApprove}>
              Schválit stávající výstup
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => setShowRejectModal(true)}
            >
              Zamítnout & Přegenerovat
            </Button>
          </div>
        )}

        {/* Approved phase actions */}
        {(isApproved || isReady) && hasOutput && (
          <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
            <Button
              variant="secondary"
              size="lg"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Exportovat
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => setShowApprovedRejectModal(true)}
            >
              Zamítnout & Přegenerovat
            </Button>
          </div>
        )}

        {/* Waiting/rejected empty state */}
        {(phase.status === 'waiting' || phase.status === 'rejected') && !hasOutput && !inputSection && (
          <div className="bg-surface-50 rounded-lg p-8 text-center">
            <p className="text-surface-500 text-sm">{config.description}</p>
            <p className="text-surface-400 text-xs mt-2">Zadejte vstup a spusťte agenta.</p>
          </div>
        )}
      </div>

      {/* Panels */}
      <VersionHistoryPanel
        open={showVersions}
        onClose={() => setShowVersions(false)}
        versions={phase.versions}
        currentVersionId={phase.currentVersionId}
        currentOutput={phase.output}
        onRestore={(versionId) => {
          store.restoreVersion(projectId, phase.phaseId, versionId);
          setShowVersions(false);
        }}
      />
      <SystemPromptPanel
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
        prompt={phase.systemPrompt}
        isModified={phase.systemPromptModified}
        onSave={(prompt) => store.updateSystemPrompt(projectId, phase.phaseId, prompt)}
        onReset={() => store.resetSystemPrompt(projectId, phase.phaseId)}
      />

      {/* Reject modal (from review) */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Zamítnout & Přegenerovat">
        <div className="space-y-4">
          <p className="text-sm text-surface-600">Co agent udělal špatně?</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setRejectTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  rejectTags.includes(tag)
                    ? 'bg-red-100 text-red-700 border border-red-300 shadow-sm'
                    : 'bg-surface-100 text-surface-600 border border-surface-200 hover:bg-surface-200 hover:border-surface-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <textarea
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            placeholder="Volitelný komentář..."
            className="w-full p-3 rounded-lg border border-surface-200 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            Fáze bude resetována. Předchozí výstup bude uložen v historii verzí.
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={() => setShowRejectModal(false)}>
              Zrušit
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleReject}
              className="!bg-red-600 !text-white hover:!bg-red-700 !border-red-600"
            >
              Zamítnout & Přegenerovat
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject approved phase modal (with downstream warning) */}
      <Modal open={showApprovedRejectModal} onClose={() => setShowApprovedRejectModal(false)} title="Zamítnout schválenou fázi">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
            <p className="font-medium mb-1">Pozor: tato akce ovlivní navazující fáze</p>
            <p>Pokud byly navazující fáze již spuštěny, přegenerování se v nich automaticky nereflektuje. Navazující fáze budou znovu uzamčeny.</p>
          </div>
          <textarea
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            placeholder="Důvod zamítnutí..."
            className="w-full p-3 rounded-lg border border-surface-200 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={() => setShowApprovedRejectModal(false)}>
              Zrušit
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleApprovedReject}
              className="!bg-red-600 !text-white hover:!bg-red-700 !border-red-600"
            >
              Zamítnout & Přegenerovat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
