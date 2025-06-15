export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      error,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from auth context if available
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors getting user ID
    }
    return undefined;
  }

  private logToConsole(entry: LogEntry) {
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.component}]: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage, entry.data, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.data);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.data);
        break;
    }
  }

  private addToBuffer(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(component: string, message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, component, message, data);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  info(component: string, message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, component, message, data);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  warn(component: string, message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, component, message, data);
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  error(component: string, message: string, error?: Error, data?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, component, message, data, error);
    this.logToConsole(entry);
    this.addToBuffer(entry);
    
    // Send critical errors to monitoring service if available
    this.reportCriticalError(entry);
  }

  private async reportCriticalError(entry: LogEntry) {
    try {
      // This could be extended to send to external monitoring services
      // For now, we'll just store it locally for potential upload
      const criticalLogs = JSON.parse(localStorage.getItem('critical-errors') || '[]');
      criticalLogs.push(entry);
      
      // Keep only last 50 critical errors
      if (criticalLogs.length > 50) {
        criticalLogs.splice(0, criticalLogs.length - 50);
      }
      
      localStorage.setItem('critical-errors', JSON.stringify(criticalLogs));
    } catch (err) {
      console.error('Failed to store critical error:', err);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
