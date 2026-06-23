import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as fsApi from '../../services/filesystem.api';
import { uploadFileAPI, deleteFileAPI, permanentDeleteFileAPI, restoreFileAPI } from '../../services/upload.api';
import { useEditorStore } from '../../store/editor.store';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useDialogStore } from '../../store/useDialogStore';
import { apiFetch, API_URL } from '../../services/api';
import { getFileIcon } from '../../utils/icons';

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
  const { openWindow } = useDesktopStore();
  const { confirm, prompt } = useDialogStore();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Home' }]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'folder' | 'file' | 'bg'; id?: string; name?: string } | null>(null);

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
    setBreadcrumbs([{ id: null, name: !isTrashView ? 'Trash' : 'Home' }]);
  };

  const handleCreateFolder = async () => {
    const name = await prompt('Create Folder', 'Enter a name for the new folder:', 'New Folder');
    if (name) {
      await fsApi.createFolder(name, currentFolderId || undefined);
      loadDirectory(currentFolderId);
    }
  };

  const handleCreateTextFile = async () => {
    const name = await prompt('New Text File', 'Enter a name for the new file:', 'document.txt');
    if (name) {
      const finalName = name.endsWith('.txt') || name.includes('.') ? name : `${name}.txt`;
      const blob = new window.Blob([''], { type: 'text/plain' });
      const file = new window.File([blob], finalName, { type: 'text/plain' });
      
      const res = await uploadFileAPI(file, currentFolderId || undefined);
      await loadDirectory(currentFolderId);
      
      if (res && res.id) {
        useEditorStore.getState().openFile(res.id, res.name || finalName);
      }
    }
  };

  const handleEmptyTrash = async () => {
    const confirmed = await confirm('Empty Trash', 'Are you sure you want to permanently delete ALL items in the trash?', 'Empty Trash');
    if (confirmed) {
      await Promise.all(files.map(f => permanentDeleteFileAPI(f.id)));
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
      const confirmed = await confirm('Permanent Delete', 'Are you sure you want to permanently delete this file? This action cannot be undone.', 'Delete Permanently');
      if (confirmed) {
        await permanentDeleteFileAPI(id);
        loadDirectory(currentFolderId);
      }
    } else {
      const confirmed = await confirm('Move to Trash', 'Are you sure you want to move this item to the trash?', 'Move to Trash');
      if (confirmed) {
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

  const startRename = async (id: string, name: string, type: 'folder' | 'file') => {
    closeContextMenu();
    const newName = await prompt('Rename Item', `Enter a new name for this ${type}:`, name);
    if (newName && newName.trim() && newName !== name) {
      if (type === 'folder') await fsApi.updateFolder(id, newName.trim());
      else await fsApi.updateFile(id, newName.trim());
      loadDirectory(currentFolderId);
    }
  };

  const openFile = (file: File) => {
    const isImage = file.type && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.type.toLowerCase()) || file.mimeType?.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
    const isAudio = file.type && ['mp3', 'wav', 'ogg'].includes(file.type.toLowerCase()) || file.mimeType?.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg)$/i);
    
    if (isImage) {
      openWindow(`imageviewer-${file.id}`, file.name, '/icons/desktop-apps/inventory.png', { fileId: file.id, name: file.name, isImage: true });
    } else if (isAudio) {
      openWindow(`radio`, 'Music & Radio', '/icons/desktop-apps/radio.png', { fileId: file.id, name: file.name, isLocal: true, url: `${API_URL}/download/${file.id}` });
    } else {
      const editorStore = useEditorStore.getState();
      editorStore.openFile(file.id, file.name);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/60 backdrop-blur-xl text-white font-content" onClick={closeContextMenu}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <button onClick={() => {
            if (breadcrumbs.length > 1) handleNavigateBreadcrumb(breadcrumbs.length - 2);
          }} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50" disabled={breadcrumbs.length <= 1}>
            &larr; Back
          </button>
          
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          
          <button onClick={toggleTrashView} className={`px-3 py-1.5 border border-white/10 rounded-lg transition-colors flex items-center gap-2 ${isTrashView ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
            <span>🗑️</span> Trash
          </button>
          
          <button onClick={handleCreateFolder} disabled={isTrashView} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
            <span>+</span> New Folder
          </button>
          
          <button onClick={handleCreateTextFile} disabled={isTrashView} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
            <span>📝</span> New File
          </button>
          
          <label className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 ${isTrashView ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span>&uarr;</span> Upload
            <input type="file" className="hidden" onChange={handleUploadFile} disabled={isTrashView} />
          </label>

          {isTrashView && files.length > 0 && (
            <button onClick={handleEmptyTrash} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors flex items-center gap-2">
              <span>⚠️</span> Empty Trash
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-white/30 text-sm placeholder-white/40"
          />
          <div className="flex border border-white/10 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>G</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 border-l border-white/10 ${viewMode === 'list' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>L</button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-black/20 text-sm backdrop-blur-md">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.id || 'root'} className="flex items-center gap-2">
            <button onClick={() => handleNavigateBreadcrumb(idx)} className="hover:text-[var(--color-accent)] transition-colors">
              {crumb.name}
            </button>
            {idx < breadcrumbs.length - 1 && <span className="text-[var(--color-accent)]">&gt;</span>}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 overflow-auto p-4 transition-colors ${isDragging ? 'bg-[var(--color-accent)]/20 border-2 border-dashed border-[var(--color-accent)]' : 'bg-transparent'}`}
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
            <img src="/icons/files/folder.png" alt="Empty" className="w-16 h-16 opacity-30 grayscale" style={{ imageRendering: 'pixelated' }} />
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
                className={`group flex items-center p-2 rounded-xl border border-transparent hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer select-none
                  ${viewMode === 'grid' ? 'flex-col gap-2 text-center' : 'gap-3'}
                `}
              >
                <img src="/icons/files/folder.png" alt="Folder" className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'}`} style={{ imageRendering: 'pixelated' }} />
                
                <div className={`text-sm truncate ${viewMode === 'grid' ? 'w-full' : 'flex-1 text-left'}`}>
                  {folder.name}
                </div>
                
                {viewMode === 'list' && <div className="text-xs text-[var(--color-text-muted)] w-24 text-right">Folder</div>}
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map(file => (
              <div 
                key={file.id}
                onContextMenu={(e) => handleContextMenu(e, 'file', file.id, file.name)}
                onDoubleClick={() => openFile(file)}
                className={`group flex items-center p-2 rounded-xl border border-transparent hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer select-none
                  ${viewMode === 'grid' ? 'flex-col gap-2 text-center' : 'gap-3'}
                `}
              >
                <img src={getFileIcon(file.name, file.mimeType)} alt="File" className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'}`} style={{ imageRendering: 'pixelated' }} />
                
                <div className={`text-sm truncate ${viewMode === 'grid' ? 'w-full' : 'flex-1 text-left'}`}>
                  {file.name}
                </div>
                
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
      {contextMenu && createPortal(
        <div 
          className="fixed z-[9999] bg-[#1a1b26]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 flex flex-col min-w-[160px] overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {contextMenu.type === 'bg' && (
            <>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={handleCreateFolder}>New Folder</button>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={handleCreateTextFile}>New Text File</button>
              <div className="h-[1px] bg-white/10 w-full my-1" />
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => loadDirectory(currentFolderId)}>Refresh</button>
            </>
          )}

          {contextMenu.type === 'folder' && (
            <>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => handleNavigate(contextMenu.id!, contextMenu.name!)}>Open</button>
              <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => startRename(contextMenu.id!, contextMenu.name!, 'folder')}>Rename</button>
              <div className="h-[1px] bg-white/10 w-full my-1" />
              <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('folder', contextMenu.id!)}>Delete</button>
            </>
          )}

          {contextMenu.type === 'file' && (
            <>
              {isTrashView ? (
                <>
                  <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => handleRestore(contextMenu.id!)}>Restore</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('file', contextMenu.id!)}>Delete Permanently</button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => openFile(files.find(f => f.id === contextMenu.id) as File)}>Open</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => startRename(contextMenu.id!, contextMenu.name!, 'file')}>Rename</button>
                  <button className="px-4 py-2 text-left text-sm hover:bg-white/10" onClick={() => window.open(`${API_URL}/download/${contextMenu.id}`, '_blank')}>Download</button>
                  <div className="h-[1px] bg-white/10 w-full my-1" />
                  <button className="px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400" onClick={() => handleDelete('file', contextMenu.id!)}>Delete</button>
                </>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
