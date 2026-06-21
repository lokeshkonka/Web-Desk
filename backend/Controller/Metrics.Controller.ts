import { checkHealth } from "../Services/Health.Service";

export const metricsController = async () => {
  const health = await checkHealth();
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    uptime,
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    services: health
  };
};
