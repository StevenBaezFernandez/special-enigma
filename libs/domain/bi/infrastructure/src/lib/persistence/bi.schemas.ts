import { EntitySchema } from '@mikro-orm/core';
import { BiReport } from '@virteex/domain-bi-domain';

export const BiReportSchema = new EntitySchema<BiReport>({
  class: BiReport,
  tableName: 'bi_report',
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
    data: { type: 'json' },
    generatedAt: { type: 'Date', onCreate: () => new Date() },
  },
});
