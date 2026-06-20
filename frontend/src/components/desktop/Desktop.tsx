import { useState } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { Window } from '../windows/Window';
import { Rnd } from 'react-rnd';

export const Desktop = () => {
  const { windows, wallpaper, desktopApps, updateDesktopAppPosition, openWindow, setActiveWindow } = useDesktopStore();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const [iconContextMenu, setIconContextMenu] = useState<{ x: number, y: number, appId: string } | null>(null);

  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
      if (e.button === 0) { // left click
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      setContextMenu(null);
      setIconContextMenu(null);
      setActiveWindow('');
      setSelectedIcon(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (selectionBox) {
      setSelectionBox(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      setContextMenu({ x: e.clientX, y: e.clientY });
      setIconContextMenu(null);
    }
    setSelectedIcon(null);
  };

  const getSelectionRect = () => {
    if (!selectionBox) return null;
    const { startX, startY, endX, endY } = selectionBox;
    return {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(startX - endX),
      height: Math.abs(startY - endY),
    };
  };

  const selectionRect = getSelectionRect();

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500"
      style={{ backgroundImage: `url('/Wallpapers/${wallpaper}')`, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Icons */}
      {desktopApps.map((app) => {
        const isSelected = selectedIcon === app.id;
        return (
          <Rnd
            key={app.id}
            default={{ x: app.x, y: app.y, width: 84, height: 96 }}
            onDragStop={(_, d) => {
              updateDesktopAppPosition(app.id, d.x, d.y);
            }}
            enableResizing={false}
            onDragStart={() => { setSelectedIcon(app.id); setActiveWindow(''); setContextMenu(null); setIconContextMenu(null); }}
            className="flex flex-col items-center justify-start absolute z-10"
            dragHandleClassName="desktop-icon-drag"
          >
            <div
              onPointerDown={() => { setSelectedIcon(app.id); setActiveWindow(''); setContextMenu(null); setIconContextMenu(null); }}
              onDoubleClick={(e) => { e.stopPropagation(); openWindow(app.id, app.title, app.icon); setSelectedIcon(null); }}
              onContextMenu={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIconContextMenu({ x: e.clientX, y: e.clientY, appId: app.id }); 
                setContextMenu(null);
                setSelectedIcon(app.id);
              }}
              className={`desktop-icon-drag group flex flex-col items-center gap-1 w-[84px] p-2 rounded transition-all outline-none border-[2px] select-none cursor-pointer
                ${isSelected ? 'bg-black/40 border-[var(--color-accent)]/50 backdrop-blur-sm' : 'border-transparent hover:bg-black/30 hover:backdrop-blur-sm'}
              `}
              style={{ cursor: "url('/cursor/pointer.cur'), url('/cursor/pointer.png') 0 0, pointer" }}
            >
              <img 
                src={app.icon} 
                alt={app.title} 
                draggable={false}
                className="w-[52px] h-[52px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform pointer-events-none" 
                style={{ imageRendering: 'pixelated' }} 
              />
              <span className="text-white text-[12.5px] font-content drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold text-center break-words w-full line-clamp-2 pointer-events-none">
                {app.title}
              </span>
            </div>
          </Rnd>
        );
      })}

      {/* Render Windows */}
      {windows.map((win) => (
        <Window key={win.id} windowData={win} />
      ))}

      {/* Desktop Context Menu */}
      {contextMenu && (
        <div 
          className="absolute z-[9999] bg-[var(--color-surface)] border-[2px] border-[#1E1B2E] rounded shadow-xl py-1 flex flex-col min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <button 
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => { setContextMenu(null); window.location.reload(); }}
          >
            Refresh
          </button>
          <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
          <button 
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => { setContextMenu(null); openWindow('workshop', 'Workshop', '/icons/desktop-apps/workspace.png'); }}
          >
            Settings
          </button>
          <button 
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => { setContextMenu(null); openWindow('workshop', 'Workshop', '/icons/desktop-apps/workspace.png'); }}
          >
            Appearance
          </button>
          <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
          <button 
            className="px-4 py-2 text-left text-sm font-content text-[#A8A29E] cursor-not-allowed"
          >
            New Folder (Future)
          </button>
          <button 
            className="px-4 py-2 text-left text-sm font-content text-[#A8A29E] cursor-not-allowed"
          >
            Sort Icons (Future)
          </button>
        </div>
      )}

      {/* Icon Context Menu */}
      {iconContextMenu && (
        <div 
          className="absolute z-[9999] bg-[var(--color-surface)] border-[2px] border-[#1E1B2E] rounded shadow-xl py-1 flex flex-col min-w-[150px]"
          style={{ top: iconContextMenu.y, left: iconContextMenu.x }}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <button 
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => {
              const app = desktopApps.find(a => a.id === iconContextMenu.appId);
              if (app) openWindow(app.id, app.title, app.icon);
              setIconContextMenu(null);
            }}
          >
            Open
          </button>
          <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
          <button className="px-4 py-2 text-left text-sm font-content text-[#A8A29E] cursor-not-allowed">Rename (Future)</button>
          <button className="px-4 py-2 text-left text-sm font-content text-[#A8A29E] cursor-not-allowed">Delete (Future)</button>
          <button className="px-4 py-2 text-left text-sm font-content text-[#A8A29E] cursor-not-allowed">Properties (Future)</button>
        </div>
      )}

      {/* Selection Box */}
      {selectionRect && selectionBox && (Math.abs(selectionBox.startX - selectionBox.endX) > 5 || Math.abs(selectionBox.startY - selectionBox.endY) > 5) && (
        <div
          className="absolute border border-[var(--color-accent)] bg-[var(--color-accent)]/20 z-[8000] pointer-events-none"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}
    </div>
  );
};

