import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, LoadingSkeleton, EmptyState } from '../components/common';
import { Bell, Check, X, Clock } from 'lucide-react';
import { notificationsService } from '../services';

export function Notifications() {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await notificationsService.getNotifications({ limit: 50 });
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount || 0);
      } catch (err) {
        setError(err.message || 'Failed to fetch notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, []);
  
  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await notificationsService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      <Card>
        <CardContent className="pt-6">
          {notifications.length === 0 ? (
            <EmptyState
              icon="Bell"
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-colors cursor-pointer ${
                    notification.read
                      ? 'bg-[var(--color-gray-50)]'
                      : 'bg-[var(--color-primary)]/5 border-l-4 border-[var(--color-primary)]'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-text-primary)] mb-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Check}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={X}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
