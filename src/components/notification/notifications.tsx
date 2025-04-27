// components/Notification.tsx
"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckCircle, AlertCircle, Info } from "react-feather";
import { cn } from "@/utils/cn";

export const Notification = () => {
  const { notification, clearNotification } = useNotificationStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const { message, type } = notification;

  const iconMap = {
    success: <CheckCircle className="text-white" />,
    error: <AlertCircle className="text-white" />,
    info: <Info className="text-white" />,
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg",
          type === "success" && "bg-primary border border-primary",
          type === "error" && "bg-danger border border-danger",
          type === "info" && "bg-secondary border border-secondary"
        )}
      >
        {iconMap[type]}
        <span className="text-sm text-white">{message}</span>
      </div>
    </div>
  );
};
