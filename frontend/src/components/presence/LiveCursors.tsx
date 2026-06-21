import { useEffect } from 'react';
import { useCollabStore } from '../../store/collaboration.store';

export const LiveCursors = () => {
  const { cursorPositions, broadcastCursor, isConnected } = useCollabStore();

  useEffect(() => {
    if (!isConnected) return;
    
    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 50) { // throttle 50ms (20fps)
        broadcastCursor(e.clientX, e.clientY);
        lastTime = now;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [broadcastCursor, isConnected]);

  if (!isConnected) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {Object.entries(cursorPositions).map(([id, pos]) => (
        <div
          key={id}
          className="absolute flex items-start drop-shadow-md transition-all duration-75 ease-linear"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        >
          {/* Custom Cursor SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.65376 21.3284C5.07409 21.9081 4.02011 21.4019 4.14815 20.6033L6.46747 6.1368C6.61114 5.24108 7.62562 4.88725 8.24357 5.51817L18.4239 15.912C18.9958 16.4959 18.5085 17.5 17.7056 17.5H11.0084L5.65376 21.3284Z" fill={pos.color} stroke="white" strokeWidth="2"/>
          </svg>
          <div 
            className="ml-2 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap"
            style={{ backgroundColor: pos.color }}
          >
            {pos.username}
          </div>
        </div>
      ))}
    </div>
  );
};
