import { useDesktopStore } from '../../store/useDesktopStore';

export const TrashApp = () => {
  const { recycleBinApps, restoreDesktopApp, emptyRecycleBin } = useDesktopStore();

  return (
    <div className="w-full h-full flex flex-col bg-black/60 backdrop-blur-xl text-white overflow-hidden font-sans custom-scrollbar">
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between shadow-lg z-10 backdrop-blur-md">
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2 drop-shadow-md">
          <span className="text-2xl">🗑️</span> Recycle Bin
        </h2>
        <button 
          onClick={emptyRecycleBin}
          disabled={!recycleBinApps || recycleBinApps.length === 0}
          className="px-5 py-2 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white rounded-lg font-medium disabled:opacity-30 disabled:hover:bg-red-500/20 disabled:cursor-not-allowed transition-all border border-red-500/30 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:shadow-none"
        >
          Empty Trash
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {!recycleBinApps || recycleBinApps.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#A8A29E]">
            <span className="text-6xl mb-4 opacity-30">🪹</span>
            <p className="text-lg font-medium text-white mb-1">Recycle bin is empty</p>
            <p className="text-sm">Items you delete will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 content-start">
            {recycleBinApps.map(app => (
              <div key={app.id} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group shadow-md hover:shadow-lg">
                <img 
                  src={app.icon} 
                  alt={app.title} 
                  className="w-14 h-14 opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110 drop-shadow-lg" 
                  style={{ imageRendering: 'pixelated' }} 
                />
                <span className="text-sm font-medium text-center truncate w-full text-[#E0E0E0] group-hover:text-white">{app.title}</span>
                <button 
                  onClick={() => restoreDesktopApp(app.id)}
                  className="mt-2 px-4 py-1.5 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-white text-xs rounded-lg w-full border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] transition-all font-bold tracking-wide"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
