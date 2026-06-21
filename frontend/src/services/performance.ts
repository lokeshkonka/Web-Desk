export const performanceMonitor = {
  marks: {} as Record<string, number>,
  
  mark: (name: string) => {
    performanceMonitor.marks[name] = performance.now();
  },
  
  measure: (name: string, startMark: string) => {
    if (!performanceMonitor.marks[startMark]) return;
    const duration = performance.now() - performanceMonitor.marks[startMark];
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    // Optional: send to backend metrics API
  },

  trackApiLatency: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      console.log(`[Performance] API ${name}: ${duration.toFixed(2)}ms`);
    }
  }
};

// Initialize boot time tracking
performanceMonitor.mark('boot_start');
window.addEventListener('load', () => {
  performanceMonitor.measure('Startup time (load)', 'boot_start');
});
