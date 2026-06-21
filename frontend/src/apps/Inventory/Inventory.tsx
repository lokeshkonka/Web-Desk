import { useState, useEffect } from 'react';
import * as fsApi from '../../services/filesystem.api';
import { uploadFileAPI, deleteFileAPI, permanentDeleteFileAPI, restoreFileAPI } from '../../services/upload.api';
import { useEditorStore } from '../../store/editor.store';
import { apiFetch, API_URL } from '../../services/api';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

interface File {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  size: number;
  folderId: string | null;
  createdAt: string;
}

export const Inventory = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Root' }]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'folder' | 'file' | 'bg'; id?: string; name?: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Upload & Drag Drop state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isTrashView, setIsTrashView] = useState(false);

  const loadDirectory = async (folderId: string | null) => {
    try {
      if (isTrashView) {
        setFolders([]);
        const trashFiles = await apiFetch('/files/trash');
        setFiles(trashFiles);
        return;
      }

      const fetchedFolders = await fsApi.fetchFolders(folderId || undefined);
      const fetchedFiles = await fsApi.fetchFiles(folderId || undefined);
      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (error) {
      // Notification handled by apiFetch
    }
  };

  useEffect(() => {
    loadDirectory(currentFolderId);
  }, [currentFolderId, isTrashView]);

  const toggleTrashView = () => {
    setIsTrashView(!isTrashView);
    setCurrentFolderId(null);
    setBreadcrumbs([{ id: null, name: isTrashView ? 'Root' : 'Trash' }]);
  };

  const handleCreateFolder = async () => {
    const name = prompt('Folder name:', 'New Folder');
    if (name) {
      await fsApi.createFolder(name, currentFolderId || undefined);
      loadDirectory(currentFolderId);
    }
  };

  const doUpload = async (file: globalThis.File) => {
    try {
      setUploadProgress(0);
      await uploadFileAPI(file, currentFolderId || undefined, (prog: number) => setUploadProgress(prog));
      loadDirectory(currentFolderId);
    } catch (err) {
      // Notification handled by apiFetch
    } finally {
      setUploadProgress(null);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await doUpload(e.target.files[0]);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await doUpload(e.dataTransfer.files[0]);
    }
  };

  const handleNavigate = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs(prev => {
      const index = prev.findIndex(b => b.id === folderId);
      if (index !== -1) return prev.slice(0, index + 1);
      return [...prev, { id: folderId, name: folderName }];
    });
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const breadcrumb = breadcrumbs[index];
    setCurrentFolderId(breadcrumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file' | 'bg', id?: string, name?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter items based on search query
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const closeContextMenu = () => setContextMenu(null);

  const handleDelete = async (type: 'folder' | 'file', id: string) => {
    if (isTrashView && type === 'file') {
      if (confirm('Permanently delete this file?')) {
        await permanentDeleteFileAPI(id);
        loadDirectory(currentFolderId);
      }
    } else {
      if (confirm('Are you sure you want to move this to trash?')) {
        if (type === 'folder') await fsApi.deleteFolder(id);
        else await deleteFileAPI(id);
        loadDirectory(currentFolderId);
      }
    }
    closeContextMenu();
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreFileAPI(id);
      loadDirectory(currentFolderId);
    } catch (err) {
      // Error handled by notification store
    }
    closeContextMenu();
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
    closeContextMenu();
  };

  const finishRename = async (type: 'folder' | 'file', id: string) => {
    if (renameValue.trim()) {
      if (type === 'folder') await fsApi.updateFolder(id, renameValue.trim());
      else await fsApi.updateFile(id, renameValue.trim());
      loadDirectory(currentFolderId);
    }
    setRenamingId(null);
  };

  const openFile = (file: File) => {
    if (file.type && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.type.toLowerCase()) || file.mimeType?.startsWith('image/')) {
      window.open(`${API_URL}/download/${file.id}`, '_blank');
    } else {
      const editorStore = useEditorStore.getState();
      editorStore.openFile(file.id, file.name);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-surface)] text-[var(--color-text-main)] font-content" onClick={closeContextMenu}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b-[2px] border-[#1E1B2E] bg-[var(--color-surface-secondary)]">
        <div className="flex items-center gap-2">
          <button onClick={() => {
            if (breadcrumbs.length > 1) handleNavigateBreadcrumb(breadcrumbs.length - 2);
          }} className="px-2 py-1 bg-black/20 hover:bg-[var(--color-accent)]/20 border border-[#1E1B2E] rounded transition-colors disabled:opacity-50" disabled={breadcrumbs.length <= 1}>
            &larr; Back
          </button>
          
          <div className="h-6 w-[2px] bg-[#1E1B2E] mx-1" />
          
          <button onClick={toggleTrashView} className={`px-3 py-1 border border-[#1E1B2E] rounded transition-colors flex items-center gap-2 ${isTrashView ? 'bg-[var(--color-accent)]/20' : 'bg-black/20 hover:bg-[var(--color-accent)]/20'}`}>
            <span>🗑️</span> Trash
          </button>
          
          <button onClick={handleCreateFolder} disabled={isTrashView} className="px-3 py-1 bg-black/20 hover:bg-[var(--color-accent)]/20 border border-[#1E1B2E] rounded transition-colors flex items-center gap-2 disabled:opacity-50">
            <span>+</span> New Folder
          </button>
          
          <label className={`px-3 py-1 bg-black/20 hover:bg-[var(--color-accent)]/20 border border-[#1E1B2E] rounded transition-colors flex items-center gap-2 ${isTrashView ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span>&uarr;</span> Upload
            <input type="file" className="hidden" onChange={handleUploadFile} disabled={isTrashView} />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/30 border border-[#1E1B2E] rounded px-3 py-1 outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex border border-[#1E1B2E] rounded overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-2 py-1 ${viewMode === 'grid' ? 'bg-[var(--color-accent)]/50' : 'bg-black/20 hover:bg-[var(--color-accent)]/20'}`}>G</button>
            <button onClick={() => setViewMode('list')} className={`px-2 py-1 ${viewMode === 'list' ? 'bg-[var(--color-accent)]/50' : 'bg-black/20 hover:bg-[var(--color-accent)]/20'}`}>L</button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 p-2 border-b-[2px] border-[#1E1B2E] bg-black/10 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.id || 'root'} className="flex items-center gap-2">
            <button onClick={() => handleNavigateBreadcrumb(idx)} className="hover:text-[var(--color-accent)] transition-colors">
              {crumb.name}
            </button>
            {idx < breadcrumbs.length - 1 && <span className="text-[#A8A29E]">/</span>}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 overflow-auto p-4 transition-colors ${isDragging ? 'bg-[var(--color-accent)]/10 border-2 border-dashed border-[var(--color-accent)]' : 'bg-[var(--color-background)]'}`}
        onContextMenu={(e) => handleContextMenu(e, 'bg')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 text-white text-2xl px-6 py-3 rounded backdrop-blur-sm border border-[var(--color-accent)]">
              Drop files here
            </div>
          </div>
        )}
        
        {uploadProgress !== null && (
          <div className="absolute bottom-4 right-4 bg-black/80 border border-[#1E1B2E] p-4 rounded shadow-lg z-50 text-sm flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-[#1E1B2E] rounded overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
        {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-4">
            <img src="/icons/desktop-apps/inventory.png" alt="Empty" className="w-16 h-16 opacity-30 grayscale" style={{ imageRendering: 'pixelated' }} />
            <p className="text-lg">Folder is empty.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4' : 'flex flex-col gap-1'}>
            
            {/* Folders */}
            {filteredFolders.map(folder => (
              <div 
                key={folder.id}
                onDoubleClick={() => handleNavigate(folder.id, folder.name)}
                onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id, folder.name)}
                className={`group flex items-center p-2 rounded border-[2px] border-transparent hover:bg-black/20 cursor-pointer select-none
                  ${viewMode === 'grid' ? 'flex-col gap-2 text-center' : 'gap-3'}
                `}
              >
                <img src="/icons/desktop-apps/inventory.png" alt="Folder" className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'}`} style={{ imageRendering: 'pixelated' }} />
                
                {renamingId === folder.id ? (
                  <input 
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => finishRename('folder', folder.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') finishRename('folder', folder.id); if (e.key === 'Escape') setRenamingId(null); }}
                    className="bg-black/50 border border-[var(--color-accent)] rounded px-1 w-full text-center outline-none text-white text-sm"
                  />
                ) : (
                  <div className={`text-sm truncate ${viewMode === 'grid' ? 'w-full' : 'flex-1 text-left'}`}>
                    {folder.name}
                  </div>
                )}
                
                {viewMode === 'list' && <div className="text-xs text-[var(--color-text-muted)] w-24 text-right">Folder</div>}
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map(file => (
              <div 
                key={file.id}
                onContextMenu={(e) => handleContextMenu(e, 'file', file.id, file.name)}
                onDoubleClick={() => openFile(file)}
                className={`group flex items-center p-2 rounded border-[2px] border-transparent hover:bg-black/20 cursor-pointer select-none
                  ${viewMode === 'grid' ? 'flex-col gap-2 text-center' : 'gap-3'}
                `}
              >
                <img src="/icons/desktop-apps/journal.png" alt="File" className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'}`} style={{ imageRendering: 'pixelated' }} />
                
                {renamingId === file.id ? (
                  <input 
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => finishRename('file', file.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') finishRename('file', file.id); if (e.key === 'Escape') setRenamingId(null); }}
                    className="bg-black/50 border border-[var(--color-accent)] rounded px-1 w-full text-center outline-none text-white text-sm"
                  />
                ) : (
                  <div className={`text-sm truncate ${viewMode === 'grid' ? 'w-full' : 'flex-1 text-left'}`}>
                    {file.name}
                  </div>
                )}
                
                {viewMode === 'list' && (
                  <>
                    <div className="text-xs text-[var(--color-text-muted)] w-32 truncate">{file.type}</div>
                    <div className="text-xs text-[var(--color-text-muted)] w-24 text-right">{formatSize(file.size)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[9999] bg-[var(--color-surface)] border-[2px] border-[#1E1B2E] rounded shadow-xl py-1 flex flex-col min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {contextMenu.type === 'bg' && (
            <>
              <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={handleCreateFolder}>New Folder</button>
              <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
              <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => loadDirectory(currentFolderId)}>Refresh</button>
            </>
          )}

          {contextMenu.type === 'folder' && (
            <>
              <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => handleNavigate(contextMenu.id!, contextMenu.name!)}>Open</button>
              <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => startRename(contextMenu.id!, contextMenu.name!)}>Rename</button>
              <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
              <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('folder', contextMenu.id!)}>Delete</button>
            </>
          )}

          {contextMenu.type === 'file' && (
            <>
              {isTrashView ? (
                <>
                  <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => handleRestore(contextMenu.id!)}>Restore</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('file', contextMenu.id!)}>Delete Permanently</button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => openFile(files.find(f => f.id === contextMenu.id) as File)}>Open</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => startRename(contextMenu.id!, contextMenu.name!)}>Rename</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-[var(--color-accent)]/20" onClick={() => window.open(`${API_URL}/download/${contextMenu.id}`, '_blank')}>Download</button>
                  <div className="h-[2px] bg-[#1E1B2E] w-full my-1" />
                  <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('file', contextMenu.id!)}>Delete</button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
