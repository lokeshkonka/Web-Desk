import { useDesktopStore } from '../../store/useDesktopStore';
import { useNotificationStore } from '../../store/notification.store';

export const Workshop = () => {
  const { wallpaper, setWallpaper } = useDesktopStore();
  const { addNotification } = useNotificationStore();

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

  const handleWallpaperSelect = async (w: string) => {
    await setWallpaper(w);
    addNotification({ type: 'success', title: 'Wallpaper Updated', message: 'Your desktop background has been changed successfully.' });
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A24] text-[#F8FAFC] p-8 overflow-y-auto custom-scrollbar font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">Appearance Settings</h1>
        <p className="text-gray-400 mb-8 text-sm">Personalize your workspace background and aesthetic.</p>
        
        <div className="space-y-8">
          <section className="p-6 bg-[#252533] rounded-xl border border-white/5 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-1">Desktop Background</h2>
              <p className="text-gray-400 text-sm">Choose an image to display on your desktop.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wallpapers.map(w => (
                <button
                  key={w}
                  onClick={() => handleWallpaperSelect(w)}
                  className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 outline-none
                    ${wallpaper === w ? 'border-[#3B82F6] ring-4 ring-[#3B82F6]/20 shadow-lg' : 'border-transparent hover:border-white/20'}
                  `}
                >
                  <img 
                    src={`/Wallpapers/${w}`} 
                    alt={w} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${wallpaper === w ? 'scale-100' : 'group-hover:scale-110'}`} 
                  />
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${wallpaper === w ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center`}>
                    <span className="text-xs font-medium px-3 py-1.5 bg-black/60 rounded-full backdrop-blur-sm shadow-sm">Apply Background</span>
                  </div>
                  {wallpaper === w && (
                    <div className="absolute bottom-2 right-2 bg-[#3B82F6] text-white p-1 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
