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
    <div className="flex flex-col h-full bg-black/60 backdrop-blur-xl text-white p-6 font-sans overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-heading text-white drop-shadow-md flex items-center gap-2">
          <span className="text-3xl">📦</span> Containers
        </h2>
        <div className="text-sm text-[#A8A29E] bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {containers.length} {containers.length === 1 ? 'Container' : 'Containers'}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex-1">
          <label className="text-xs text-[#A8A29E] mb-1 block ml-1">Container Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. my-app-db" 
            className="w-full bg-black/40 px-4 py-2.5 rounded-lg border border-white/10 outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all placeholder-[#A8A29E]/50 text-sm"
          />
        </div>
        <div className="sm:w-1/3">
          <label className="text-xs text-[#A8A29E] mb-1 block ml-1">Base Image</label>
          <select 
            value={image} 
            onChange={e => setImage(e.target.value)}
            className="w-full bg-black/40 px-4 py-2.5 rounded-lg border border-white/10 outline-none focus:border-[var(--color-accent)] transition-all text-sm appearance-none"
          >
            {DEFAULT_IMAGES.map(img => <option key={img} value={img}>{img}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleCreate} 
            disabled={loading || !name}
            className="bg-[var(--color-accent)] hover:bg-[#D97706] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:shadow-none h-[42px] flex items-center justify-center min-w-[100px]"
          >
            {loading ? (
              <span className="animate-pulse">Deploying...</span>
            ) : (
              'Deploy'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {containers.map(c => (
          <div key={c.id} className="bg-white/5 rounded-xl p-5 border border-white/10 shadow-lg flex flex-col gap-4 hover:bg-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${c.status === 'running' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse' : 'bg-gray-500'}`} />
                <div>
                  <h3 className="font-bold text-lg leading-tight text-white">{c.name}</h3>
                  <div className="text-xs text-[#A8A29E] mt-1 flex gap-2 items-center">
                    <span className="bg-black/30 px-2 py-0.5 rounded font-mono text-[10px] border border-white/5">{c.image}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{c.containerId.substring(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${c.status === 'running' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                  {c.status}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/5">
              {c.status !== 'running' && (
                <button onClick={() => handleAction(c.id, 'start')} className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-md text-xs font-medium transition-colors flex-1 text-center">Start</button>
              )}
              {c.status === 'running' && (
                <button onClick={() => handleAction(c.id, 'stop')} className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-md text-xs font-medium transition-colors flex-1 text-center">Stop</button>
              )}
              {c.status === 'running' && (
                <button onClick={() => handleOpenTerminal(c.containerId)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-xs font-medium transition-colors flex-1 text-center">Terminal</button>
              )}
              <button onClick={() => handleViewLogs(c.id)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md text-xs font-medium transition-colors flex-1 text-center">Logs</button>
              <button onClick={() => handleAction(c.id, 'remove')} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs font-medium transition-colors shrink-0">Delete</button>
            </div>
            
            {logs[c.id] !== undefined && (
              <div className="bg-black/80 p-3 rounded-lg text-xs font-mono text-[#E0E0E0] max-h-48 overflow-y-auto whitespace-pre-wrap border border-white/5 mt-2 custom-scrollbar relative">
                <div className="sticky top-0 right-0 flex justify-end mb-1">
                  <button onClick={() => handleViewLogs(c.id)} className="text-[#A8A29E] hover:text-white bg-black/50 rounded px-1.5 py-0.5 text-[10px]">Close</button>
                </div>
                {logs[c.id] || 'No logs available.'}
              </div>
            )}
          </div>
        ))}
        {containers.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center text-center text-[#A8A29E] py-16 bg-white/5 rounded-xl border border-white/5 border-dashed">
            <span className="text-4xl mb-3 opacity-50">🛳️</span>
            <p className="text-lg font-medium text-white mb-1">No containers running</p>
            <p className="text-sm">Deploy your first container using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
