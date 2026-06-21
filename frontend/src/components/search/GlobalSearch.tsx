import React, { useState, useEffect, useRef } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import { appRegistry } from '../../registry/appRegistry';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWindow } = useDesktopStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applications = Object.values(appRegistry).map(app => ({
    type: 'Application',
    title: app.title || app.id,
    id: app.id,
    icon: app.icon || '/icons/desktop-apps/system.png',
    action: () => openWindow(app.id, app.title || app.id, app.icon || '/icons/desktop-apps/system.png')
  }));

  // We could also add files and commands here by merging with apps
  const results = applications.filter(app => 
    app.title.toLowerCase().includes(query.toLowerCase()) || 
    app.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-xl bg-[var(--color-surface)] border-[3px] border-[#1E1B2E] rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b-[3px] border-[#1E1B2E] bg-[var(--color-surface-secondary)]">
          <span className="text-xl mr-3 opacity-60">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/40"
            placeholder="Search applications, files, and commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, i) => (
                <div 
                  key={result.id + i} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => {
                    result.action();
                    setIsOpen(false);
                  }}
                >
                  <img src={result.icon} alt={result.title} className="w-6 h-6" style={{ imageRendering: 'pixelated' }} />
                  <div>
                    <div className="text-white font-medium">{result.title}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">{result.type}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-white/50">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
