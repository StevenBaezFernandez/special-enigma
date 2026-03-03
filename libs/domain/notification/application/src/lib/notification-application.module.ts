import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { ComplianceService } from './compliance.service';
import { NotificationOrchestrator } from './notification-orchestrator';
import { NotificationService } from './notification.service';
import { NotificationInfrastructureModule } from '@virteex/domain-notification-infrastructure';

@Module({
  imports: [NotificationInfrastructureModule],
  providers: [TemplateService, ComplianceService, NotificationOrchestrator, NotificationService],
  exports: [NotificationService],
})
export class NotificationApplicationModule {}
