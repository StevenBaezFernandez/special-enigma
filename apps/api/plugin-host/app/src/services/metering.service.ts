import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { MeteringRecord } from '@virteex/domain-catalog-domain';
import * as crypto from 'crypto';

@Injectable()
export class MeteringService {
    private readonly logger = new Logger(MeteringService.name);

    constructor(private readonly em: EntityManager) {}

    async recordExecution(data: {
        tenantId: string;
        pluginId: string;
        version: string;
        executionTimeMs: number;
        memoryBytes: number;
        egressCount: number;
        success: boolean;
    }): Promise<string> {
        const record = new MeteringRecord();
        record.id = crypto.randomUUID();
        record.tenantId = data.tenantId;
        record.pluginId = data.pluginId;
        record.pluginVersion = data.version;
        record.executionTimeMs = data.executionTimeMs;
        record.memoryBytes = data.memoryBytes;
        record.egressCount = data.egressCount;
        record.status = data.success ? 'success' : 'failure';

        this.em.persist(record);
        await this.em.flush();

        return record.id;
    }
}
