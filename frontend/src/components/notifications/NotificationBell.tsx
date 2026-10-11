import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import api from "../../api/axios";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
  setLoading(true);

  try {
    const [notificationResponse, countResponse] =
      await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);

    if (notificationResponse.data.success) {
      setNotifications(notificationResponse.data.data);
    }

    if (countResponse.data.success) {
      setUnreadCount(countResponse.data.data.count);
    }

    setError("");
  } catch (err) {
    console.error("Notification loading error:", err);
    setError("Notifications could not be loaded.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      console.error("Mark notification read error:", err);
      alert("Failed to mark notification as read.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch("/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      alert("Failed to mark notifications as read.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this notification?")) return;

    try {
      await api.delete(`/notifications/${id}`);
      await loadNotifications();
    } catch (err) {
      console.error("Delete notification error:", err);
      alert("Failed to delete notification.");
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen) {
            void loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center
          rounded-full border border-gray-200 bg-white text-gray-700
          transition hover:border-[#0E4B32] hover:text-[#0E4B32]"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5
              items-center justify-center rounded-full bg-red-500
              px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 z-[100] w-[min(360px,calc(100vw-24px))]
            overflow-hidden rounded-xl border border-gray-200
            bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b
            border-gray-100 p-4"
          >
            <div>
              <h2 className="font-bold text-gray-900">
                Notifications
              </h2>
              <p className="text-xs text-gray-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <div className="border-b border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 text-sm font-semibold
                  text-[#0E4B32] hover:underline"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-gray-500">
                Loading notifications...
              </p>
            ) : error ? (
              <div className="p-5 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void loadNotifications().finally(() =>
                      setLoading(false)
                    );
                  }}
                  className="mt-3 text-sm font-semibold text-[#0E4B32]"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  size={32}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="font-semibold text-gray-700">
                  No notifications yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 p-4 transition
                    hover:bg-gray-50 ${
                      !notification.isRead ? "bg-green-50/70" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0
                            rounded-full bg-[#0E4B32]"
                          />
                        )}

                        <h3 className="break-words text-sm font-bold
                          text-gray-900"
                        >
                          {notification.title}
                        </h3>
                      </div>

                      <p className="mt-1 break-words text-sm
                        leading-5 text-gray-600"
                      >
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleMarkRead(notification.id)
                          }
                          className="mt-2 text-xs font-semibold
                            text-[#0E4B32] hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Delete notification"
                      title="Delete notification"
                      onClick={() =>
                        void handleDelete(notification.id)
                      }
                      className="shrink-0 rounded-lg p-2
                        text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
