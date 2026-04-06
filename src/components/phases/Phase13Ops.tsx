import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { Activity, AlertTriangle, ArrowUpCircle } from 'lucide-react';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase13Ops({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const [monitoringUrl, setMonitoringUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const urlError = touched && !monitoringUrl.trim();

  const handleStart = () => {
    setTouched(true);
    if (!monitoringUrl.trim()) return;
    store.setPhaseInput(projectId, 13, { monitoringUrl });
    store.startAgent(projectId, 13);
    setTouched(false);
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-surface-50 text-surface-600 border-surface-200',
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onStart={handleStart}
      startLabel="Připojit monitoring"
      inputSection={
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              URL monitoring systému
            </label>
            <input
              type="text"
              value={monitoringUrl}
              onChange={(e) => setMonitoringUrl(e.target.value)}
              placeholder="https://grafana.example.com/dashboard/..."
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${urlError ? 'border-red-300 bg-red-50' : 'border-surface-200'}`}
            />
            {urlError ? (
              <p className="text-xs text-red-500 mt-1">URL monitoring systému je povinné</p>
            ) : (
              <p className="text-xs text-surface-400 mt-1">Grafana, Kibana nebo jiný monitoring systém</p>
            )}
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Health dashboard */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Health dashboard
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Dostupnost" value={output.health?.uptime} good />
                <MetricCard label="Latence" value={output.health?.avgLatency} />
                <MetricCard label="Chybovost" value={output.health?.errorRate} />
                <MetricCard label="Poslední incident" value={output.health?.lastIncident} small />
              </div>
            </div>

            {/* Anomalies */}
            {output.anomalies?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Anomálie ({output.anomalies.length})
                </h3>
                <div className="space-y-2">
                  {output.anomalies?.map((a: any, i: number) => (
                    <div key={i} className={`border rounded-lg p-3 ${
                      a.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${a.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                          {a.severity === 'critical' ? 'KRITICKÉ' : 'VAROVÁNÍ'}
                        </span>
                        <span className="text-xs text-surface-500">
                          {new Date(a.timestamp).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      <p className={`text-sm ${a.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                        {a.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backlog */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                Rozvoj backlog
              </h3>
              <div className="space-y-2">
                {output.backlog?.map((item: any, i: number) => (
                  <div key={i} className={`border rounded-lg p-3 ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase">{item.priority}</span>
                      <span className="text-sm">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}

function MetricCard({ label, value, good, small }: { label: string; value: string; good?: boolean; small?: boolean }) {
  return (
    <div className="bg-surface-50 rounded-lg p-4">
      <div className="text-xs text-surface-500 mb-1">{label}</div>
      <div className={`font-bold ${good ? 'text-green-600' : 'text-surface-900'} ${small ? 'text-xs' : 'text-lg'}`}>
        {value}
      </div>
    </div>
  );
}
