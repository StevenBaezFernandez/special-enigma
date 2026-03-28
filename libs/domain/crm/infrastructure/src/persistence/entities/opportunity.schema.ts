import { EntitySchema } from '@mikro-orm/core';
import { Opportunity } from '@virteex/domain-crm-domain';
import { OpportunityStage } from '@virteex/shared-contracts';

export const OpportunitySchema = new EntitySchema<Opportunity>({
  class: Opportunity,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    title: { type: 'string' },
    amount: { type: 'number', nullable: true },
    stage: { enum: true, items: () => OpportunityStage, default: OpportunityStage.PROSPECTING },
    closeDate: { type: 'Date', nullable: true },
    customer: { kind: 'm:1', entity: 'Customer', inversedBy: 'opportunities' },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});
