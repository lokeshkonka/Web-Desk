import { useState, useRef, useEffect } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { Window } from '../windows/Window';
import { Rnd } from 'react-rnd';
import { appRegistry } from '../../registry/appRegistry';
import { uploadFileAPI } from '../../services/upload.api';
import { useEditorStore } from '../../store/editor.store';
import { getFileIcon } from '../../utils/icons';

export const Desktop = () => {
  const { windows, wallpaper, desktopApps, layoutVersion, updateDesktopAppPosition, updateDesktopAppTitle, removeDesktopApp, clampDesktopApps, sortDesktopApps, openWindow, setActiveWindow } = useDesktopStore();
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const [iconContextMenu, setIconContextMenu] = useState<{ x: number, y: number, appId: string } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingAppId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingAppId]);

  useEffect(() => {
    const handleResize = () => {
      clampDesktopApps(window.innerWidth, window.innerHeight - 64);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampDesktopApps]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
      if (e.button === 0) { // left click
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      setContextMenu(null);
      setIconContextMenu(null);
      setActiveWindow('');
      setSelectedIcons([]);
      if (editingAppId) setEditingAppId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (selectionBox) {
      const newBox = { ...selectionBox, endX: e.clientX, endY: e.clientY };
      setSelectionBox(newBox);
      
      const left = Math.min(newBox.startX, newBox.endX);
      const top = Math.min(newBox.startY, newBox.endY);
      const width = Math.abs(newBox.startX - newBox.endX);
      const height = Math.abs(newBox.startY - newBox.endY);
      
      const selected = desktopApps.filter(app => {
        const appLeft = app.x;
        const appRight = app.x + 84;
        const appTop = app.y;
        const appBottom = app.y + 96;
        return !(left > appRight || left + width < appLeft || top > appBottom || top + height < appTop);
      }).map(app => app.id);
      
      setSelectedIcons(selected);
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
    setSelectedIcons([]);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const desktopRect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - desktopRect.left;
    const rawY = e.clientY - desktopRect.top;
    const snappedX = Math.round(rawX / 100) * 100;
    const snappedY = Math.round(rawY / 100) * 100;

    // Check if dragged from Menu
    const appType = e.dataTransfer.getData('appType');
    if (appType === 'system') {
      const appId = e.dataTransfer.getData('appId');
      const appTitle = e.dataTransfer.getData('appTitle');
      const appIcon = e.dataTransfer.getData('appIcon');
      
      const currentApps = useDesktopStore.getState().desktopApps;
      if (currentApps.find(a => a.id === appId)) return; // Already on desktop
      
      const newApp = { id: appId, title: appTitle, icon: appIcon, x: snappedX, y: snappedY };
      const newApps = [...currentApps, newApp];
      localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
      useDesktopStore.setState({ desktopApps: newApps });
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      try {
        const res = await uploadFileAPI(file);
        
        // Add as a new desktop app icon dynamically!
        const newAppId = `file-${Date.now()}`;
        const currentApps = useDesktopStore.getState().desktopApps;
        const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.name.split('.').pop()?.toLowerCase() || '');
        const newApp = {
          id: newAppId,
          title: file.name,
          icon: getFileIcon(file.name, file.type),
          x: snappedX,
          y: snappedY,
          initialData: { fileId: res.id, name: res.name, isImage }
        };
        const newApps = [...currentApps, newApp];
        localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
        useDesktopStore.setState({ desktopApps: newApps });
      } catch (err) {
        console.error("Failed to upload file:", err);
      }
    }
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500 ${isDraggingOver ? 'brightness-75' : ''}`}
      style={{ backgroundImage: `url('/Wallpapers/${wallpaper}')`, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/20">
          <div className="bg-[#1E1B2E]/80 backdrop-blur-md px-8 py-6 rounded-2xl border-2 border-[var(--color-accent)]/50 shadow-2xl flex flex-col items-center">
            <div className="text-6xl mb-4 animate-bounce">📥</div>
            <h2 className="text-2xl font-heading font-bold text-white">Drop to Upload to Desktop</h2>
          </div>
        </div>
      )}

      {/* Desktop Icons */}
      {desktopApps.map((app) => {
        const isSelected = selectedIcons.includes(app.id);
        return (
          <Rnd
            key={`${app.id}-v${layoutVersion}`}
            default={{ x: app.x, y: app.y, width: 84, height: 96 }}
            bounds="parent"
            onDragStop={(_, d) => {
              updateDesktopAppPosition(app.id, d.x, d.y);
            }}
            enableResizing={false}
            onDragStart={() => { 
              if (!selectedIcons.includes(app.id)) setSelectedIcons([app.id]); 
              setActiveWindow(''); setContextMenu(null); setIconContextMenu(null); 
            }}
            className={`flex flex-col items-center justify-start absolute ${isSelected ? 'z-[50]' : 'z-10'}`}
            dragHandleClassName="desktop-icon-drag"
          >
            <div
              onPointerDown={(e) => { 
                if (!e.ctrlKey && !e.shiftKey && !selectedIcons.includes(app.id)) setSelectedIcons([app.id]); 
                else if ((e.ctrlKey || e.shiftKey) && !selectedIcons.includes(app.id)) setSelectedIcons([...selectedIcons, app.id]);
                else if ((e.ctrlKey || e.shiftKey) && selectedIcons.includes(app.id)) setSelectedIcons(selectedIcons.filter(id => id !== app.id));
                setActiveWindow(''); setContextMenu(null); setIconContextMenu(null); 
              }}
              onDoubleClick={(e) => { 
                e.stopPropagation(); 
                if (app.id.startsWith('file-') && app.initialData) {
                  if (app.initialData.isImage) {
                    openWindow(`imageviewer-${app.id}`, app.title, app.icon || '/icons/files/image.png', app.initialData);
                  } else {
                    useEditorStore.getState().openFile(app.initialData.fileId, app.title);
                  }
                } else {
                  openWindow(app.id, app.title, appRegistry[app.id]?.icon || app.icon); 
                }
                setSelectedIcons([]); 
              }}
              onContextMenu={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                setIconContextMenu({ x: e.clientX, y: e.clientY, appId: app.id }); 
                setContextMenu(null);
                if (!selectedIcons.includes(app.id)) setSelectedIcons([app.id]);
              }}
              className={`desktop-icon-drag group flex flex-col items-center gap-1 w-[84px] p-2 rounded transition-all outline-none border-[2px] select-none cursor-pointer
                ${isSelected ? 'bg-black/40 border-[var(--color-accent)]/50 backdrop-blur-sm' : 'border-transparent hover:bg-black/30 hover:backdrop-blur-sm'}
              `}
              style={{ cursor: "url('/cursor/pointer.cur'), url('/cursor/pointer.png') 0 0, pointer" }}
            >
              <img 
                src={appRegistry[app.id]?.icon || app.icon} 
                alt={app.title} 
                draggable={false}
                className="w-[52px] h-[52px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform pointer-events-none" 
                style={{ imageRendering: 'pixelated' }} 
              />
              <span 
                className="desktop-icon-drag text-white text-[12.5px] font-content drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis w-[80px] pointer-events-none"
                onClick={(e) => {
                  if (isSelected) {
                    e.stopPropagation();
                    setEditingAppId(app.id);
                  }
                }}
                style={isSelected ? { pointerEvents: 'auto' } : {}}
              >
                {editingAppId === app.id ? (
                  <input
                    ref={editInputRef}
                    className="w-full bg-black/50 text-white outline-none border border-[var(--color-accent)] text-center px-1 py-[1px] rounded"
                    defaultValue={app.title}
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      updateDesktopAppTitle(app.id, e.target.value || app.title);
                      setEditingAppId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateDesktopAppTitle(app.id, e.currentTarget.value || app.title);
                        setEditingAppId(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingAppId(null);
                      }
                    }}
                  />
                ) : (
                  app.title
                )}
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
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => { setContextMenu(null); sortDesktopApps(); }}
          >
            Sort Icons
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
          <button 
            className="px-4 py-2 text-left text-sm font-content text-white hover:bg-[var(--color-accent)]/20 transition-colors"
            onClick={() => {
              if (iconContextMenu?.appId) {
                setEditingAppId(iconContextMenu.appId);
              }
              setIconContextMenu(null);
            }}
          >
            Rename
          </button>
          <button 
            className="px-4 py-2 text-left text-sm font-content text-red-400 hover:bg-red-500/20 transition-colors"
            onClick={() => {
              if (iconContextMenu?.appId) {
                removeDesktopApp(iconContextMenu.appId);
              }
              setIconContextMenu(null);
            }}
          >
            Delete
          </button>
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

