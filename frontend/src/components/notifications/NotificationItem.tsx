import React from 'react';
import { useNotificationStore } from '../../store/notification.store';
import type { Notification } from '../../store/notification.store';

interface Props {
  notification: Notification;
}

export const NotificationItem: React.FC<Props> = ({ notification }) => {
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const icons = {
    success: '/icons/status/sucess.png',
    warning: '/icons/status/warning.png',
    error: '/icons/status/error.png',
    info: '/icons/status/info.png',
  };

  return (
    <div className={`notification-item ${notification.type}`}>
      <div className="notification-icon">
        <img src={icons[notification.type]} alt={notification.type} className="w-6 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        {notification.message && <div className="notification-message">{notification.message}</div>}
      </div>
      <button className="notification-close" onClick={() => removeNotification(notification.id)}>×</button>
    </div>
  );
};
