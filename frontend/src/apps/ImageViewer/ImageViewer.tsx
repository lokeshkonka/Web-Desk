import { API_URL } from '../../services/api';

export const ImageViewerApp = ({ initialData }: { initialData?: any }) => {
  if (!initialData?.fileId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/60 backdrop-blur-xl text-[#A8A29E] p-4">
        <span className="text-5xl mb-4 opacity-50">🖼️</span>
        <p>No image selected.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black/80 backdrop-blur-md flex items-center justify-center p-4 relative overflow-hidden group">
      {/* Background blur for a cool effect */}
      <div 
        className="absolute inset-0 bg-center bg-cover blur-3xl opacity-30 scale-125"
        style={{ backgroundImage: `url(${API_URL}/download/${initialData.fileId})` }}
      />
      <img 
        src={`${API_URL}/download/${initialData.fileId}`} 
        alt={initialData.name || 'Image'}
        className="max-w-full max-h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300" 
      />
    </div>
  );
};
