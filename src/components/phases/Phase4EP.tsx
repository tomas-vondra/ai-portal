import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

const mockSections = [
  { id: 's1', title: 'CRUD operace pro objednávky', status: 'pending' as const },
  { id: 's2', title: 'Real-time tracking přes WebSocket', status: 'pending' as const },
  { id: 's3', title: 'Integrace dopravců — REST API', status: 'pending' as const },
];

export function Phase4EP({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState(mockSections);

  const handleStart = () => {
    store.startAgent(projectId, 4);
    // Simulate iterative interaction
    setTimeout(() => setShowModal(true), 3000);
  };

  const handleSectionAction = (action: 'approve' | 'edit' | 'reject') => {
    setSections((s) => s.map((sec, i) =>
      i === currentSection ? { ...sec, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'edited' } : sec
    ));
    if (currentSection < sections.length - 1) {
      setCurrentSection((c) => c + 1);
    } else {
      setShowModal(false);
    }
  };

  return (
    <>
      <PhaseShell
        projectId={projectId}
        phase={phase}
        onStart={handleStart}
        startLabel="Spustit tvorbu EP"
        inputSection={
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            Automaticky přebírá výstup z fáze Koncept & Rozhodnutí.
            <p className="mt-2 text-xs text-amber-600">
              Tato fáze pracuje iterativně — agent navrhuje sekce EP po jedné a čeká na vaše schválení.
            </p>
          </div>
        }
        outputSection={
          output ? (
            <div className="space-y-6">
              {/* Functional requirements */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-2">Funkční požadavky</h3>
                <div className="space-y-2">
                  {output.functionalRequirements?.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-lg p-3">
                      <div className="w-1 shrink-0 self-stretch bg-blue-400 rounded" />
                      <span className="text-sm text-surface-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-functional requirements */}
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-2">Nefunkční požadavky</h3>
                <div className="space-y-2">
                  {output.nonFunctionalRequirements?.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-lg p-3">
                      <div className="w-1 shrink-0 self-stretch bg-purple-400 rounded" />
                      <span className="text-sm text-surface-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech stack */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-50 rounded-lg p-3">
                  <div className="text-xs text-surface-500 mb-1">Technologický stack</div>
                  <div className="text-sm font-medium text-surface-900">{output.techStack}</div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3">
                  <div className="text-xs text-surface-500 mb-1">Hosting</div>
                  <div className="text-sm font-medium text-surface-900">{output.hosting}</div>
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-surface-50 rounded-lg p-3">
                <div className="text-xs text-surface-500 mb-1">Maintenance plán</div>
                <div className="text-sm text-surface-700">{output.maintenance}</div>
              </div>

              {/* Scope */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Součástí dodávky</h3>
                  <ul className="space-y-1">
                    {output.scope?.included?.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-green-600">
                        <span>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-700 mb-2">Není součástí</h3>
                  <ul className="space-y-1">
                    {output.scope?.excluded?.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                        <span>✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="md">Stáhnout jako DOCX</Button>
                <Button variant="ghost" size="md">Stáhnout jako PDF</Button>
              </div>
            </div>
          ) : null
        }
      />

      {/* Iterative approval modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Agent navrhl sekci EP"
      >
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4">
            <div className="text-xs text-surface-500 mb-1">Sekce {currentSection + 1}/{sections.length}</div>
            <div className="text-sm font-medium text-surface-900">
              {sections[currentSection]?.title}
            </div>
          </div>
          <p className="text-sm text-surface-600">
            Agent navrhuje přidat tento funkční požadavek do EP. Jak chcete pokračovat?
          </p>
          <div className="flex gap-3">
            <Button variant="success" size="md" onClick={() => handleSectionAction('approve')} className="flex-1">
              Schválit
            </Button>
            <Button variant="secondary" size="md" onClick={() => handleSectionAction('edit')} className="flex-1">
              Upravit
            </Button>
            <Button variant="danger" size="md" onClick={() => handleSectionAction('reject')} className="flex-1">
              Zamítnout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
