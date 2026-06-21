import React from 'react';
import { useNotificationStore } from '../../store/notification.store';
import { NotificationItem } from './NotificationItem';
import './notifications.css';

export const NotificationManager: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="notification-manager">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
