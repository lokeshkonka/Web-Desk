import { useEffect, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useEditorStore } from '../../store/editor.store';
import { useNotificationStore } from '../../store/notification.store';

export const EditorApp = () => {
  const { openedFiles, activeFileId, closeFile, setActiveFile, updateFileContent, saveFile } = useEditorStore();
  const [minimap, setMinimap] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const activeFile = openedFiles.find(f => f.id === activeFileId);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeFileId) {
          const success = await saveFile(activeFileId);
          if (success) {
            setSaveStatus('Saved');
            useNotificationStore.getState().addNotification({ type: 'success', title: 'File Saved', message: `Saved ${activeFile?.name || 'file'}` });
            setTimeout(() => setSaveStatus(null), 2000);
          } else {
            setSaveStatus('Failed to save file.');
            useNotificationStore.getState().addNotification({ type: 'error', title: 'Save Failed', message: `Could not save ${activeFile?.name || 'file'}` });
            setTimeout(() => setSaveStatus(null), 3000);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeFileId, saveFile, activeFile]);

  if (openedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E] text-gray-500 font-sans">
        Open a file to begin editing.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      {/* Tabs */}
      <div className="flex flex-wrap bg-[#2D2D2D] select-none">
        {openedFiles.map(file => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`flex items-center gap-2 px-3 py-1.5 min-w-[100px] max-w-[200px] border-r border-black/20 cursor-pointer text-sm font-sans ${
              activeFileId === file.id ? 'bg-[#1E1E1E] text-white' : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#383838]'
            }`}
          >
            <span className="truncate">{file.name} {file.isDirty && '*'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="ml-auto hover:bg-white/10 rounded-sm w-5 h-5 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Editor Header / Controls */}
      <div className="flex justify-between items-center px-3 py-1 bg-[#1E1E1E] text-[#A8A29E] text-xs font-sans border-b border-[#333]">
        <div className="flex gap-4">
          <button onClick={() => setMinimap(!minimap)} className="hover:text-white transition-colors">
            {minimap ? 'Hide Minimap' : 'Show Minimap'}
          </button>
        </div>
        <div className="flex gap-4">
          {saveStatus && <span className={saveStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}>{saveStatus}</span>}
          {activeFile && <span>{activeFile.language}</span>}
          {activeFile && <span>{activeFile.content.split('\n').length} Lines</span>}
          {activeFile && <span>{activeFile.content.length} Chars</span>}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        {activeFile && (
          <MonacoEditor
            height="100%"
            language={activeFile.language}
            theme="vs-dark"
            value={activeFile.content}
            onChange={(val) => updateFileContent(activeFile.id, val || '')}
            options={{
              minimap: { enabled: minimap },
              wordWrap: 'on',
              formatOnPaste: true,
              fontSize: 14,
              fontFamily: 'monospace',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
            onMount={(editor, monaco) => {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                saveFile(activeFile.id).then((success) => {
                  if (success) {
                    setSaveStatus('Saved');
                    useNotificationStore.getState().addNotification({ type: 'success', title: 'File Saved', message: `Saved ${activeFile.name}` });
                    setTimeout(() => setSaveStatus(null), 2000);
                  } else {
                    setSaveStatus('Failed to save file.');
                    useNotificationStore.getState().addNotification({ type: 'error', title: 'Save Failed', message: `Could not save ${activeFile.name}` });
                    setTimeout(() => setSaveStatus(null), 3000);
                  }
                });
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
