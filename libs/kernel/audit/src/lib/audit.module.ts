import { Module, Global, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { DataAuditLog } from './entities/data-audit-log.entity';
import { DataAuditSubscriber } from './subscribers/data-audit.subscriber';
import { AuditLedgerService } from '@virteex/platform-audit';
import { AuditLedger } from '@virteex/platform-audit';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([DataAuditLog, AuditLedger]),
  ],
  providers: [
    DataAuditSubscriber,
    AuditLedgerService,
  ],
  exports: [
    MikroOrmModule,
    DataAuditSubscriber,
    AuditLedgerService,
  ],
})
export class AuditModule implements OnModuleInit {
  constructor(
    private readonly em: EntityManager,
    private readonly subscriber: DataAuditSubscriber
  ) {}

  onModuleInit() {
    this.em.getEventManager().registerSubscriber(this.subscriber);
  }
}
