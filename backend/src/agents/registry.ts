import type { AgentContext, AgentFn } from './base.js';
import { runPhase1 } from './phase1.js';
import { runPhase2 } from './phase2.js';
import { runPhase3 } from './phase3.js';
import { runPhase4 } from './phase4.js';
import { runPhase5 } from './phase5.js';
import { runPhase6 } from './phase6.js';
import { runPhase7 } from './phase7.js';
import { runPhase8 } from './phase8.js';
import { runPhase9 } from './phase9.js';
import { runPhase10 } from './phase10.js';
import { runPhase11 } from './phase11.js';
import { runPhase12 } from './phase12.js';
import { runPhase13 } from './phase13.js';

const agents: Record<number, AgentFn> = {
  1: runPhase1,
  2: runPhase2,
  3: runPhase3,
  4: runPhase4,
  5: runPhase5,
  6: runPhase6,
  7: runPhase7,
  8: runPhase8,
  9: runPhase9,
  10: runPhase10,
  11: runPhase11,
  12: runPhase12,
  13: runPhase13,
};

export async function runAgent(phaseId: number, ctx: AgentContext): Promise<Record<string, unknown>> {
  const agentFn = agents[phaseId];
  if (!agentFn) {
    throw new Error(`No agent registered for phase ${phaseId}`);
  }
  return agentFn(ctx);
}
