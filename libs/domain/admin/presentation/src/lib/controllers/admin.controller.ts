import { Controller, Post, UseInterceptors, UploadedFile, Body, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DataImportService } from '@virteex/domain-admin-application';
import { Express } from 'express';
import 'multer';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly dataImportService: DataImportService
  ) {}

  @Post('import')
  @ApiOperation({ summary: 'Import Data from CSV/Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        dataType: {
          type: 'string',
          enum: ['customers', 'products', 'suppliers'],
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File, @Body('dataType') dataType: string) {
    this.logger.log(`Received file import request for ${dataType}`);
    if (!file) {
        throw new Error('File is required');
    }

    const result = await this.dataImportService.processFile(file.buffer, dataType);
    return {
        message: 'File processed successfully',
        ...result
    };
  }
}
