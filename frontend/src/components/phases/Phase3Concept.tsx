import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { useProjectStore } from '../../store/projectStore';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase3Concept({ projectId, phase }: Props) {
  const store = useProjectStore();
  const output = phase.output as any;
  const prevPhase = store.getProject(projectId)?.phases[2];

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => ({})}
      startLabel="Spustit návrh konceptu"
      inputSection={
        prevPhase?.output ? (
          <div className="bg-surface-50 rounded-lg p-4">
            <div className="text-xs text-surface-500 mb-2">Automaticky přebráno z fáze Discovery:</div>
            <div className="text-sm text-surface-700">
              {(prevPhase.output as any).problemDefinition?.substring(0, 200)}...
            </div>
          </div>
        ) : (
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            Výstup z fáze Discovery bude automaticky použit jako vstup.
          </div>
        )
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Approach recommendation */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="text-xs text-primary-600 font-medium mb-1">Doporučení přístupu</div>
              <div className="text-lg font-semibold text-primary-900 mb-2">{output.approach?.recommended}</div>
              <p className="text-sm text-primary-700">{output.approach?.reasoning}</p>
            </div>

            {/* Sitemap */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Sitemap</h3>
              <div className="bg-surface-50 rounded-lg p-4 space-y-1">
                {output.sitemap?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center text-sm text-surface-700" style={{ paddingLeft: `${item.level * 24}px` }}>
                    <span className="text-surface-400 mr-2">{item.level === 0 ? '📁' : '📄'}</span>
                    <span className={item.level === 0 ? 'font-medium' : ''}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Screens */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Seznam obrazovek</h3>
              <div className="grid grid-cols-2 gap-2">
                {output.screens?.map((screen: string, i: number) => (
                  <div key={i} className="bg-surface-50 rounded-lg p-3 text-sm text-surface-700">
                    {screen}
                  </div>
                ))}
              </div>
            </div>

            {/* Open questions */}
            {output.openQuestions?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 mb-2">Otevřené otázky</h3>
                <ul className="space-y-2">
                  {output.openQuestions?.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-600 bg-amber-50 rounded-lg p-3">
                      <span className="text-amber-500 shrink-0">?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Presentation outline */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Prezentace — outline</h3>
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
