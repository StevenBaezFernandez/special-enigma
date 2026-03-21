import { Injectable, Logger, InternalServerErrorException, RequestTimeoutException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TelemetryService } from '@virteex/kernel-telemetry';

// Circuit Breaker State
enum CircuitState { CLOSED, OPEN, HALF_OPEN }

@Injectable()
export class ResilientHttpClient {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(ResilientHttpClient.name);
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 30000; // 30s

  constructor(private readonly telemetry: TelemetryService) {
    this.client = axios.create({ timeout: 5000 });
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    if (this.circuitState === CircuitState.OPEN) {
       throw new InternalServerErrorException('Circuit Breaker is OPEN. Target service unreachable.');
    }

    try {
      const response = await this.client.request<T>(config);
      this.resetCircuit();
      return response.data;
    } catch (error: any) {
      this.handleFailure();
      this.logger.error(`HTTP Request failed: ${error.message}`);
      throw error.code === 'ECONNABORTED'
        ? new RequestTimeoutException('Service timeout')
        : new InternalServerErrorException(`BFF Proxy error: ${error.message}`);
    }
  }

  private resetCircuit() {
    this.failureCount = 0;
    this.circuitState = CircuitState.CLOSED;
  }

  private handleFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.circuitState = CircuitState.OPEN;
      this.logger.warn('Circuit Breaker transition to OPEN state');
      setTimeout(() => {
        this.circuitState = CircuitState.HALF_OPEN;
        this.logger.log('Circuit Breaker transition to HALF_OPEN state');
      }, this.resetTimeout);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }
}
