import { useNavigate } from "react-router-dom";
import { HiBell } from "react-icons/hi2";
import { useNotifications } from "../hooks/useNotifications";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      aria-label="Notifications"
    >
      <HiBell className="w-7 h-7" />

      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;