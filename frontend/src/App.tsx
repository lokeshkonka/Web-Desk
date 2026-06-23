import { useEffect, useState, useMemo } from 'react';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { useDesktopStore } from './store/useDesktopStore';
import { useCollabStore } from './store/collaboration.store';
import { useSystemStore } from './store/system.store';
import { PresenceBar } from './components/presence/PresenceBar';
import { LiveCursors } from './components/presence/LiveCursors';
import { NotificationManager } from './components/notifications/NotificationManager';
import { GlobalSearch } from './components/search/GlobalSearch';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SystemDialog } from './components/ui/SystemDialog';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];

function App() {
  const { initWorkspace, workspaceId } = useDesktopStore();
  const { connect, isConnected } = useCollabStore();
  const { powerState, setPowerState } = useSystemStore();
  const [loading, setLoading] = useState(true);

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
  }, [workspaceId, loading, isConnected, connect, randomUser]);

  useEffect(() => {
    if (powerState === 'booting') {
      const timer = setTimeout(() => {
        setPowerState('on');
      }, 3000); // 3 seconds boot screen
      return () => clearTimeout(timer);
    }
  }, [powerState, setPowerState]);

  if (powerState === 'off') {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-black opacity-50"></div>
        <button 
          onClick={() => setPowerState('booting')}
          className="relative z-10 w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white transition-all group shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
        >
          <svg className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </button>
        <div className="mt-8 text-white/40 tracking-widest uppercase text-sm font-bold relative z-10">Power On</div>
      </div>
    );
  }

  if (loading || powerState === 'booting') {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-16 h-16 mb-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <h1 className="font-heading text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">WebDesk OS</h1>
        <div className="mt-4 text-white/40 text-sm animate-pulse">Starting core services...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SystemDialog />
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
