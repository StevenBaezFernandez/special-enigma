import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuditLedger } from './lib/entities/audit-ledger.entity';
import { AuditLedgerService } from './lib/audit-ledger.service';

@Module({
  imports: [MikroOrmModule.forFeature([AuditLedger])],
  providers: [AuditLedgerService],
  exports: [AuditLedgerService],
})
export class AuditModule {}
