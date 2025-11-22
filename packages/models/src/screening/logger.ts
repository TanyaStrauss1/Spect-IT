/**
 * Structured Logging for ScreeningEngine
 * Medical-grade audit trail with structured data
 */

export interface PredictionLogEntry {
  /** Unique log ID */
  id: string;
  /** Timestamp in ISO format */
  timestamp: string;
  /** Model ID */
  modelId: string;
  /** Model version */
  modelVersion: string;
  /** Backend used */
  backend: string;
  /** Input features (normalized, no PII) */
  inputFeatures: {
    length: number;
    min: number;
    max: number;
    mean: number;
    hasNaN: boolean;
    hasInfinity: boolean;
  };
  /** Output values */
  output: {
    [key: string]: number;
  };
  /** Runtime in milliseconds */
  runtime: number;
  /** Validation status */
  validation: {
    inputValid: boolean;
    outputValid: boolean;
    warnings: string[];
  };
  /** Device/user context (anonymized) */
  context?: {
    deviceType?: string;
    screenSize?: string;
    userAgent?: string;
  };
}

export interface AuditLog {
  /** Log entries */
  entries: PredictionLogEntry[];
  /** Total count */
  count: number;
  /** Date range */
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Logger class for structured logging
 */
export class ScreeningLogger {
  private logs: PredictionLogEntry[] = [];
  private maxLogs: number = 1000;
  private enableServerSync: boolean = false;
  private serverEndpoint?: string;

  /**
   * Log a prediction with full context
   */
  logPrediction(entry: Omit<PredictionLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: PredictionLogEntry = {
      ...entry,
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Sync to server if enabled
    if (this.enableServerSync && this.serverEndpoint) {
      this.syncToServer(logEntry).catch(err => {
        console.error('Failed to sync log to server:', err);
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ScreeningLogger]', logEntry);
    }
  }

  /**
   * Get audit log for export
   */
  getAuditLog(): AuditLog {
    if (this.logs.length === 0) {
      return {
        entries: [],
        count: 0,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      };
    }

    const timestamps = this.logs.map(l => l.timestamp);
    return {
      entries: [...this.logs],
      count: this.logs.length,
      dateRange: {
        start: timestamps[0],
        end: timestamps[timestamps.length - 1],
      },
    };
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.getAuditLog(), null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Enable server sync
   */
  enableSync(endpoint: string): void {
    this.enableServerSync = true;
    this.serverEndpoint = endpoint;
  }

  /**
   * Disable server sync
   */
  disableSync(): void {
    this.enableServerSync = false;
    this.serverEndpoint = undefined;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sync log entry to server
   */
  private async syncToServer(entry: PredictionLogEntry): Promise<void> {
    if (!this.serverEndpoint) return;

    try {
      await fetch(this.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently - logs are kept locally
      console.error('Server sync failed:', error);
    }
  }
}

// Singleton logger instance
let singletonLogger: ScreeningLogger | null = null;

export function getScreeningLogger(): ScreeningLogger {
  if (!singletonLogger) {
    singletonLogger = new ScreeningLogger();
  }
  return singletonLogger;
}

