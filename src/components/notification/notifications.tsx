import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckCircle, AlertCircle, Info } from "react-feather";
import { cn } from "@/utils/cn";

export const Notification = () => {
  const { notification, clearNotification } = useNotificationStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (notification) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          clearNotification();
        }, 300); // Wait for exit transition before clearing
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
    <div className="fixed top-6 right-6 z-60 overflow-hidden">
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ease-out",
          show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
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
