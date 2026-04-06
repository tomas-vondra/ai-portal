import { Worker } from 'bullmq';
import { getRedisConnection } from './redis.js';
import type { AgentJobData } from './services/agentService.js';
import { completeAgent, failAgent, addLogEntry } from './services/phaseService.js';
import { runAgent } from './agents/registry.js';

const connection = getRedisConnection();

const worker = new Worker<AgentJobData>(
  'agent-jobs',
  async (job) => {
    const { projectId, phaseId, phaseStateId, versionId } = job.data;
    const redis = getRedisConnection();
    const logChannel = `log:${projectId}:${phaseId}:${versionId}`;
    const doneChannel = `done:${projectId}:${phaseId}:${versionId}`;

    const publishLog = async (type: 'ok' | 'info' | 'warn' | 'error', message: string) => {
      const entry = { timestamp: new Date().toISOString(), type, message };
      await addLogEntry(phaseStateId, versionId, type, message);
      await redis.publish(logChannel, JSON.stringify(entry));
    };

    try {
      await publishLog('info', 'Agent spuštěn...');

      const output = await runAgent(phaseId, {
        projectId,
        phaseId,
        phaseStateId,
        versionId,
        publishLog,
      });

      await completeAgent(phaseStateId, versionId, output);
      await redis.publish(doneChannel, JSON.stringify({ status: 'completed', output }));
      await publishLog('ok', 'Dokončeno.');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      await publishLog('error', `Chyba: ${errMsg}`);
      await failAgent(phaseStateId, versionId, errMsg);
      await redis.publish(doneChannel, JSON.stringify({ status: 'failed', error: errMsg }));
      throw error;
    }
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for phase ${job.data.phaseId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log('Worker started, waiting for jobs...');
