type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage("info", message), data || "");
    // In production, this would send to Sentry or LogRocket
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage("warn", message), data || "");
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage("error", message), error || "");
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message), data || "");
    }
  }

  // Performance tracking
  time(label: string) {
    if (this.isDevelopment) console.time(label);
  }

  timeEnd(label: string) {
    if (this.isDevelopment) console.timeEnd(label);
  }
}

export const logger = new Logger();
