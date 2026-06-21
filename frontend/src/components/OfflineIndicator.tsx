import React, { useEffect, useState } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500/90 text-white text-center py-2 z-[99999] flex items-center justify-center gap-2 font-medium shadow-md animate-[slideDown_0.3s_ease]">
      <span>⚠️</span>
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  );
};
