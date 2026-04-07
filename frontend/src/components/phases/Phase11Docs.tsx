import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase11Docs({ projectId, phase }: Props) {
  const output = phase.output as any;

  const docIcons = {
    user: '📘',
    admin: '📙',
    ops: '📗',
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => ({})}
      startLabel="Generovat dokumentaci"
      inputSection={
        <div className="space-y-3">
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            GitHub repozitář z fáze 7 a EP z fáze 4 budou automaticky použity.
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-xs text-amber-700">
              Kvalita generované dokumentace závisí na míře komentování zdrojového kódu.
            </span>
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-4">
            {output.documents?.map((doc: any, i: number) => (
              <div key={i} className="border border-surface-200 rounded-lg p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{docIcons[doc.type as keyof typeof docIcons]}</span>
                  <div>
                    <div className="text-sm font-medium text-surface-900">{doc.name}</div>
                    <div className="text-xs text-surface-500">{doc.pages} stran &middot; {doc.format}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="icon" size="icon-md" title="Upravit">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button variant="icon" size="icon-md" title="Stáhnout">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {output.warning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                {output.warning}
              </div>
            )}
          </div>
        ) : null
      }
    />
  );
}
