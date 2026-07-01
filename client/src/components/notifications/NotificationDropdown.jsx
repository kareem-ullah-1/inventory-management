"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDate } from "../../utils/formatDate";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-slate-500 px-4 py-6 text-center">
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-500 px-4 py-6 text-center">
                You're all caught up
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`px-4 py-3 text-sm cursor-pointer transition ${
                      n.isRead ? "bg-white" : "bg-slate-50"
                    } hover:bg-slate-100`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 mt-1 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
