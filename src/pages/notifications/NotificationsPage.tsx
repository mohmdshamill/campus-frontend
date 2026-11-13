import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../../api/notifications';
import { useToast } from '../../context/ToastContext';
import { Notification } from '../../types';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({ unreadOnly });
      if (res.data) setNotifications(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read');
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System updates regarding your reservations, approvals, equipment due dates, and maintenance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnreadOnly((v) => !v)}
          >
            {unreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are all caught up with your campus notifications."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-brand-50/20' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    !n.isRead ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-slate-300'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {n.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link to={n.link}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                    title="Mark read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
