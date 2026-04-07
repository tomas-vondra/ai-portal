import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { Download, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase12Handover({ projectId, phase }: Props) {
  const output = phase.output as any;

  const statusIcons = {
    delivered: <CheckCircle className="w-4 h-4 text-green-500" />,
    excluded: <MinusCircle className="w-4 h-4 text-surface-400" />,
    partial: <XCircle className="w-4 h-4 text-amber-500" />,
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => ({})}
      startLabel="Připravit předávací dokumenty"
      inputSection={
        <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
          Automaticky přebírá stav z ostatních fází (test report, EP, nabídka, dokumentace).
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Acceptance protocol */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-surface-700">Akceptační protokol</h3>
                <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                  Stáhnout PDF
                </Button>
              </div>
              <div className="border border-surface-200 rounded-lg overflow-hidden">
                <div className="bg-surface-50 px-4 py-3">
                  <div className="text-sm font-medium text-surface-900">{output.protocol?.projectName}</div>
                  <div className="text-xs text-surface-500">Datum předání: {output.protocol?.deliveredDate}</div>
                </div>
                <div className="divide-y divide-surface-100">
                  {output.protocol?.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {statusIcons[item.status as keyof typeof statusIcons]}
                        <span className="text-sm text-surface-700">{item.name}</span>
                      </div>
                      {item.reason && (
                        <span className="text-xs text-surface-500">{item.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery summary */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Delivery summary</h3>
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-4">{output.summary}</p>
            </div>

            {/* Export */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={() => {
                  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'F12-Predani_Akceptace.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exportovat vše (JSON)
              </Button>
              <Button variant="ghost" size="md" icon={<Download className="w-3.5 h-3.5" />}>
                Stáhnout jako PDF
              </Button>
            </div>

            {/* Presentation */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Prezentace pro demo</h3>
              <div className="space-y-3">
                {output.presentation?.map((slide: any, i: number) => (
                  <div key={i} className="bg-surface-50 rounded-lg p-4">
                    <div className="font-medium text-sm text-surface-900 mb-1">Slide {i + 1}: {slide.slide}</div>
                    <ul className="space-y-1">
                      {slide.bullets?.map((b: string, j: number) => (
                        <li key={j} className="text-sm text-surface-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-surface-400">
                          {b}
                        </li>
                      ))}
                    </ul>
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
