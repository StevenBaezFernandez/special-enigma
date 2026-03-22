import { Injectable, Logger } from '@nestjs/common';
import { JobProcessorService } from '@virteex/domain-scheduler-application';

export interface ServiceStatusDto {
  service: string;
  status: 'ok' | 'degraded';
  timestamp: string;
  workerActive: boolean;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly jobProcessor: JobProcessorService) {}

  getData(): ServiceStatusDto {
    const isWorkerActive = !!this.jobProcessor;

    if (!isWorkerActive) {
      this.logger.error('JobProcessorService is NOT active in Scheduler worker.');
    }

    return {
      service: 'virteex-scheduler-service',
      status: isWorkerActive ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      workerActive: isWorkerActive,
    };
  }
}
