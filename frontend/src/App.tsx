import { useEffect, useState, useMemo } from 'react';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { useDesktopStore } from './store/useDesktopStore';
import { useCollabStore } from './store/collaboration.store';
import { PresenceBar } from './components/presence/PresenceBar';
import { LiveCursors } from './components/presence/LiveCursors';
import { NotificationManager } from './components/notifications/NotificationManager';
import { GlobalSearch } from './components/search/GlobalSearch';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];

function App() {
  const { initWorkspace, workspaceId } = useDesktopStore();
  const { connect, isConnected } = useCollabStore();
  const [loading, setLoading] = useState(true);

  // Generate a random user session for demonstration
  const randomUser = useMemo(() => ({
    id: crypto.randomUUID(),
    username: NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 100),
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }), []);

  useEffect(() => {
    initWorkspace().finally(() => setLoading(false));
  }, [initWorkspace]);

  useEffect(() => {
    if (workspaceId && !loading && !isConnected) {
      connect(workspaceId, randomUser);
    }
    return () => {
      // Disconnect handled optionally or on unmount
    };
  }, [workspaceId, loading, isConnected, connect, randomUser]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1E1B2E] text-[#F8FAFC]">
        <img src="/loading/loading.gif" alt="loading..." className="w-16 h-16 mb-4 pixelated opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <h1 className="font-heading text-2xl animate-pulse">Loading WebDesk...</h1>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-[#1E1B2E] text-white">
        <OfflineIndicator />
        <NotificationManager />
        <GlobalSearch />
        <KeyboardShortcuts />
        <LiveCursors />
        <div className="flex-1 relative w-full overflow-hidden">
          <PresenceBar />
          <Desktop />
        </div>
        <div className="h-[64px] shrink-0 w-full z-[9999] relative">
          <Taskbar />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
