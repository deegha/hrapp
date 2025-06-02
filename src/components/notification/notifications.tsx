import {useEffect, useState} from "react";
import {useNotificationStore} from "@/store/notificationStore";
import {CheckCircle, AlertCircle, Info} from "react-feather";
import {cn} from "@/utils/cn";

export const Notification = () => {
  const {notification, clearNotification} = useNotificationStore();
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

  const {message, type} = notification;

  const iconMap = {
    success: <CheckCircle className="text-white" />,
    error: <AlertCircle className="text-white" />,
    info: <Info className="text-white" />,
  };

  return (
    <div className="z-60 relative overflow-hidden">
      <div
        className={cn(
          "fixed right-6 top-6 z-[100] flex transform items-center gap-3 rounded-xl px-6 py-4 shadow-lg transition-all duration-300 ease-out",
          show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          type === "success" && "border border-primary bg-primary",
          type === "error" && "border border-danger bg-danger",
          type === "info" && "border border-secondary bg-secondary",
        )}
      >
        {iconMap[type]}
        <span className="text-sm text-white">{message}</span>
      </div>
    </div>
  );
};
