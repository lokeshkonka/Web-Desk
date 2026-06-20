import { useEffect, useState } from 'react';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { useDesktopStore } from './store/useDesktopStore';

function App() {
  const { initWorkspace } = useDesktopStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initWorkspace().finally(() => setLoading(false));
  }, [initWorkspace]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1E1B2E] text-[#F8FAFC]">
        <img src="/loading/loading.gif" alt="loading..." className="w-16 h-16 mb-4 pixelated opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <h1 className="font-heading text-2xl animate-pulse">Loading WebDesk...</h1>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-[#1E1B2E] text-white">
      <div className="flex-1 relative w-full overflow-hidden">
        <Desktop />
      </div>
      <div className="h-[64px] shrink-0 w-full z-[9999] relative">
        <Taskbar />
      </div>
    </div>
  );
}

export default App;
