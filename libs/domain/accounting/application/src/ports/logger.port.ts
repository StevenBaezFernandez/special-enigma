export interface LoggerPort {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export class DefaultLogger implements LoggerPort {
  debug(message: string, ...args: unknown[]) { console.debug(`[Accounting] DEBUG: ${message}`, ...args); }
  info(message: string, ...args: unknown[]) { console.info(`[Accounting] INFO: ${message}`, ...args); }
  warn(message: string, ...args: unknown[]) { console.warn(`[Accounting] WARN: ${message}`, ...args); }
  error(message: string, ...args: unknown[]) { console.error(`[Accounting] ERROR: ${message}`, ...args); }
}
