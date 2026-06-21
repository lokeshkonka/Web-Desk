import React from 'react';
import { Notification, useNotificationStore } from '../../store/notification.store';

interface Props {
  notification: Notification;
}

export const NotificationItem: React.FC<Props> = ({ notification }) => {
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`notification-item ${notification.type}`}>
      <div className="notification-icon">{icons[notification.type]}</div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        {notification.message && <div className="notification-message">{notification.message}</div>}
      </div>
      <button className="notification-close" onClick={() => removeNotification(notification.id)}>×</button>
    </div>
  );
};
