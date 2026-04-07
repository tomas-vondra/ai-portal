import { useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Sidebar } from '../components/layout/Sidebar';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { getPhaseConfig, PHASE_CONFIGS } from '../utils/phaseConfig';
import { Phase1Contact } from '../components/phases/Phase1Contact';
import { Phase2Discovery } from '../components/phases/Phase2Discovery';
import { Phase3Concept } from '../components/phases/Phase3Concept';
import { Phase4EP } from '../components/phases/Phase4EP';
import { Phase5Offer } from '../components/phases/Phase5Offer';
import { Phase6Contracts } from '../components/phases/Phase6Contracts';
import { Phase7Setup } from '../components/phases/Phase7Setup';
import { Phase8Dev } from '../components/phases/Phase8Dev';
import { Phase9Delivery } from '../components/phases/Phase9Delivery';
import { Phase10Testing } from '../components/phases/Phase10Testing';
import { Phase11Docs } from '../components/phases/Phase11Docs';
import { Phase12Handover } from '../components/phases/Phase12Handover';
import { Phase13Ops } from '../components/phases/Phase13Ops';

const phaseComponents: Record<number, React.ComponentType<{ projectId: string; phase: any }>> = {
  1: Phase1Contact,
  2: Phase2Discovery,
  3: Phase3Concept,
  4: Phase4EP,
  5: Phase5Offer,
  6: Phase6Contracts,
  7: Phase7Setup,
  8: Phase8Dev,
  9: Phase9Delivery,
  10: Phase10Testing,
  11: Phase11Docs,
  12: Phase12Handover,
  13: Phase13Ops,
};

export function ProjectDetailPage() {
  const { projectId, phaseId } = useParams();
  const project = useProjectStore((s) => s.getProject(projectId ?? ''));
  const refreshProject = useProjectStore((s) => s.refreshProject);
  const isLoading = useProjectStore((s) => s.isLoading);

  useEffect(() => {
    if (projectId) {
      refreshProject(projectId);
    }
  }, [projectId, refreshProject]);

  if (!project) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  const phaseNum = parseInt(phaseId ?? '1');
  const phase = project.phases[phaseNum];
  const phaseConfig = getPhaseConfig(phaseNum);

  if (!phase) {
    return <Navigate to={`/projects/${projectId}/phase/1`} replace />;
  }

  const PhaseComponent = phaseComponents[phaseNum];

  // Find active phase for project name link
  const activePhaseId = PHASE_CONFIGS.find((cfg) => {
    const ps = project.phases[cfg.id];
    return ps && (ps.status === 'review' || ps.status === 'running' || ps.status === 'rejected' || ps.status === 'waiting' || ps.status === 'error');
  })?.id ?? phaseNum;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-3 border-b border-surface-200 bg-white">
          <Breadcrumb
            items={[
              { label: 'Projekty', to: '/' },
              { label: project.name, to: `/projects/${projectId}/phase/${activePhaseId}` },
              { label: `F${phaseNum}. ${phaseConfig.name}` },
            ]}
          />
        </div>
        {PhaseComponent && (
          <PhaseComponent projectId={project.id} phase={phase} />
        )}
      </div>
    </div>
  );
}
