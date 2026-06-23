import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { useNotificationStore } from '../../store/notification.store';

interface HealthData {
  service: string;
  status: string;
  database: string;
  redis: string;
  storage: string;
  timestamp: string;
}

interface MetricsData {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  services: HealthData;
}

export const HealthDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { addNotification } = useNotificationStore();

  const fetchMetrics = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setSyncing(true);
      
      const res = await apiFetch('/metrics');
      setMetrics(res);
    } catch (e) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to fetch metrics' });
    } finally {
      if (!isBackground) setLoading(false);
      else setSyncing(false);
    }
  };

  useEffect(() => {
    fetchMetrics(false);
    const interval = setInterval(() => fetchMetrics(true), 5000); // seamless refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col h-full bg-black/60 backdrop-blur-xl text-white p-6 justify-center items-center font-sans">
        <div className="animate-spin text-4xl mb-4 opacity-50">⚙️</div>
        <div className="text-[#A8A29E] animate-pulse font-medium">Analyzing System Health...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col h-full bg-black/60 backdrop-blur-xl text-white p-6 justify-center items-center font-sans">
        <span className="text-4xl mb-4">⚠️</span>
        <div className="text-red-400 font-medium">Failed to load health metrics.</div>
        <button onClick={() => fetchMetrics(false)} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Retry</button>
      </div>
    );
  }

  const { services, memory, uptime } = metrics;

  return (
    <div className="flex flex-col h-full bg-black/60 backdrop-blur-xl text-white p-6 font-sans overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-heading text-white drop-shadow-md flex items-center gap-2">
          <span className="text-3xl">🫀</span> System Health
        </h2>
        <div className="flex items-center gap-3">
          {syncing && <span className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-widest animate-pulse">Syncing...</span>}
          <button 
            onClick={() => fetchMetrics(false)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-sm font-medium flex items-center gap-2"
            disabled={syncing || loading}
          >
            <span className={syncing || loading ? "animate-spin" : ""}>🔄</span> Refresh
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E] mb-4 ml-1">Services Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatusCard title="Database" subtitle="PostgreSQL" status={services.database} icon="🗄️" />
        <StatusCard title="Cache" subtitle="Redis" status={services.redis} icon="⚡" />
        <StatusCard title="Storage" subtitle="Local/MinIO" status={services.storage} icon="💾" />
        <StatusCard title="Overall System" subtitle="Global Check" status={services.status} icon="🌐" />
      </div>

      <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E] mb-4 ml-1">Performance Metrics</h3>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
        <div className="flex items-end gap-4 mb-6 pb-6 border-b border-white/5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-1">Server Uptime</div>
            <div className="text-3xl font-mono text-white flex items-baseline gap-1">
              {(uptime / 60 / 60).toFixed(2)} <span className="text-sm text-white/50">hours</span>
            </div>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mx-4"></div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-1">Last Sync</div>
            <div className="text-lg font-mono text-white/80">{new Date(services.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A8A29E] mb-2">Memory Allocation</div>
          <MetricBar label="Resident Set Size (RSS)" value={memory.rss} max={1024 * 1024 * 1024} color="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <MetricBar label="Heap Total" value={memory.heapTotal} max={512 * 1024 * 1024} color="bg-[var(--color-accent)] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <MetricBar label="Heap Used" value={memory.heapUsed} max={512 * 1024 * 1024} color="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, subtitle, status, icon }: { title: string, subtitle: string, status: string, icon: string }) => {
  const isOk = status === 'connected' || status === 'ok';
  
  return (
    <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex items-center justify-between transition-colors shadow-md group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isOk ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-white/90 text-lg leading-tight">{title}</div>
          <div className="text-xs text-[#A8A29E]">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOk ? 'text-green-400' : 'text-red-400'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const mb = (value / 1024 / 1024).toFixed(1);
  const maxMb = (max / 1024 / 1024).toFixed(0);
  
  return (
    <div className="group">
      <div className="flex justify-between text-xs mb-1.5 items-end">
        <span className="text-white/80 font-medium">{label}</span>
        <span className="font-mono text-white/90">{mb} <span className="text-[#A8A29E]">/ {maxMb} MB</span></span>
      </div>
      <div className="w-full h-2.5 bg-black/50 rounded-full border border-white/5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-in-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
