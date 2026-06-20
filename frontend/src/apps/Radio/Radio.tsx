export const Radio = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#1E1B2E] text-[var(--color-text-main)] p-4 font-content">
      <div className="w-full max-w-sm bg-[var(--color-surface)] border-[2px] border-[#1E1B2E] rounded-md p-4 flex flex-col gap-4 shadow-xl">
        <div className="text-center font-heading text-xl text-[var(--color-accent)]">WebDesk FM</div>
        
        <div className="w-full h-32 bg-black/50 border-[2px] border-[#1E1B2E] rounded flex items-center justify-center relative overflow-hidden">
          {/* Fake audio visualizer */}
          <div className="flex items-end gap-1 h-16">
            <div className="w-2 h-8 bg-[var(--color-accent)] animate-pulse"></div>
            <div className="w-2 h-12 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-6 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-14 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-2 h-10 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-2 h-4 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-16 bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-[var(--color-text-muted)]">Currently Playing</div>
          <div className="font-heading text-lg">Lo-Fi Beats to Relax/Study To</div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          <button className="w-10 h-10 flex items-center justify-center bg-[var(--color-surface-secondary)] border-[2px] border-[#1E1B2E] rounded hover:bg-[var(--color-accent)]/20 transition-colors">
            <img src="/icons/taskbar/menu.png" alt="Prev" className="w-4 h-4 rotate-180 opacity-80" style={{ imageRendering: 'pixelated' }} />
          </button>
          <button className="w-14 h-14 flex items-center justify-center bg-[var(--color-accent)] border-[2px] border-[#1E1B2E] rounded hover:brightness-110 transition-colors">
            <div className="w-4 h-4 border-l-[8px] border-l-[#1E1B2E] border-y-[6px] border-y-transparent ml-1"></div>
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-[var(--color-surface-secondary)] border-[2px] border-[#1E1B2E] rounded hover:bg-[var(--color-accent)]/20 transition-colors">
            <img src="/icons/taskbar/menu.png" alt="Next" className="w-4 h-4 opacity-80" style={{ imageRendering: 'pixelated' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
