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
  const { addNotification } = useNotificationStore();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/metrics');
      setMetrics(res);
    } catch (e) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to fetch metrics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return <div className="p-6 text-white/50">Loading health data...</div>;
  }

  if (!metrics) {
    return <div className="p-6 text-red-400">Failed to load health metrics.</div>;
  }

  const { services, memory, uptime } = metrics;

  return (
    <div className="p-6 text-white h-full overflow-auto bg-[#1A1825]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">System Health</h2>
        <button 
          onClick={fetchMetrics}
          className="px-3 py-1.5 bg-[#2A2438] hover:bg-[#352F44] rounded border border-white/10 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatusCard title="Database (PostgreSQL)" status={services.database} />
        <StatusCard title="Cache (Redis)" status={services.redis} />
        <StatusCard title="Storage (Local/MinIO)" status={services.storage} />
        <StatusCard title="Overall Status" status={services.status} />
      </div>

      <h3 className="text-xl font-bold mb-4 font-heading border-b border-white/10 pb-2">Performance Metrics</h3>
      
      <div className="bg-[#2A2438] border border-white/10 rounded-lg p-4">
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-1">Uptime</div>
          <div className="text-xl font-mono">{(uptime / 60 / 60).toFixed(2)} hours</div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-white/60 mb-2">Memory Usage</div>
          
          <MetricBar label="RSS" value={memory.rss} max={1024 * 1024 * 1024} />
          <MetricBar label="Heap Total" value={memory.heapTotal} max={512 * 1024 * 1024} />
          <MetricBar label="Heap Used" value={memory.heapUsed} max={512 * 1024 * 1024} />
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, status }: { title: string, status: string }) => {
  const isOk = status === 'connected' || status === 'ok';
  
  return (
    <div className="bg-[#2A2438] border border-white/10 rounded-lg p-4 flex items-center justify-between">
      <span className="font-medium text-white/90">{title}</span>
      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${isOk ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
        {status}
      </span>
    </div>
  );
};

const MetricBar = ({ label, value, max }: { label: string, value: number, max: number }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const mb = (value / 1024 / 1024).toFixed(1);
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/80">{label}</span>
        <span className="font-mono text-white/60">{mb} MB</span>
      </div>
      <div className="w-full h-2 bg-black/40 rounded overflow-hidden">
        <div 
          className="h-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
