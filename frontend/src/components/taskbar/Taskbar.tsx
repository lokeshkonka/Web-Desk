import { useState, useEffect } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { Menu } from '../menu/Menu';

export const Taskbar = () => {
  const { windows, setActiveWindow, activeWindowId } = useDesktopStore();
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="w-full h-full bg-[var(--color-surface)] border-t-[3px] border-[#1E1B2E] flex items-center px-2 z-[9999] justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.2)] relative">
        
        {/* Start / Menu Button & Running Apps */}
        <div className="flex items-center gap-2 h-full py-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`h-full aspect-square flex flex-shrink-0 items-center justify-center border-[2px] border-[#1E1B2E] rounded-md hover:bg-[var(--color-accent)]/20 transition-colors cursor-pointer
              ${isMenuOpen ? 'bg-[var(--color-accent)]/30 shadow-inner' : 'bg-[var(--color-surface-secondary)]'}
            `}
          >
            <img src="/icons/taskbar/menu.png" alt="Menu" className="w-[26px] h-[26px]" style={{ imageRendering: 'pixelated' }} />
          </button>

          <div className="w-[2px] h-8 bg-[#1E1B2E] mx-1 opacity-50 rounded flex-shrink-0" />

          {/* Running Apps Area */}
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => {
                if (activeWindowId === win.id && !win.isMinimized) {
                  useDesktopStore.getState().minimizeWindow(win.id);
                } else {
                  setActiveWindow(win.id);
                }
              }}
              className={`h-full flex-shrink-0 px-4 flex items-center gap-2 border-[2px] border-[#1E1B2E] rounded-md transition-colors cursor-pointer
                ${activeWindowId === win.id && !win.isMinimized ? 'bg-[var(--color-surface-secondary)] shadow-inner' : 'bg-transparent hover:bg-white/5'}
              `}
            >
              <img src={win.icon} alt={win.title} className="w-[22px] h-[22px]" style={{ imageRendering: 'pixelated' }} />
              <span className="font-heading text-[14.5px] text-[var(--color-text-main)] max-w-[120px] truncate">
                {win.title}
              </span>
            </button>
          ))}
        </div>

        {/* System Tray & Clock */}
        <div className="flex items-center h-full py-2 gap-2 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 h-full border-[2px] border-[#1E1B2E] rounded-md bg-[var(--color-surface-secondary)]">
            <img src="/icons/taskbar/search.png" alt="Search" className="w-[18px] h-[18px] opacity-80 cursor-pointer hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
            <img src="/icons/taskbar/wifi.png" alt="WiFi" className="w-[18px] h-[18px] opacity-80 cursor-pointer hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
            <img src="/icons/taskbar/battery.png" alt="Battery" className="w-[18px] h-[18px] opacity-80 cursor-pointer hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
            <img src="/icons/taskbar/speaker.png" alt="Volume" className="w-[18px] h-[18px] opacity-80 cursor-pointer hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
            <img src="/icons/taskbar/bell.png" alt="Notifications" className="w-[18px] h-[18px] opacity-80 cursor-pointer hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
          </div>

          <div className="flex items-center gap-2 px-4 h-full border-[2px] border-[#1E1B2E] rounded-md bg-[var(--color-surface-secondary)] text-[var(--color-text-main)] font-content text-[15px] cursor-default">
            <img src="/icons/taskbar/clock.png" alt="Clock" className="w-[18px] h-[18px] opacity-80" style={{ imageRendering: 'pixelated' }} />
            <span>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

      </div>
    </>
  );
};
