import { useEffect, useRef } from "react";
import { logger } from "@/utils/logger";

export const usePerformanceTracking = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    logger.debug(`${componentName} initial render took ${duration.toFixed(2)}ms`);

    return () => {
      logger.debug(`${componentName} unmounted`);
    };
  }, [componentName]);
};
