/**
 * PrintFlow High-Performance Analytics (Marketplace 2.0).
 * Tracking Core Web Vitals and Custom Interaction Latency.
 */
export const PerformanceAnalytics = {
  logInteraction: (name: string, duration: number) => {
    // In production, send to BigQuery or Mixpanel
    console.debug(`[PIE-Performance] ${name}: ${duration.toFixed(2)}ms`);

    // Adaptive Logic: Store sluggish events to localStorage for diagnostic reports
    if (duration > 300) {
      const slowEvents = JSON.parse(localStorage.getItem("PF_SLOW_EVENTS") || "[]");
      slowEvents.push({ name, duration, timestamp: new Date().toISOString() });
      localStorage.setItem("PF_SLOW_EVENTS", JSON.stringify(slowEvents.slice(-10)));
    }
  },

  trackMount: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      PerformanceAnalytics.logInteraction(`${componentName}_Mount`, end - start);
    };
  },

  getReport: () => {
    return JSON.parse(localStorage.getItem("PF_SLOW_EVENTS") || "[]");
  },

  clearReport: () => {
    localStorage.removeItem("PF_SLOW_EVENTS");
  }
};
