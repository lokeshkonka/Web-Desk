import React, { useEffect } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useNotificationStore } from '../../store/notification.store';

export const KeyboardShortcuts: React.FC = () => {
  const { windows, activeWindowId, setActiveWindow, openWindow } = useDesktopStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + S: Save action placeholder (often intercepted by specific apps like Editor)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        addNotification({
          type: 'info',
          title: 'Saved',
          message: 'Saved successfully.'
        });
      }

      // Ctrl + Shift + T: Open Terminal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        openWindow('terminal', 'Terminal', '/icons/desktop-apps/terminal.png');
      }

      // Alt + Tab: Switch windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        if (windows.length > 1) {
          const currentIndex = windows.findIndex(w => w.id === activeWindowId);
          const nextIndex = (currentIndex + 1) % windows.length;
          setActiveWindow(windows[nextIndex].id);
        } else if (windows.length === 1) {
          setActiveWindow(windows[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windows, activeWindowId, setActiveWindow, openWindow, addNotification]);

  return null;
};
