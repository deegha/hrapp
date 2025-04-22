// stores/notificationStore.ts
import { create } from "zustand";

type NotificationType = "success" | "error" | "info";

type Notification = {
  message: string;
  type: NotificationType;
};

type NotificationStore = {
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  clearNotification: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,
  showNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));
