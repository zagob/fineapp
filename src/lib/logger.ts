type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Métodos específicos para actions
  actionStart(action: string, context?: LogContext): void {
    this.info(`Action started: ${action}`, { ...context, action });
  }

  actionSuccess(action: string, context?: LogContext): void {
    this.info(`Action completed: ${action}`, { ...context, action, status: 'success' });
  }

  actionError(action: string, error: Error, context?: LogContext): void {
    this.error(`Action failed: ${action}`, error, { ...context, action, status: 'error' });
  }

  // Métodos para operações de banco
  dbQuery(operation: string, table: string, context?: LogContext): void {
    this.debug(`DB Query: ${operation} on ${table}`, { ...context, operation, table });
  }

  dbQuerySuccess(operation: string, table: string, duration: number, context?: LogContext): void {
    this.debug(`DB Query completed: ${operation} on ${table}`, { 
      ...context, 
      operation, 
      table, 
      durationMs: duration 
    });
  }

  dbQueryError(operation: string, table: string, error: Error, context?: LogContext): void {
    this.error(`DB Query failed: ${operation} on ${table}`, error, { 
      ...context, 
      operation, 
      table 
    });
  }
}

export const logger = new Logger(); 