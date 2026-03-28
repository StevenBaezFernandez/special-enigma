import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Admin/Security')
@Controller('admin/security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  @Get('audit-trail')
  @ApiOperation({ summary: 'Get signed lifecycle evidence' })
  async getAuditTrail() {
    const evidenceDir = path.join(process.cwd(), 'evidence/tenant-lifecycle');
    if (!fs.existsSync(evidenceDir)) return [];

    try {
        const files = fs.readdirSync(evidenceDir)
            .sort()
            .reverse()
            .slice(0, 50);

        return files.map(file => {
            const content = fs.readFileSync(path.join(evidenceDir, file), 'utf-8');
            return JSON.parse(content);
        });
    } catch (err) {
        this.logger.error('Failed to read audit trail', err);
        return [];
    }
  }
}
