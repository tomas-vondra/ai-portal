import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Layers, Search, Archive } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { PHASE_CONFIGS, SINGLE_PHASE_IDS } from '../utils/phaseConfig';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';

export function ProjectListPage() {
  const { projects, createProject, archiveProject } = useProjectStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'phase'>('date');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = projects
    .filter((p) => showArchived || !p.archived)
    .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.client.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return getCurrentPhase(a) - getCurrentPhase(b);
    });

  const handleCreate = () => {
    if (!newName.trim() || !newClient.trim()) return;
    const id = createProject(newName.trim(), newClient.trim());
    setShowCreate(false);
    setNewName('');
    setNewClient('');
    navigate(`/projects/${id}/phase/1`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Projekty</h1>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreate(true)}
        >
          Nový projekt
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Zatím žádné projekty"
          description="Vytvořte svůj první projekt a začněte automatizovat projektový proces."
          action={
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreate(true)}
            >
              Nový projekt
            </Button>
          }
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Hledat projekt..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 text-sm text-surface-500">
              <span className="mr-1">Řadit:</span>
              <button
                onClick={() => setSortBy('date')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  sortBy === 'date'
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Datum
              </button>
              <button
                onClick={() => setSortBy('phase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  sortBy === 'phase'
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Fáze
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-surface-500 ml-auto cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              Archivované
            </label>
          </div>

          {/* Project cards */}
          <div className="grid gap-4">
            {filtered.map((project) => {
              const currentPhaseId = getCurrentPhase(project);
              const currentConfig = PHASE_CONFIGS.find((c) => c.id === currentPhaseId);
              const currentPhase = project.phases[currentPhaseId];
              const approvedCount = SINGLE_PHASE_IDS.filter(
                (id) => project.phases[id]?.status === 'approved',
              ).length;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/phase/${currentPhaseId}`}
                  className={`group block bg-white rounded-xl border border-surface-200 p-5 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 no-underline ${project.archived ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">{project.name}</h2>
                        {project.archived && (
                          <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">Archivováno</span>
                        )}
                      </div>
                      <p className="text-sm text-surface-500 mt-0.5">{project.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          archiveProject(project.id);
                        }}
                        className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all"
                        title={project.archived ? 'Obnovit projekt' : 'Archivovat projekt'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      {currentPhase && <StatusBadge status={currentPhase.status} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                        <span>
                          F{currentPhaseId}. {currentConfig?.name}
                        </span>
                        <span>{approvedCount}/{SINGLE_PHASE_IDS.length}</span>
                      </div>
                      <div className="w-full bg-surface-100 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(approvedCount / SINGLE_PHASE_IDS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-surface-400">
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nový projekt">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Název projektu</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Např. E-shop pro FirmaCo"
              className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Klient</label>
            <input
              type="text"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
              placeholder="Název firmy"
              className="w-full px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => setShowCreate(false)}>
              Zrušit
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate} disabled={!newName.trim() || !newClient.trim()}>
              Vytvořit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getCurrentPhase(project: any): number {
  for (let i = 13; i >= 1; i--) {
    const phase = project.phases[i];
    if (phase && (phase.status === 'running' || phase.status === 'review' || phase.status === 'error')) {
      return i;
    }
  }
  for (let i = 1; i <= 13; i++) {
    const phase = project.phases[i];
    if (phase && (phase.status === 'waiting' || phase.status === 'ready')) {
      return i;
    }
  }
  return 1;
}
