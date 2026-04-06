import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { GitBranch, ExternalLink, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase7Setup({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const isPhaseApprovedOrReady = phase.status === 'approved' || phase.status === 'ready';
  const [step, setStep] = useState<1 | 2>(isPhaseApprovedOrReady || output?.ticketsApproved ? 2 : 1);
  const [githubCreated, setGithubCreated] = useState(!!output?.githubUrl);
  const [jiraCreated, setJiraCreated] = useState(!!output?.jiraUrl);

  const handleStart = () => {
    store.startAgent(projectId, 7);
  };

  const handleApproveTickets = () => {
    setStep(2);
    if (output) {
      store.updateOutput(projectId, 7, { ...output, ticketsApproved: true });
    }
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onStart={handleStart}
      startLabel="Připravit rozpad ticketů"
      canApprove={step === 2}
      inputSection={
        <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
          Automaticky přebírá rozpad z fáze Nabídka & Plán a EP z fáze Engineering Project.
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Step 1: Ticket breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-surface-700">
                  Krok 1 — Rozpad ticketů
                  {step === 2 && <Check className="w-4 h-4 text-green-500 inline ml-2" />}
                </h3>
              </div>
              <div className="border border-surface-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-surface-500">Typ</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-surface-500">Název</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-surface-500">SP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {output.tickets?.map((ticket: any) => (
                      <tr key={ticket.id} className="hover:bg-surface-50">
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            ticket.type === 'epic' ? 'bg-purple-100 text-purple-700' :
                            ticket.type === 'story' ? 'bg-blue-100 text-blue-700' :
                            'bg-surface-100 text-surface-600'
                          }`}>
                            {ticket.type}
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-surface-700 ${
                          ticket.type === 'task' ? 'pl-12' : ticket.type === 'story' ? 'pl-8' : ''
                        }`}>
                          {ticket.name}
                        </td>
                        <td className="px-4 py-2 text-right text-surface-900 font-medium">{ticket.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {step === 1 && phase.status === 'review' && (
                <div className="mt-3">
                  <Button variant="success" size="md" onClick={handleApproveTickets}>
                    Schválit rozpad
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Create environment */}
            {step === 2 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-3">Krok 2 — Vytvoření prostředí</h3>
                <div className="flex gap-4">
                  <div className="flex-1 border border-surface-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="w-5 h-5" />
                      <span className="font-medium text-sm">GitHub repozitář</span>
                    </div>
                    {githubCreated ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        <span>Vytvořeno</span>
                        <a href="#" className="text-primary-600 hover:text-primary-700 ml-auto flex items-center gap-1">
                          Otevřít <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <Button variant="dark" size="md" onClick={() => setGithubCreated(true)} className="w-full">
                        Vytvořit GitHub repozitář
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 border border-surface-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">J</span>
                      <span className="font-medium text-sm">Jira projekt</span>
                    </div>
                    {jiraCreated ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        <span>Vytvořeno</span>
                        <a href="#" className="text-primary-600 hover:text-primary-700 ml-auto flex items-center gap-1">
                          Otevřít <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <Button variant="blue" size="md" onClick={() => setJiraCreated(true)} className="w-full">
                        Vytvořit Jira projekt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null
      }
    />
  );
}
