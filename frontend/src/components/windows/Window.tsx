import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { useDesktopStore } from '../../store/useDesktopStore';
import type { WindowData } from '../../types';
import { appRegistry, getAppContent } from '../../registry/appRegistry';
import { useRef } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

export const Window = ({ windowData }: { windowData: WindowData }) => {
  const { closeWindow, minimizeWindow, setActiveWindow, activeWindowId } = useDesktopStore();

  const rndRef = useRef<any>(null);

  const appMeta = appRegistry[windowData.appId || windowData.id];
  const defaultWidth = appMeta?.defaultWidth || 500;
  const defaultHeight = appMeta?.defaultHeight || 350;
  const minWidth = appMeta?.minWidth || 300;
  const minHeight = appMeta?.minHeight || 200;

  // Center the window on mount
  const xPos = typeof window !== 'undefined' ? (window.innerWidth - defaultWidth) / 2 : 100;
  const yPos = typeof window !== 'undefined' ? (window.innerHeight - 64 - defaultHeight) / 2 : 100;

  // if (windowData.isMinimized) return null; // We use display: none instead to preserve state

  const isActive = activeWindowId === windowData.id;

  return (
    <AnimatePresence>
      <Rnd
        ref={rndRef}
        default={{
          x: xPos,
          y: yPos,
          width: defaultWidth,
          height: defaultHeight
        }}
        minWidth={minWidth}
        minHeight={minHeight}
        bounds="parent"
        dragHandleClassName="window-drag-handle"
        enableResizing={true}
        onDragStart={() => setActiveWindow(windowData.id)}
        onResizeStart={() => setActiveWindow(windowData.id)}
        resizeHandleStyles={{
          right: { cursor: 'ew-resize', width: '10px', right: '-5px' },
          bottom: { cursor: 'ns-resize', height: '10px', bottom: '-5px' },
          bottomRight: { cursor: 'nwse-resize', width: '20px', height: '20px', right: '-10px', bottom: '-10px' },
          left: { cursor: 'ew-resize', width: '10px', left: '-5px' },
          top: { cursor: 'ns-resize', height: '10px', top: '-5px' },
          topLeft: { cursor: 'nwse-resize', width: '20px', height: '20px', left: '-10px', top: '-10px' },
          topRight: { cursor: 'nesw-resize', width: '20px', height: '20px', right: '-10px', top: '-10px' },
          bottomLeft: { cursor: 'nesw-resize', width: '20px', height: '20px', left: '-10px', bottom: '-10px' }
        }}
        style={{ zIndex: windowData.zIndex, display: windowData.isMinimized ? 'none' : 'flex' }}
        className="absolute"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onPointerDown={() => {
            setActiveWindow(windowData.id);
            // Don't stop propagation completely, but let's ensure it doesn't trigger desktop selection
          }}
          className={`flex flex-col w-full h-full bg-[var(--color-surface)]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-xl
            ${isActive ? 'ring-1 ring-[var(--color-accent)] ring-offset-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : 'shadow-lg opacity-95 hover:opacity-100'}
          `}
        >
          {/* Window Header */}
          <div 
            className="window-drag-handle h-10 shrink-0 bg-black/20 border-b border-white/5 flex items-center px-3 select-none relative"
            style={{ cursor: "url('/cursor/move.cur'), url('/cursor/move.png') 16 16, move" }}
          >
            {/* Title Section */}
            <div className="flex items-center gap-2 overflow-hidden select-none absolute left-3 right-[100px]">
              <img src={windowData.icon} alt="icon" draggable={false} className="w-[18px] h-[18px] shrink-0 pointer-events-none drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
              <span className="font-heading text-white font-medium tracking-wide text-[16px] truncate pointer-events-none drop-shadow-md">
                {windowData.title}
              </span>
            </div>
            
            {/* Window Controls */}
            <div 
              className="flex items-center gap-1 shrink-0 absolute right-3"
              onPointerDown={(e) => e.stopPropagation()} /* Prevent dragging by window controls */
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); minimizeWindow(windowData.id); }}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <img src="/icons/windows/minimize.png" alt="Minimize" className="w-[14px] h-[14px]" style={{ imageRendering: 'pixelated' }} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); closeWindow(windowData.id); }}
                className="p-1.5 hover:bg-red-500/80 rounded transition-colors"
              >
                <img src="/icons/windows/close.png" alt="Close" className="w-[14px] h-[14px]" style={{ imageRendering: 'pixelated' }} />
              </button>
            </div>
          </div>
          
          {/* Window Content */}
          <div 
            className="flex-1 bg-[var(--color-background)]/50 overflow-auto"
            style={{ touchAction: 'auto' }}
            onPointerDownCapture={() => {
               // Focus window when clicking content, but don't prevent default so inputs still work
               setActiveWindow(windowData.id);
            }} 
          >
            <ErrorBoundary>
              {getAppContent(windowData.appId || windowData.id, windowData.id, windowData.initialData)}
            </ErrorBoundary>
          </div>
        </motion.div>
      </Rnd>
    </AnimatePresence>
  );
};
