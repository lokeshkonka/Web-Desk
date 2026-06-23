import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDialogStore } from '../../store/useDialogStore';

export const SystemDialog = () => {
  const { isOpen, options, close } = useDialogStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen && options?.type === 'prompt') {
      setInputValue(options.defaultValue || '');
    }
  }, [isOpen, options]);

  if (!isOpen || !options) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-[#1a1b26]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full font-content text-white transform transition-transform scale-100"
        onKeyDown={(e) => {
          if (e.key === 'Escape') close(null);
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">
            {options.type === 'confirm' ? '⚠️' : options.type === 'prompt' ? '📝' : 'ℹ️'}
          </span>
          <h3 className="text-xl font-bold">{options.title}</h3>
        </div>
        
        <p className="text-[#A8A29E] mb-6 whitespace-pre-wrap leading-relaxed">{options.message}</p>
        
        {options.type === 'prompt' && (
          <input 
            autoFocus
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') close(inputValue);
            }}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 mb-6 outline-none focus:border-[var(--color-accent)] transition-colors text-white cursor-text"
            style={{ cursor: "url('/cursor/text.cur'), url('/cursor/text.png') 16 16, text" }}
          />
        )}
        
        <div className="flex justify-end gap-3">
          {options.type !== 'alert' && (
            <button 
              onClick={() => close(null)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {options.cancelText || 'Cancel'}
            </button>
          )}
          <button 
            onClick={() => close(options.type === 'prompt' ? inputValue : true)}
            autoFocus={options.type !== 'prompt'}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-black font-semibold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            {options.confirmText || (options.type === 'prompt' ? 'Confirm' : 'Yes')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
