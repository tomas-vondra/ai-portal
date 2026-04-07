import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { ExternalLink, GitPullRequest } from 'lucide-react';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase8Dev({ projectId, phase }: Props) {
  const output = phase.output as any;
  const [ticketUrl, setTicketUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const urlError = touched && !ticketUrl.trim();
  const isRunning = phase.status === 'running';

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => {
        setTouched(true);
        if (!ticketUrl.trim()) return null;
        return { ticketUrl };
      }}
      startLabel="Spustit implementaci"
      inputSection={
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            EP z fáze 4 je automaticky k dispozici.
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Jira ticket URL nebo ID
            </label>
            <input
              type="text"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              placeholder="Např. PROJ-123 nebo https://jira.example.com/browse/PROJ-123"
              disabled={isRunning}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${urlError ? 'border-red-300 bg-red-50' : 'border-surface-200'} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {urlError && <p className="text-xs text-red-500 mt-1">Jira ticket URL nebo ID je povinné</p>}
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Souhrn implementovaných změn</h3>
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-4">{output.summary}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Změny</h3>
              <ul className="space-y-1">
                {output.changes?.map((change: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-600">
                    <span className="text-green-500 shrink-0">+</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 pt-2">
              <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-white rounded-lg text-sm font-medium hover:bg-surface-800 hover:shadow-md hover:shadow-surface-900/20 active:scale-[0.97] transition-all duration-150">
                <GitPullRequest className="w-4 h-4" />
                Pull Request
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.97] transition-all duration-150">
                <span className="font-bold text-xs">J</span>
                {output.jiraTicket}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-xs text-surface-500 bg-surface-50 rounded-lg p-3">
              Po dokončení se fáze vrátí do stavu Připraveno a čeká na další ticket. Review a merge probíhá v Pull Requestu.
            </div>
          </div>
        ) : null
      }
    />
  );
}
