import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../store/useDesktopStore';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Menu = ({ isOpen, onClose }: MenuProps) => {
  const { openWindow } = useDesktopStore();

  const menuApps = [
    { id: 'terminal', title: 'Terminal', icon: '/icons/desktop-apps/terminal.png' },
    { id: 'journal', title: 'Journal', icon: '/icons/desktop-apps/journal.png' },
    { id: 'inventory', title: 'Inventory', icon: '/icons/desktop-apps/inventory.png' },
    { id: 'workshop', title: 'Workshop', icon: '/icons/desktop-apps/workspace.png' },
    { id: 'radio', title: 'Radio', icon: '/icons/desktop-apps/radio.png' },
    { id: 'calculator', title: 'Calculator', icon: '/icons/desktop-apps/calculator.png' },
    { id: 'weather', title: 'Weather', icon: '/icons/desktop-apps/whether.png' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onPointerDown={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[70px] left-2 w-[300px] bg-[var(--color-surface)] border-[3px] border-[#1E1B2E] rounded-lg shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            <div className="bg-[var(--color-surface-secondary)] p-4 border-b-[2px] border-[#1E1B2E]">
              <h2 className="font-heading text-xl text-[var(--color-accent)]">WebDesk OS</h2>
              <p className="font-content text-xs text-[var(--color-text-muted)]">v1.0.0</p>
            </div>
            
            <div className="p-2 flex flex-col gap-1 max-h-[350px] overflow-y-auto">
              {menuApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app.id, app.title, app.icon);
                    onClose();
                  }}
                  className="flex items-center gap-3 w-full p-2 rounded hover:bg-white/10 transition-colors text-left"
                >
                  <img src={app.icon} alt={app.title} className="w-6 h-6 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                  <span className="font-content text-sm text-[var(--color-text-main)]">{app.title}</span>
                </button>
              ))}
            </div>

            <div className="bg-[var(--color-surface-secondary)] p-2 border-t-[2px] border-[#1E1B2E] mt-auto">
              <button 
                className="flex items-center gap-3 w-full p-2 rounded hover:bg-red-500/20 text-red-400 transition-colors text-left"
                onClick={() => alert("Shutting down... (Not Implemented)")}
              >
                <img src="/icons/taskbar/power.png" alt="Power" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
                <span className="font-content text-sm">Power Off</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
