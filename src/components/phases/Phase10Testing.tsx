import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { CheckCircle, XCircle, MinusCircle, Bug, Ticket } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase10Testing({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const [testUrl, setTestUrl] = useState('');
  const [ticketsCreated, setTicketsCreated] = useState(false);
  const [touched, setTouched] = useState(false);

  const urlError = touched && !testUrl.trim();

  const handleStart = () => {
    setTouched(true);
    if (!testUrl.trim()) return;
    store.setPhaseInput(projectId, 10, { testUrl });
    store.startAgent(projectId, 10);
    setTouched(false);
  };

  const statusIcons = {
    passed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    skipped: <MinusCircle className="w-4 h-4 text-surface-400" />,
  };

  const statusLabels = { passed: 'Prošlo', failed: 'Selhalo', skipped: 'Přeskočeno' };

  const severityColors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-surface-100 text-surface-600',
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onStart={handleStart}
      startLabel="Spustit testování"
      inputSection={
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            Akceptační kritéria z fáze 4 budou automaticky použity.
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              URL prostředí pro testování
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://staging.example.com"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${urlError ? 'border-red-300 bg-red-50' : 'border-surface-200'}`}
            />
            {urlError && <p className="text-xs text-red-500 mt-1">URL prostředí pro testování je povinné</p>}
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-xs text-green-600 mb-1">Prošlo</div>
                <div className="text-2xl font-bold text-green-700">
                  {output.results?.filter((r: any) => r.status === 'passed').length}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-xs text-red-600 mb-1">Selhalo</div>
                <div className="text-2xl font-bold text-red-700">
                  {output.results?.filter((r: any) => r.status === 'failed').length}
                </div>
              </div>
              <div className="bg-surface-50 rounded-lg p-4 text-center">
                <div className="text-xs text-surface-500 mb-1">Přeskočeno</div>
                <div className="text-2xl font-bold text-surface-600">
                  {output.results?.filter((r: any) => r.status === 'skipped').length}
                </div>
              </div>
            </div>

            {/* Test results */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3">Test report</h3>
              <div className="border border-surface-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-surface-500">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-surface-500">Scénář</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-surface-500">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {output.results?.map((r: any) => (
                      <tr key={r.id} className="hover:bg-surface-50">
                        <td className="px-4 py-2.5 flex items-center gap-2">
                          {statusIcons[r.status as keyof typeof statusIcons]}
                          <span className="text-xs">{statusLabels[r.status as keyof typeof statusLabels]}</span>
                        </td>
                        <td className="px-4 py-2.5 text-surface-700">{r.scenario}</td>
                        <td className="px-4 py-2.5 text-surface-500 text-xs">
                          {r.description ?? '—'}
                          {r.severity && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${severityColors[r.severity as keyof typeof severityColors]}`}>
                              {r.severity}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bugs */}
            {output.bugs?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-surface-700 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Nalezené bugy ({output.bugs.length})
                  </h3>
                  <Button
                    variant="blue"
                    size="sm"
                    icon={<Ticket className="w-3.5 h-3.5" />}
                    onClick={() => setTicketsCreated(true)}
                    disabled={ticketsCreated}
                  >
                    {ticketsCreated ? 'Tickety vytvořeny' : 'Vytvořit tickety'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {output.bugs?.map((bug: any) => (
                    <div key={bug.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[bug.severity as keyof typeof severityColors]}`}>
                          {bug.severity}
                        </span>
                        <span className="text-sm font-medium text-red-700">{bug.description}</span>
                      </div>
                      <div className="text-xs text-red-600">Scénář: {bug.scenario}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null
      }
    />
  );
}
