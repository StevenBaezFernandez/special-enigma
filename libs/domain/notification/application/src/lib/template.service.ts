import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { NotificationTemplate, TemplateVersion } from '../domain/entities/template.entity';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private readonly em: EntityManager) {}

  async render(templateName: string, version: string, variables: Record<string, any>): Promise<string> {
    const template = await this.em.findOne(TemplateVersion, {
      template: { name: templateName },
      version: version
    }, { populate: ['template'] as any });

    if (!template) {
      throw new Error(`Template ${templateName} version ${version} not found`);
    }

    return this.applyVariables(template.content, variables);
  }

  private applyVariables(content: string, variables: Record<string, any>): string {
    return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      if (key in variables) {
        return variables[key];
      }
      this.logger.warn(`Missing variable ${key} in template`);
      return match; // Level 5: Should probably fail terminal if placeholders are mandatory
    });
  }

  async createVersion(templateId: string, content: string, version: string): Promise<TemplateVersion> {
    const template = await this.em.findOne(NotificationTemplate, { id: templateId });
    if (!template) throw new Error('Template not found');

    const newVersion = new TemplateVersion();
    newVersion.template = template;
    newVersion.content = content;
    newVersion.version = version;

    this.em.persist(newVersion);
    await this.em.flush();
    return newVersion;
  }
}
