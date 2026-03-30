export interface LoggerPort {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export class DefaultLogger implements LoggerPort {
  debug(message: string, ...args: any[]) { console.debug(`[Accounting] DEBUG: ${message}`, ...args); }
  info(message: string, ...args: any[]) { console.info(`[Accounting] INFO: ${message}`, ...args); }
  warn(message: string, ...args: any[]) { console.warn(`[Accounting] WARN: ${message}`, ...args); }
  error(message: string, ...args: any[]) { console.error(`[Accounting] ERROR: ${message}`, ...args); }
}
