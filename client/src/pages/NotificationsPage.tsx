import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  UserPlus,
  Repeat,
  BookOpen,
  CheckSquare,
  Video,
  MessageSquare,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationType } from '../types';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

const notificationIcons: Record<NotificationType, any> = {
  CONNECTION_REQUEST: UserPlus,
  CONNECTION_ACCEPTED: Check,
  NEW_MESSAGE: MessageSquare,
  GROUP_INVITE: BookOpen,
  GROUP_ACTIVITY: BookOpen,
  TASK_ASSIGNED: CheckSquare,
  TASK_DUE: CheckSquare,
  ROOM_INVITE: Video,
  EXCHANGE_PROPOSAL: Repeat,
  EXCHANGE_ACCEPTED: Repeat,
  EXCHANGE_COMPLETED: Repeat,
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClickNotification = async (notif: Notification) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated on new connection requests, group activity, tasks, and exchanges.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner fullHeight message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All Caught Up!"
          description="You don't have any notifications at the moment."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => {
            const Icon = notificationIcons[notif.type] || Bell;

            return (
              <div
                key={notif.id}
                onClick={() => handleClickNotification(notif)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/40 hover:bg-teal-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.isRead
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-teal-600 text-white shadow-xs'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5
                      className={`text-sm leading-snug ${
                        notif.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded-lg hover:bg-teal-100/50 transition-colors flex-shrink-0"
                    title="Mark read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
