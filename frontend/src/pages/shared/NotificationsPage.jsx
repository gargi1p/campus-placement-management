import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../api/common';
import { Card, Button, Badge } from '../../components/ui';
import { DataTable, Pagination } from '../../components/ui/Table';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { formatDateTime, capitalize } from '../../utils/helpers';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationApi.getAll({ page: p, limit: 15 });
      setNotifications(res.data.data || []);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const markRead = async (id) => {
    await notificationApi.markAsRead(id);
    fetchData(page);
  };

  const markAllRead = async () => {
    await notificationApi.markAllAsRead();
    toast.success('All marked as read');
    fetchData(page);
  };

  if (loading && !notifications.length) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={() => fetchData()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on placement activities</p>
        </div>
        <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>
      </div>
      <Card>
        {!notifications.length ? (
          <EmptyState title="No notifications" description="You're all caught up!" />
        ) : (
          <>
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n._id} className={`flex items-start gap-4 px-2 py-4 ${!n.isRead ? 'bg-primary-50/50' : ''}`}>
                  <div className="rounded-lg bg-primary-100 p-2"><Bell size={18} className="text-primary-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{n.title}</h3>
                      <Badge className="bg-gray-100 text-gray-600">{capitalize(n.type)}</Badge>
                      {!n.isRead && <Badge className="bg-primary-100 text-primary-700">New</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <Button size="sm" variant="ghost" onClick={() => markRead(n._id)}>Mark read</Button>}
                </div>
              ))}
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
