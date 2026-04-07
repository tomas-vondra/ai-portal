import { create } from 'zustand';
import type { Notification } from '../types';
import { notificationApi } from '../services/api';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationApi.list() as Notification[];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: (id) => {
    // Optimistic update
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
    // Fire and forget
    notificationApi.markRead(id).catch(() => {});
  },

  markAllAsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    notificationApi.markAllRead().catch(() => {});
  },

  addNotification: (notification) => {
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.read ? 0 : 1),
    }));
  },
}));
