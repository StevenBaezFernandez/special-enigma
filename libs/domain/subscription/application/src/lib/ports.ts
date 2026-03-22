export interface EventBusPort {
  emitAsync(event: string, payload: any): Promise<any[]>;
}

export const EVENT_BUS_PORT = Symbol('EVENT_BUS_PORT');

export interface LoggerPort {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}

export const LOGGER_PORT = Symbol('LOGGER_PORT');
