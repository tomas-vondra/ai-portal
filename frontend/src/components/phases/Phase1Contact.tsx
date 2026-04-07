import { useState } from 'react';
import { PhaseShell } from './PhaseShell';
import type { PhaseState } from '../../types';

interface Props {
  projectId: string;
  phase: PhaseState;
}

export function Phase1Contact({ projectId, phase }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [sources, setSources] = useState({
    google: true,
    linkedin: true,
    ares: true,
    insolvency: false,
  });
  const [touched, setTouched] = useState(false);

  const output = phase.output as any;
  const hasAnySource = Object.values(sources).some(Boolean);
  const nameError = touched && !companyName.trim();
  const sourceError = touched && !hasAnySource;

  const toggleSource = (key: keyof typeof sources) => {
    setSources((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <PhaseShell
      projectId={projectId}
      phase={phase}
      onPrepareInput={() => {
        setTouched(true);
        if (!companyName.trim() || !hasAnySource) return null;
        return { companyName, sources };
      }}
      startLabel="Spustit investigaci"
      inputSection={
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Název firmy nebo jméno osoby
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Např. TechNova s.r.o."
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${nameError ? 'border-red-300 bg-red-50' : 'border-surface-200'}`}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">Název firmy nebo osoby je povinný</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Zdroje</label>
            <div className="flex flex-wrap gap-3">
              {([
                ['google', 'Google'],
                ['linkedin', 'LinkedIn'],
                ['ares', 'ARES'],
                ['insolvency', 'Insolvenční rejstřík'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-surface-700">
                  <input
                    type="checkbox"
                    checked={sources[key]}
                    onChange={() => toggleSource(key)}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  {label}
                </label>
              ))}
            </div>
            {sourceError && <p className="text-xs text-red-500 mt-1">Vyberte alespoň jeden zdroj</p>}
          </div>
        </div>
      }
      outputSection={
        output ? (
          <div className="space-y-6">
            {/* Company info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Firma" value={output.companyName} />
              <InfoCard label="IČO" value={output.ico} />
              <InfoCard label="Doména" value={output.domain} />
              <InfoCard label="Odhadovaný obrat" value={output.estimatedRevenue} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Popis činnosti</h3>
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-3">{output.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Právní & finanční status</h3>
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-3">{output.legalStatus}</p>
            </div>

            {/* Key people */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Klíčové osoby</h3>
              <div className="flex flex-wrap gap-2">
                {output.keyPeople?.map((p: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-primary-400">·</span>
                    <span className="text-primary-500">{p.position}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Signals */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 mb-2">Signály & rizika</h3>
              <div className="space-y-2">
                {output.signals?.map((s: any, i: number) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      s.severity === 'green' ? 'bg-green-50 text-green-700' :
                      s.severity === 'orange' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      s.severity === 'green' ? 'bg-green-500' :
                      s.severity === 'orange' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                    {s.text}
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 rounded-lg p-3">
      <div className="text-xs text-surface-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-surface-900">{value}</div>
    </div>
  );
}
