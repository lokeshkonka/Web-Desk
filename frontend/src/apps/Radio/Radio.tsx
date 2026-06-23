import React, { useState, useEffect, useRef } from 'react';

interface RadioProps {
  id?: string;
  initialData?: {
    isLocal?: boolean;
    url?: string;
    name?: string;
  };
}

interface Station {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
}

import { useAudioStore } from '../../store/audio.store';

export const Radio: React.FC<RadioProps> = ({ initialData }) => {
  const { isLocal, url, name } = initialData || {};
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{ name: string; url: string; icon?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Local Media or Fetch Stations
  useEffect(() => {
    if (isLocal && url && name) {
      setCurrentTrack({ name, url, icon: '/icons/files/audio.png' });
      setIsPlaying(true);
    } else {
      fetchStations();
    }
  }, [isLocal, url, name]);

  const fetchStations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://de1.api.radio-browser.info/json/stations/topclick?limit=50&hidebroken=true');
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      setStations(data.filter((s: Station) => s.url_resolved));
      
      // Auto-select first station if available
      if (data.length > 0 && !currentTrack) {
        setCurrentTrack({ 
          name: data[0].name || 'Unknown Station', 
          url: data[0].url_resolved,
          icon: data[0].favicon
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error loading stations');
    } finally {
      setIsLoading(false);
    }
  };

  const { globalVolume } = useAudioStore();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = globalVolume;
    }
  }, [globalVolume]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Playback failed", e);
        setError("Could not play the stream.");
        setIsPlaying(false);
      });
    }
  };

  const playStation = (station: Station) => {
    setCurrentTrack({ name: station.name || 'Unknown Station', url: station.url_resolved, icon: station.favicon });
    setIsPlaying(true);
    // Setting state and ref triggers play via the effect below
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0B14] text-white font-content overflow-hidden relative">
      {/* Background Blur */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Header / Player Area */}
        <div className="p-6 bg-gradient-to-b from-[#1A1625] to-transparent border-b border-white/5 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          {/* Album / Icon */}
          <div className="shrink-0 w-32 h-32 bg-[#221D32] rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden relative group">
            {currentTrack?.icon ? (
              <img src={currentTrack.icon} alt="Cover" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = '/icons/desktop-apps/radio.png')} />
            ) : (
              <img src="/icons/desktop-apps/radio.png" alt="Radio" className="w-16 h-16 opacity-50" />
            )}
            
            {/* Visualizer Overlay if playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 gap-1 pb-4">
                <div className="flex items-end justify-center gap-1 h-8">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-[#00F0FF] rounded-t-sm animate-pulse" 
                      style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animationDuration: `${0.4 + Math.random() * 0.5}s` 
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Track Info & Controls */}
          <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
            {isLocal ? (
              <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold w-max mx-auto sm:mx-0 mb-2">LOCAL MEDIA</div>
            ) : (
              <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold w-max mx-auto sm:mx-0 mb-2">LIVE RADIO</div>
            )}
            
            <h2 className="text-2xl font-heading font-bold truncate max-w-md" title={currentTrack?.name || 'No Track Selected'}>
              {currentTrack?.name || 'No Track Selected'}
            </h2>
            <p className="text-sm text-white/50 mt-1 mb-4 truncate">{isLocal ? 'Playing from Inventory' : 'Streaming from Internet'}</p>

            <div className="flex items-center justify-center sm:justify-start gap-4">
              <button 
                className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20 disabled:opacity-50"
                onClick={togglePlay}
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  // Pause Icon
                  <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                ) : (
                  // Play Icon
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              
              <div className="flex items-center gap-2 ml-4 bg-black/40 px-3 py-2 rounded-full border border-white/5">
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/></svg>
                <div className="text-xs text-white/50 font-bold px-2">Volume controlled by Taskbar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio 
          ref={audioRef} 
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setError("Failed to play this media. It might be offline or unsupported.");
            setIsPlaying(false);
          }}
        />

        {/* Error State */}
        {error && (
          <div className="m-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        {/* List Area */}
        {!isLocal && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 px-2">Top Global Stations</h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center text-white/50 py-8">No stations found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stations.map((station) => (
                  <button 
                    key={station.stationuuid}
                    onClick={() => playStation(station)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                      ${currentTrack?.url === station.url_resolved 
                        ? 'bg-white/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}
                    `}
                  >
                    <div className="w-10 h-10 shrink-0 bg-black/50 rounded-lg flex items-center justify-center overflow-hidden">
                      {station.favicon ? (
                        <img src={station.favicon} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <svg className="w-5 h-5 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${currentTrack?.url === station.url_resolved ? 'text-purple-300' : 'text-white'}`}>
                        {station.name || 'Unknown Station'}
                      </div>
                      <div className="text-xs text-white/40 truncate mt-0.5">
                        {station.country || 'Global'} {station.tags && `• ${station.tags.split(',')[0]}`}
                      </div>
                    </div>
                    {currentTrack?.url === station.url_resolved && isPlaying && (
                      <div className="flex items-end gap-0.5 h-4 shrink-0">
                        <div className="w-1 bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
