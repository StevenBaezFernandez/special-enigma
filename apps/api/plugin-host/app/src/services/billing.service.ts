import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { MeteringRecord } from '@virteex/domain-catalog-domain';

export interface BillingReport {
    tenantId: string;
    plugins: {
        pluginId: string;
        invocations: number;
        totalComputeTimeMs: number;
        avgMemoryBytes: number;
        totalEgressCount: number;
        failureRate: number;
    }[];
    generatedAt: Date;
}

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(private readonly em: EntityManager) {}

    async generateReconciliationReport(tenantId: string, startDate: Date, endDate: Date): Promise<BillingReport> {
        this.logger.log(`Generating billing reconciliation report for tenant ${tenantId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        const records = await this.em.find(MeteringRecord, {
            tenantId,
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const pluginGroups = new Map<string, MeteringRecord[]>();
        records.forEach(r => {
            const group = pluginGroups.get(r.pluginId) || [];
            group.push(r);
            pluginGroups.set(r.pluginId, group);
        });

        const report: BillingReport = {
            tenantId,
            plugins: [],
            generatedAt: new Date()
        };

        for (const [pluginId, groupRecords] of pluginGroups.entries()) {
            const totalComputeTimeMs = groupRecords.reduce((sum, r) => sum + r.executionTimeMs, 0);
            const totalMemory = groupRecords.reduce((sum, r) => sum + r.memoryBytes, 0);
            const totalEgress = groupRecords.reduce((sum, r) => sum + r.egressCount, 0);
            const failures = groupRecords.filter(r => r.status === 'failure').length;

            report.plugins.push({
                pluginId,
                invocations: groupRecords.length,
                totalComputeTimeMs,
                avgMemoryBytes: Math.round(totalMemory / groupRecords.length),
                totalEgressCount: totalEgress,
                failureRate: failures / groupRecords.length
            });
        }

        return report;
    }
}
