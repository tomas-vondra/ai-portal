import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase9Delivery({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const [frequency, setFrequency] = useState('manual');

  const handleStart = () => {
    store.setPhaseInput(projectId, 9, { frequency });
    store.startAgent(projectId, 9);
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onStart={handleStart}
      startLabel="Zkontrolovat nyní"
      inputSection={
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            Automaticky přebírá Jira URL z fáze 7 a projektový plán z fáze 5.
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Frekvence</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-64 px-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="manual">Manuálně</option>
              <option value="weekly">1× týdně</option>
              <option value="biweekly">1× za 2 týdny</option>
            </select>
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Dashboard */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-50 rounded-lg p-4 text-center">
                <div className="text-xs text-surface-500 mb-1">Dokončeno</div>
                <div className={`text-2xl font-bold ${output.completionPercent < output.plannedPercent ? 'text-amber-600' : 'text-green-600'}`}>
                  {output.completionPercent}%
                </div>
              </div>
              <div className="bg-surface-50 rounded-lg p-4 text-center">
                <div className="text-xs text-surface-500 mb-1">Plán</div>
                <div className="text-2xl font-bold text-surface-900">{output.plannedPercent}%</div>
              </div>
              <div className="bg-surface-50 rounded-lg p-4 text-center">
                <div className="text-xs text-surface-500 mb-1">Sprint</div>
                <div className="text-2xl font-bold text-primary-600">{output.currentSprint}</div>
              </div>
            </div>

            {/* Progress comparison */}
            <div>
              <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                <span>Skutečný stav</span>
                <span>{output.completionPercent}%</span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-3">
                <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${output.completionPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-surface-500 mb-1 mt-2">
                <span>Plán</span>
                <span>{output.plannedPercent}%</span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-3">
                <div className="bg-surface-400 h-3 rounded-full" style={{ width: `${output.plannedPercent}%` }} />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3">Timeline</h3>
              <div className="space-y-3">
                {output.timeline?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      item.status === 'done' ? 'bg-green-500' :
                      item.status === 'delayed' ? 'bg-amber-500' :
                      'bg-surface-300'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-surface-900">{item.milestone}</div>
                      <div className="text-xs text-surface-500">
                        Plán: {item.planned} | Skutečnost: {item.actual}
                      </div>
                    </div>
                    {item.status === 'delayed' && <TrendingDown className="w-4 h-4 text-amber-500" />}
                    {item.status === 'done' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Deviations */}
            {output.deviations?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-3">Odchylky</h3>
                <div className="space-y-3">
                  {output.deviations?.map((d: any, i: number) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-amber-700 uppercase">{d.type === 'delay' ? 'Skluz' : 'Scope'}</span>
                          <p className="text-sm text-amber-700 mt-1">{d.description}</p>
                          <p className="text-xs text-amber-600 mt-1">Doporučení: {d.action}</p>
                        </div>
                      </div>
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
