import { useEffect, useRef, useCallback, useState } from 'react';
import type { LogEntry } from '../../types';

interface UseLogStreamOptions {
  projectId: string;
  phaseId: number;
  runId: string | null;
  onLog?: (entry: LogEntry) => void;
  onDone?: (data: { status: string; output?: Record<string, unknown>; error?: string }) => void;
}

export function useLogStream({ projectId, phaseId, runId, onLog, onDone }: UseLogStreamOptions) {
  const sourceRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!runId) return;

    const url = `/api/v1/projects/${projectId}/phases/${phaseId}/log/stream?runId=${runId}`;
    const source = new EventSource(url, { withCredentials: true });
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Check if it's a done event
        if (data.status === 'completed' || data.status === 'failed') {
          onDone?.(data);
          disconnect();
          return;
        }

        // It's a log entry
        if (data.type && data.message) {
          onLog?.(data as LogEntry);
        }
      } catch {
        // Ignore parse errors (e.g., heartbeats)
      }
    };

    source.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnects
    };

    return disconnect;
  }, [projectId, phaseId, runId, onLog, onDone, disconnect]);

  return { connected, disconnect };
}
