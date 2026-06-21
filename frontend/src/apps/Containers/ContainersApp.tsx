import { useEffect, useState } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';
import * as containerApi from '../../services/container.api';

interface Container {
  id: string;
  containerId: string;
  name: string;
  image: string;
  status: string;
  createdAt: string;
}

const DEFAULT_IMAGES = ['node:22', 'python:3.12', 'golang:1.24', 'ubuntu:latest'];

export const ContainersApp = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{ [key: string]: string }>({});

  const { openWindow } = useDesktopStore();

  const loadContainers = async () => {
    try {
      const data = await containerApi.fetchContainers();
      setContainers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadContainers();
    const interval = setInterval(loadContainers, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    try {
      await containerApi.createContainer(name, image);
      setName('');
      loadContainers();
    } catch (e) {
      alert("Failed to create container");
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'start' | 'stop' | 'remove') => {
    try {
      if (action === 'start') await containerApi.startContainer(id);
      if (action === 'stop') await containerApi.stopContainer(id);
      if (action === 'remove') await containerApi.removeContainer(id);
      loadContainers();
    } catch (e) {
      alert(`Failed to ${action} container`);
    }
  };

  const handleOpenTerminal = (containerId: string) => {
    // We pass containerId as a query param or part of the metadata which useDesktopStore passes to the component
    // But currently, the Terminal component doesn't read query params from initialData.
    // Let's pass it via AppMetadata or window config.
    openWindow('terminal', `Terminal: ${containerId.substring(0,8)}`, '/icons/desktop-apps/terminal.png', { containerId });
  };

  const handleViewLogs = async (id: string) => {
    if (logs[id]) {
      setLogs(prev => { const n = {...prev}; delete n[id]; return n; });
    } else {
      const data = await containerApi.fetchContainerLogs(id);
      setLogs(prev => ({ ...prev, [id]: data.logs }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1B2E] text-white p-4 font-sans overflow-auto">
      <h2 className="text-xl font-bold mb-4">Containers</h2>
      
      <div className="flex gap-2 mb-6 bg-black/20 p-4 rounded border border-white/10">
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Container Name" 
          className="bg-black/40 px-3 py-1.5 rounded border border-white/10 outline-none flex-1"
        />
        <select 
          value={image} 
          onChange={e => setImage(e.target.value)}
          className="bg-black/40 px-3 py-1.5 rounded border border-white/10 outline-none"
        >
          {DEFAULT_IMAGES.map(img => <option key={img} value={img}>{img}</option>)}
        </select>
        <button 
          onClick={handleCreate} 
          disabled={loading || !name}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-1.5 rounded font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {containers.map(c => (
          <div key={c.id} className="bg-[#2D2D2D] rounded p-4 border border-white/5 flex flex-col gap-3 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{c.name}</h3>
                <div className="text-xs text-gray-400 flex gap-2">
                  <span>Image: {c.image}</span>
                  <span>•</span>
                  <span>ID: {c.containerId.substring(0, 8)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {c.status.toUpperCase()}
                </span>
                
                <div className="flex gap-1 ml-4">
                  {c.status !== 'running' && (
                    <button onClick={() => handleAction(c.id, 'start')} className="px-3 py-1 bg-green-600/80 hover:bg-green-500 rounded text-xs">Start</button>
                  )}
                  {c.status === 'running' && (
                    <button onClick={() => handleAction(c.id, 'stop')} className="px-3 py-1 bg-red-600/80 hover:bg-red-500 rounded text-xs">Stop</button>
                  )}
                  {c.status === 'running' && (
                    <button onClick={() => handleOpenTerminal(c.containerId)} className="px-3 py-1 bg-[#4F46E5]/80 hover:bg-[#4F46E5] rounded text-xs">Terminal</button>
                  )}
                  <button onClick={() => handleViewLogs(c.id)} className="px-3 py-1 bg-gray-600/80 hover:bg-gray-500 rounded text-xs">Logs</button>
                  <button onClick={() => handleAction(c.id, 'remove')} className="px-3 py-1 bg-red-900/80 hover:bg-red-800 rounded text-xs ml-2">Delete</button>
                </div>
              </div>
            </div>
            
            {logs[c.id] !== undefined && (
              <div className="bg-black/60 p-3 rounded text-xs font-mono text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {logs[c.id] || 'No logs available.'}
              </div>
            )}
          </div>
        ))}
        {containers.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-10">No containers running.</div>
        )}
      </div>
    </div>
  );
};
