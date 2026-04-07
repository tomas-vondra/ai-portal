import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { DocumentPill } from '../common/DocumentPill';
import { Upload } from 'lucide-react';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase2Discovery({ projectId, phase }: Props) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const output = phase.output as any;
  const hasInput = !!fileName || !!text.trim();
  const inputError = touched && !hasInput;

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-surface-50 text-surface-600 border-surface-200',
  };

  const priorityLabels = { high: 'Vysoká', medium: 'Střední', low: 'Nízká' };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => {
        setTouched(true);
        if (!hasInput) return null;
        return { text, fileName };
      }}
      startLabel="Spustit analýzu"
      inputSection={
        <div className="space-y-4">
          <div className="border-2 border-dashed border-surface-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
            <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
            <p className="text-sm text-surface-600">
              Přetáhněte soubor nebo{' '}
              <button
                onClick={() => setFileName('meeting_notes_2026-03-11.txt')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                vyberte ze složky
              </button>
            </p>
            <p className="text-xs text-surface-400 mt-1">TXT, DOCX, MD</p>
          </div>
          {fileName && (
            <div className="flex items-center gap-2">
              <DocumentPill name={fileName} format="txt" />
              <button onClick={() => setFileName(null)} className="text-xs text-surface-400 hover:text-surface-600">×</button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Nebo vložte text přímo
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vložte transkript meetingu, poznámky nebo e-mailovou komunikaci..."
              className={`w-full p-4 rounded-lg border text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary-500 ${inputError && !fileName ? 'border-red-300 bg-red-50' : 'border-surface-200'}`}
            />
          </div>
          {inputError && <p className="text-xs text-red-500">Nahrajte soubor nebo vložte text</p>}
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Definice problému</h3>
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-4">{output.problemDefinition}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Požadované funkcionality</h3>
              <div className="space-y-2">
                {output.functionalities?.map((f: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-lg p-3">
                    <div className="w-1 shrink-0 self-stretch bg-blue-400 rounded" />
                    <div className="flex-1">
                      <span className="text-sm text-surface-700">{f.text}</span>
                      {f.citation && (
                        <span className="ml-2 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded cursor-pointer hover:bg-primary-100">
                          📎 {f.citation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Uživatelské role</h3>
              <div className="flex flex-wrap gap-2">
                {output.userRoles?.map((r: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {r.text}
                    {r.citation && <span className="text-xs text-purple-400">({r.citation})</span>}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Otevřené otázky</h3>
              <div className="space-y-2">
                {output.openQuestions?.map((q: any, i: number) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${priorityColors[q.priority as keyof typeof priorityColors]}`}>
                    <span className="text-xs font-medium shrink-0 mt-0.5">
                      {priorityLabels[q.priority as keyof typeof priorityLabels]}
                    </span>
                    <span className="text-sm">{q.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {output.risks?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-2">Rizika a red flags</h3>
                <ul className="space-y-2">
                  {output.risks?.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-3">
                      <span className="text-red-400 shrink-0">⚠</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null
      }
    />
  );
}
