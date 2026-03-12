import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuditLedger } from './entities/audit-ledger.entity';
import { AuditLedgerService } from './audit-ledger.service';

@Module({
  imports: [MikroOrmModule.forFeature([AuditLedger])],
  providers: [AuditLedgerService],
  exports: [AuditLedgerService],
})
export class AuditModule {}
