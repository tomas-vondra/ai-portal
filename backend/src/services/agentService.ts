import { Queue } from 'bullmq';
import { getRedisConnection } from '../redis.js';

export interface AgentJobData {
  projectId: string;
  phaseId: number;
  phaseStateId: number;
  versionId: string;
}

let agentQueue: Queue<AgentJobData> | null = null;

export function getAgentQueue(): Queue<AgentJobData> {
  if (!agentQueue) {
    agentQueue = new Queue<AgentJobData>('agent-jobs', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return agentQueue;
}

export async function enqueueAgentJob(data: AgentJobData): Promise<string> {
  const queue = getAgentQueue();
  const job = await queue.add(`phase-${data.phaseId}`, data, {
    jobId: data.versionId, // Use versionId as jobId for deduplication
  });
  return job.id!;
}
