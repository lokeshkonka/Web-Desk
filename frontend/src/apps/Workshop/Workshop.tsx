import { useDesktopStore } from '../../store/useDesktopStore';

export const Workshop = () => {
  const { theme, wallpaper, setTheme, setWallpaper } = useDesktopStore();

  const themes = [
    { id: 'cozy-retro', name: 'Cozy Retro' },
    { id: 'dark', name: 'Dark Mode' },
    { id: 'light', name: 'Light Mode' }
  ];

  const wallpapers = [
    'pixel-cafe.png',
    'cozy-bedroom.png',
    'rainy-city.png',
    'mountain-cabin.png',
    'Pixel-Library.png',
    'forest-campfire.png',
    'night-room.png',
    'sunset-lake.png'
  ];

  return (
    <div className="flex flex-col h-full bg-[#2A2438] text-[#F8FAFC] p-6 overflow-auto">
      <h1 className="text-3xl font-heading mb-6 text-[#F59E0B] drop-shadow-sm">Workshop</h1>
      
      <div className="space-y-6">
        <section className="p-5 bg-[#352F44] rounded-lg border-2 border-[#1E1B2E] shadow-inner">
          <h2 className="text-xl font-heading mb-4 text-white">Theme</h2>
          <div className="flex gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-4 py-2 rounded border-2 transition-colors font-content text-sm
                  ${theme === t.id ? 'bg-[var(--color-accent)] border-[#1E1B2E] text-black shadow-md' : 'bg-transparent border-[#1E1B2E] hover:bg-white/10'}
                `}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>

        <section className="p-5 bg-[#352F44] rounded-lg border-2 border-[#1E1B2E] shadow-inner">
          <h2 className="text-xl font-heading mb-4 text-white">Wallpaper</h2>
          <div className="grid grid-cols-2 gap-4">
            {wallpapers.map(w => (
              <button
                key={w}
                onClick={() => setWallpaper(w)}
                className={`group relative aspect-video rounded overflow-hidden border-4 transition-all
                  ${wallpaper === w ? 'border-[var(--color-accent)] shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-[#1E1B2E] hover:border-gray-500'}
                `}
              >
                <img 
                  src={`/Wallpapers/${w}`} 
                  alt={w} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm p-1">
                  <p className="text-xs font-content truncate px-1 text-center">{w.replace('.png', '').replace('-', ' ')}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
