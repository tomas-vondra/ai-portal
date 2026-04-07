import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { DocumentPill } from '../common/DocumentPill';
import { Upload, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase6Contracts({ projectId, phase }: Props) {
  const output = phase.output as any;
  const [fileName, setFileName] = useState<string | null>(null);

  const severityConfig = {
    critical: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Kritické' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Varování' },
    info: { icon: Info, bg: 'bg-surface-50', border: 'border-surface-200', text: 'text-surface-600', label: 'Informační' },
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => ({ fileName })}
      startLabel="Analyzovat smlouvu"
      inputSection={
        <div className="space-y-4">
          <div className="border-2 border-dashed border-surface-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
            <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
            <p className="text-sm text-surface-600">
              Nahrajte smlouvu o dílo{' '}
              <button
                onClick={() => setFileName('smlouva_o_dilo_technova_2026.pdf')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                vyberte soubor
              </button>
            </p>
            <p className="text-xs text-surface-400 mt-1">PDF nebo DOCX</p>
          </div>
          {fileName && (
            <div className="flex items-center gap-2">
              <DocumentPill name={fileName} format="pdf" />
              <button onClick={() => setFileName(null)} className="text-xs text-surface-400 hover:text-surface-600">×</button>
            </div>
          )}
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-surface-700">Rizikové nálezy ({output.risks?.length})</h3>
            {output.risks?.map((risk: any) => {
              const config = severityConfig[risk.severity as keyof typeof severityConfig];
              const Icon = config.icon;
              return (
                <div key={risk.id} className={`${config.bg} border ${config.border} rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.text} shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${config.text}`}>{risk.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className={`text-sm ${config.text} mb-2`}>{risk.description}</p>
                      {risk.citation && (
                        <blockquote className={`text-xs ${config.text} bg-white/50 rounded p-3 border-l-2 ${config.border} italic cursor-pointer hover:bg-white/80`}>
                          „{risk.citation}"
                        </blockquote>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null
      }
    />
  );
}
