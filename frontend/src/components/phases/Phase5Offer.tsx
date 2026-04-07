import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';
import { Button } from '../common/Button';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase5Offer({ projectId, phase }: Props) {
  const output = phase.output as any;
  const [hourlyRate, setHourlyRate] = useState<string>('2500');
  const [touched, setTouched] = useState(false);

  const rateNum = Number(hourlyRate);
  const rateError = touched && (!hourlyRate.trim() || isNaN(rateNum) || rateNum <= 0);

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => {
        setTouched(true);
        if (!hourlyRate.trim() || isNaN(rateNum) || rateNum <= 0) return null;
        return { hourlyRate: rateNum };
      }}
      startLabel="Generovat nabídku"
      inputSection={
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-500">
            Automaticky přebírá EP z fáze Engineering Project.
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Hodinová sazba (Kč)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={`w-48 px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${rateError ? 'border-red-300 bg-red-50' : 'border-surface-200'}`}
            />
            {rateError && <p className="text-xs text-red-500 mt-1">Zadejte platnou hodinovou sazbu (číslo)</p>}
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="text-xs text-primary-600 mb-1">Celkem MD</div>
                <div className="text-2xl font-bold text-primary-900">{output.totalMD}</div>
              </div>
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <div className="text-xs text-primary-600 mb-1">Sazba</div>
                <div className="text-2xl font-bold text-primary-900">{output.hourlyRate} Kč/h</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-xs text-green-600 mb-1">Celková cena</div>
                <div className="text-2xl font-bold text-green-900">{output.totalPrice}</div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              Odhady MD generované AI jsou orientační. Přesnost závisí na detailnosti EP. Doporučujeme ruční review před odesláním zákazníkovi.
            </div>

            {/* Epics breakdown */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3">Interní rozpad</h3>
              <div className="space-y-4">
                {output.epics?.map((epic: any, i: number) => (
                  <div key={i} className="border border-surface-200 rounded-lg overflow-hidden">
                    <div className="bg-surface-50 px-4 py-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-surface-900">{epic.name}</span>
                      <span className="text-xs text-surface-500">
                        {epic.stories?.reduce((sum: number, s: any) => sum + s.md, 0)} MD
                      </span>
                    </div>
                    <div className="divide-y divide-surface-100">
                      {epic.stories?.map((story: any, j: number) => (
                        <div key={j} className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm text-surface-700 pl-4">{story.name}</span>
                          <span className="text-sm font-medium text-surface-900">{story.md} MD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-3">Harmonogram</h3>
              <div className="space-y-3">
                {output.milestones?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-right text-sm text-surface-500">Týden {m.week}</div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-surface-900">{m.name}</div>
                      <div className="text-xs text-surface-500">{m.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download */}
            <Button variant="ghost" size="md">Stáhnout nabídku jako PDF</Button>
          </div>
        ) : null
      }
    />
  );
}
