import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDateTime } from '../../utils/formatters';
import { Bell, CheckCheck, AlertCircle, Clock, XCircle } from 'lucide-react';
import type { NotificationType } from '../../types';
import clsx from 'clsx';

const typeIcons: Record<NotificationType, typeof Bell> = {
  approval_pending: Clock,
  agent_done: CheckCheck,
  rejected: XCircle,
  reminder: AlertCircle,
};

const typeColors: Record<NotificationType, string> = {
  approval_pending: 'text-amber-500',
  agent_done: 'text-green-500',
  rejected: 'text-red-500',
  reminder: 'text-blue-500',
};

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-surface-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
        <h3 className="text-sm font-semibold">Notifikace</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
          >
            Označit vše jako přečtené
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-surface-500 text-sm">
            Žádné notifikace
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type];
            return (
              <div
                key={notif.id}
                className={clsx(
                  'flex gap-3 px-4 py-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 transition-colors',
                  !notif.read && 'bg-primary-50/50',
                )}
                onClick={() => {
                  markAsRead(notif.id);
                  navigate(`/projects/${notif.projectId}/phase/${notif.phaseId}`);
                  onClose();
                }}
              >
                <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', typeColors[notif.type])} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-surface-900">{notif.message}</div>
                  <div className="text-xs text-surface-500 mt-0.5">
                    {notif.projectName} &middot; {formatDateTime(notif.createdAt)}
                  </div>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
