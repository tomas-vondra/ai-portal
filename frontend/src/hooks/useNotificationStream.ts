import { useEffect, useRef } from 'react';
import type { Notification } from '../../types';

interface UseNotificationStreamOptions {
  onNotification?: (notification: Notification) => void;
  enabled?: boolean;
}

export function useNotificationStream({ onNotification, enabled = true }: UseNotificationStreamOptions) {
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource('/api/v1/notifications/stream', { withCredentials: true });
    sourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id && data.type) {
          onNotification?.(data as Notification);
        }
      } catch {
        // Ignore
      }
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [enabled, onNotification]);
}
