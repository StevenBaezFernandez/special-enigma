import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TaxCalculatorService } from './services/tax-calculator.service';
import { TaxRuleEngine } from './services/tax-rule.engine';
import { FiscalStampingService } from './services/fiscal-stamping.service';
import { TaxRule } from './entities/tax-rule.entity';
import { Invoice } from './entities/invoice.entity';
import { TaxLine } from './entities/tax-line.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Invoice, TaxLine, TaxRule])
  ],
  providers: [
    TaxCalculatorService,
    TaxRuleEngine,
    FiscalStampingService
  ],
  exports: [
    TaxCalculatorService,
    TaxRuleEngine,
    FiscalStampingService,
    MikroOrmModule
  ]
})
export class BillingDomainModule {}
