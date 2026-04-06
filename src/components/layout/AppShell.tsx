import { Outlet, Link, useLocation } from 'react-router-dom';
import { Brain, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationPanel } from '../panels/NotificationPanel';
import { useState } from 'react';

export function AppShell() {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-surface-200 px-6 h-14 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-semibold text-lg no-underline">
            <Brain className="w-6 h-6" />
            <span>AI Portál</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`text-sm font-medium no-underline px-3 py-1.5 rounded-md transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Projekty
            </Link>
          </nav>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-all duration-150 active:scale-95"
          >
            <Bell className="w-5 h-5 text-surface-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
