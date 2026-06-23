import { useState, useEffect, useRef } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { Menu } from '../menu/Menu';
import { useAudioStore } from '../../store/audio.store';
import { useNotificationStore } from '../../store/notification.store';

export const Taskbar = () => {
  const { windows, setActiveWindow, activeWindowId } = useDesktopStore();
  const { globalVolume, setGlobalVolume } = useAudioStore();
  const { history, clearHistory } = useNotificationStore();
  
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Popups state
  const [activePopup, setActivePopup] = useState<'wifi' | 'speaker' | 'notifications' | 'clock' | null>(null);

  const taskbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (taskbarRef.current && !taskbarRef.current.contains(e.target as Node)) {
        setActivePopup(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopup = (popup: 'wifi' | 'speaker' | 'notifications' | 'clock') => {
    if (activePopup === popup) setActivePopup(null);
    else {
      setActivePopup(popup);
      setIsMenuOpen(false);
    }
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Mozilla Firefox";
    if (ua.includes("SamsungBrowser")) return "Samsung Internet";
    if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
    if (ua.includes("Trident")) return "Internet Explorer";
    if (ua.includes("Edge")) return "Microsoft Edge";
    if (ua.includes("Chrome")) return "Google Chrome";
    if (ua.includes("Safari")) return "Apple Safari";
    return "Unknown Browser";
  };

  return (
    <div ref={taskbarRef} className="w-full h-full relative z-[9999]">
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Popups */}
      {activePopup === 'wifi' && (
        <div className="absolute bottom-12 right-24 bg-[#1A1625] border-[2px] border-[#1E1B2E] rounded-xl shadow-2xl p-4 w-64 text-white font-content">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <img src="/icons/taskbar/wifi.png" alt="WiFi" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div>
              <div className="font-bold">WebDesk Network</div>
              <div className="text-xs text-green-400">Connected</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex justify-between"><span>IP Address:</span> <span>192.168.1.100</span></div>
            <div className="flex justify-between"><span>Security:</span> <span>WPA3-Personal</span></div>
            <div className="flex justify-between"><span>Browser:</span> <span>{getBrowserName()}</span></div>
          </div>
        </div>
      )}

      {activePopup === 'speaker' && (
        <div className="absolute bottom-12 right-16 bg-[#1A1625] border-[2px] border-[#1E1B2E] rounded-xl shadow-2xl p-4 w-64 text-white font-content flex flex-col gap-4">
          <div className="font-bold text-lg">Global Volume</div>
          <div className="flex items-center gap-3">
            <img src="/icons/taskbar/speaker.png" alt="Volume" className={`w-5 h-5 ${globalVolume === 0 ? 'opacity-30' : ''}`} style={{ imageRendering: 'pixelated' }} />
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={globalVolume} 
              onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[var(--color-accent)] h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8 text-right">{Math.round(globalVolume * 100)}%</span>
          </div>
        </div>
      )}

      {activePopup === 'notifications' && (
        <div className="absolute bottom-12 right-10 bg-[#1A1625] border-[2px] border-[#1E1B2E] rounded-xl shadow-2xl w-80 text-white font-content flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center p-3 border-b border-white/10">
            <div className="font-bold">Notifications</div>
            <button onClick={clearHistory} className="text-xs text-[var(--color-accent)] hover:underline">Clear All</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center text-white/40 py-8 text-sm">No new notifications</div>
            ) : (
              history.map(notif => (
                <div key={notif.id + Math.random()} className={`p-3 rounded-lg border flex flex-col gap-1
                  ${notif.type === 'error' ? 'bg-red-500/10 border-red-500/20' : 
                    notif.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 
                    'bg-white/5 border-white/10'}
                `}>
                  <div className="font-bold text-sm flex justify-between">
                    <span>{notif.title}</span>
                    <span className="text-xs opacity-50">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                  {notif.message && <div className="text-xs opacity-80">{notif.message}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activePopup === 'clock' && (
        <div className="absolute bottom-12 right-2 bg-[#1A1625] border-[2px] border-[#1E1B2E] rounded-xl shadow-2xl p-6 text-white font-content flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full border-4 border-[#2A2535] bg-[#1E1B2E] shadow-inner flex items-center justify-center">
            {/* Clock Face Details */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-1 h-3 bg-white/20 rounded-full" 
                   style={{ transform: `rotate(${i * 30}deg) translateY(-85px)` }} />
            ))}
            {/* Hands */}
            <div className="absolute w-1.5 h-16 bg-white rounded-full origin-bottom" 
                 style={{ transform: `translateY(-32px) rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)` }} />
            <div className="absolute w-1 h-20 bg-white/80 rounded-full origin-bottom" 
                 style={{ transform: `translateY(-40px) rotate(${time.getMinutes() * 6 + time.getSeconds() * 0.1}deg)` }} />
            <div className="absolute w-0.5 h-24 bg-red-500 rounded-full origin-[center_80%]" 
                 style={{ transform: `translateY(-30px) rotate(${time.getSeconds() * 6}deg)` }} />
            <div className="absolute w-3 h-3 bg-white rounded-full shadow-md z-10" />
          </div>
          <div className="mt-6 text-3xl font-heading tracking-widest">{time.toLocaleTimeString()}</div>
          <div className="text-sm text-white/50">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      )}

      {/* Main Taskbar */}
      <div className="w-full h-full bg-[var(--color-surface)] border-t-[3px] border-[#1E1B2E] flex items-center px-2 justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        
        {/* Start / Menu Button & Running Apps */}
        <div className="flex items-center gap-2 h-full py-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => { setIsMenuOpen(!isMenuOpen); setActivePopup(null); }}
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
            <button onClick={() => togglePopup('wifi')} className="hover:scale-110 transition-transform">
              <img src="/icons/taskbar/wifi.png" alt="WiFi" className="w-[18px] h-[18px] opacity-80 hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
            </button>
            <button onClick={() => togglePopup('speaker')} className="hover:scale-110 transition-transform">
              <img src="/icons/taskbar/speaker.png" alt="Volume" className={`w-[18px] h-[18px] hover:opacity-100 ${globalVolume === 0 ? 'opacity-30' : 'opacity-80'}`} style={{ imageRendering: 'pixelated' }} />
            </button>
            <button onClick={() => togglePopup('notifications')} className="hover:scale-110 transition-transform relative">
              <img src="/icons/taskbar/bell.png" alt="Notifications" className="w-[18px] h-[18px] opacity-80 hover:opacity-100" style={{ imageRendering: 'pixelated' }} />
              {history.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--color-surface-secondary)]"></div>
              )}
            </button>
          </div>

          <button 
            onClick={() => togglePopup('clock')}
            className="flex items-center gap-2 px-4 h-full border-[2px] border-[#1E1B2E] rounded-md bg-[var(--color-surface-secondary)] hover:bg-[var(--color-accent)]/20 transition-colors text-[var(--color-text-main)] font-content text-[15px]"
          >
            <img src="/icons/taskbar/clock.png" alt="Clock" className="w-[18px] h-[18px] opacity-80" style={{ imageRendering: 'pixelated' }} />
            <span>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
