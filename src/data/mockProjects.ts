import type { Project, PhaseState, PhaseStatus } from '../types';
import { PHASE_CONFIGS } from '../utils/phaseConfig';
import { mockOutputs, mockLogs, defaultSystemPrompts } from './mockPhaseOutputs';
import { generateId } from '../utils/formatters';

function createPhaseState(
  phaseId: number,
  status: PhaseStatus,
  hasOutput: boolean,
  lastRunAt?: string,
): PhaseState {
  const output = hasOutput ? (mockOutputs[phaseId] ?? null) : null;
  const versions = hasOutput && output
    ? [{
        id: generateId(),
        createdAt: lastRunAt ?? '2026-03-10T09:00:00',
        action: 'generated' as const,
        data: output as Record<string, unknown>,
      }]
    : [];

  return {
    phaseId,
    status,
    log: hasOutput ? (mockLogs[phaseId] ?? []) : [],
    output,
    versions,
    currentVersionId: versions[0]?.id ?? null,
    lastRunAt: lastRunAt ?? (hasOutput ? '2026-03-10T09:00:00' : null),
    input: null,
    systemPrompt: defaultSystemPrompts[phaseId] ?? '',
    systemPromptModified: false,
    rejectionFeedback: null,
  };
}

// Project 1: Far along — phases 1-7 done, 8-9 in progress
const project1Phases: Record<number, PhaseState> = {};
for (const cfg of PHASE_CONFIGS) {
  if (cfg.id <= 5) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, cfg.type === 'single' ? 'approved' : 'ready', true, '2026-03-10T09:00:00');
  } else if (cfg.id === 6) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'approved', true, '2026-03-14T11:00:00');
  } else if (cfg.id === 7) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'approved', true, '2026-03-15T14:00:00');
  } else if (cfg.id === 8) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'ready', true, '2026-03-20T16:30:00');
  } else if (cfg.id === 9) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'review', true, '2026-03-22T10:00:00');
  } else if (cfg.id === 10) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'ready', true, '2026-03-21T08:00:00');
  } else if (cfg.id === 11) {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'waiting', false);
  } else {
    project1Phases[cfg.id] = createPhaseState(cfg.id, 'locked', false);
  }
}

// Project 2: Early stage — phase 1 done, phase 2 in review
const project2Phases: Record<number, PhaseState> = {};
for (const cfg of PHASE_CONFIGS) {
  if (cfg.id === 1) {
    project2Phases[cfg.id] = createPhaseState(cfg.id, 'approved', true, '2026-03-25T10:00:00');
  } else if (cfg.id === 2) {
    project2Phases[cfg.id] = createPhaseState(cfg.id, 'review', true, '2026-03-26T14:00:00');
  } else if (cfg.id === 3) {
    project2Phases[cfg.id] = createPhaseState(cfg.id, 'waiting', false);
  } else {
    project2Phases[cfg.id] = createPhaseState(cfg.id, 'locked', false);
  }
}

// Project 3: Just started — phase 1 running
const project3Phases: Record<number, PhaseState> = {};
for (const cfg of PHASE_CONFIGS) {
  if (cfg.id === 1) {
    project3Phases[cfg.id] = createPhaseState(cfg.id, 'running', false);
    project3Phases[cfg.id].log = mockLogs[1]?.slice(0, 5) ?? [];
  } else {
    project3Phases[cfg.id] = createPhaseState(cfg.id, 'locked', false);
  }
}

// Project 4: Error state — phase 1 failed
const project4Phases: Record<number, PhaseState> = {};
for (const cfg of PHASE_CONFIGS) {
  if (cfg.id === 1) {
    project4Phases[cfg.id] = createPhaseState(cfg.id, 'error', false);
    project4Phases[cfg.id].log = [
      { timestamp: '2026-03-28T09:00:01', type: 'info', message: 'Spouštím investigaci pro: GhostCorp Ltd.' },
      { timestamp: '2026-03-28T09:00:03', type: 'ok', message: 'Prohledávám Google...' },
      { timestamp: '2026-03-28T09:00:06', type: 'error', message: 'Chyba: API Google nedostupné (HTTP 503). Zkuste to prosím znovu.' },
    ];
  } else {
    project4Phases[cfg.id] = createPhaseState(cfg.id, 'locked', false);
  }
}

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Objednávkový systém TechNova',
    client: 'TechNova s.r.o.',
    createdAt: '2026-03-10T08:00:00',
    updatedAt: '2026-03-22T10:00:00',
    archived: false,
    phases: project1Phases,
  },
  {
    id: 'proj-2',
    name: 'E-shop redesign FashionHub',
    client: 'FashionHub a.s.',
    createdAt: '2026-03-25T09:00:00',
    updatedAt: '2026-03-26T14:00:00',
    archived: false,
    phases: project2Phases,
  },
  {
    id: 'proj-3',
    name: 'CRM pro LogiTrans',
    client: 'LogiTrans spol. s r.o.',
    createdAt: '2026-03-28T08:30:00',
    updatedAt: '2026-03-28T08:30:00',
    archived: false,
    phases: project3Phases,
  },
  {
    id: 'proj-4',
    name: 'Portál pro GhostCorp',
    client: 'GhostCorp Ltd.',
    createdAt: '2026-03-28T09:00:00',
    updatedAt: '2026-03-28T09:00:00',
    archived: false,
    phases: project4Phases,
  },
];
