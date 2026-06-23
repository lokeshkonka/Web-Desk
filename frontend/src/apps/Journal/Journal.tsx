import React, { useEffect, useState, useRef } from 'react';
import { useJournalStore } from '../../store/journal.store';

export const Journal = () => {
  const { entries, activeEntryId, isLoading, loadEntries, setActiveEntry, createEntry, updateEntry, deleteEntry } = useJournalStore();
  const activeEntry = entries.find(e => e.id === activeEntryId);

  // Local state for debounced saving
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Sync local state when active entry changes
  useEffect(() => {
    if (activeEntry) {
      setLocalTitle(activeEntry.title);
      setLocalContent(activeEntry.content);
    } else {
      setLocalTitle('');
      setLocalContent('');
    }
  }, [activeEntryId, activeEntry?.title, activeEntry?.content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    scheduleSave(newTitle, localContent);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    scheduleSave(localTitle, newContent);
  };

  const scheduleSave = (title: string, content: string) => {
    if (!activeEntryId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateEntry(activeEntryId, title, content);
    }, 1000); // Auto-save after 1 second of inactivity
  };

  return (
    <div className="flex h-full bg-[#fdf6e3] text-[#657b83] font-content border-l-[20px] border-[#cb4b16]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#eee8d5] flex flex-col bg-[#fdf6e3]">
        <div className="p-4 border-b border-[#eee8d5] flex justify-between items-center bg-[#eee8d5]/30">
          <h2 className="text-xl font-heading text-[#b58900] font-semibold">Notes</h2>
          <button 
            onClick={createEntry}
            className="p-1 hover:bg-[#eee8d5] rounded text-[#cb4b16] transition-colors"
            title="New Note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[#93a1a1]">Loading notes...</div>
          ) : entries.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#93a1a1]">No notes found.<br/>Create one to start.</div>
          ) : (
            entries.map(entry => (
              <div 
                key={entry.id} 
                onClick={() => setActiveEntry(entry.id)}
                className={`p-4 border-b border-[#eee8d5]/50 cursor-pointer transition-colors relative group
                  ${activeEntryId === entry.id ? 'bg-[#eee8d5] border-l-4 border-l-[#b58900]' : 'hover:bg-[#eee8d5]/50 border-l-4 border-l-transparent'}
                `}
              >
                <div className="font-semibold text-[#586e75] truncate pr-6">{entry.title || 'Untitled Note'}</div>
                <div className="text-xs text-[#93a1a1] mt-1 truncate">{entry.content || 'No content...'}</div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-white rounded transition-all"
                  title="Delete Note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col p-6 bg-[#fdf6e3]">
        {activeEntry ? (
          <>
            <input 
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              className="text-3xl font-heading mb-4 text-[#b58900] bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent font-bold placeholder-[#b58900]/50"
              placeholder="Note Title"
              spellCheck="false"
            />
            <div className="text-xs text-[#93a1a1] mb-6 font-mono">
              Last updated: {new Date(activeEntry.updatedAt).toLocaleString()}
            </div>
            <textarea 
              value={localContent}
              onChange={handleContentChange}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent resize-none font-content text-lg leading-relaxed text-[#586e75] placeholder-[#93a1a1]/50 custom-scrollbar"
              placeholder="Start typing your thoughts here..."
              spellCheck="false"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#93a1a1]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-lg font-heading">Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
