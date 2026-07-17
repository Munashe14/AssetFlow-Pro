import { useNotifications } from "../hooks/useNotifications";
import { Modal, Field, inputClass } from "../components/shared";

const TYPE_CONFIG = {
  warning:  { dot: "bg-amber-400",  bar: "bg-amber-500",  label: "Warning",  badge: "text-amber-400  bg-amber-500/15  border-amber-500/30"  },
  critical: { dot: "bg-red-400",    bar: "bg-red-500",    label: "Critical", badge: "text-red-400    bg-red-500/15    border-red-500/30"    },
  success:  { dot: "bg-teal-400",   bar: "bg-teal-500",   label: "Success",  badge: "text-teal-400   bg-teal-500/15   border-teal-500/30"   },
  info:     { dot: "bg-blue-400",   bar: "bg-blue-500",   label: "Info",     badge: "text-blue-400   bg-blue-500/15   border-blue-500/30"   },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "warning" | "critical"

  const filtered = notifications.filter(n => {
    if (filter === "unread")   return !n.is_read;
    if (filter === "all")      return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "unread", "critical", "warning", "info", "success"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
          const time = n.created_at
            ? new Date(n.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
            : "";

          return (
            <div
              key={n.id}
              className={`rounded-xl border px-4 py-4 flex gap-4 transition-colors ${
                n.is_read
                  ? "border-slate-800 bg-transparent"
                  : "border-slate-700/60 bg-slate-800/30"
              }`}
            >
              {/* Left colour bar */}
              <div className={`w-0.5 rounded-full self-stretch shrink-0 ${cfg.bar}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {!n.is_read && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  )}
                  <p className={`text-sm font-semibold ${n.is_read ? "text-slate-400" : "text-white"}`}>
                    {n.title}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wide ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{time}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-xs text-slate-600 hover:text-teal-400 transition-colors self-start mt-0.5 shrink-0"
                >
                  ✓ Read
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-2 opacity-20">🔔</p>
            <p className="text-slate-500 text-sm">No notifications here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// useState is used in this file — add the import:
import { useState } from "react";