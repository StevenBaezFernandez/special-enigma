import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateProjectUseCase, CreateProjectDto } from '@virteex/domain-projects-application';
import { GetProjectsUseCase } from '@virteex/domain-projects-application';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectsUseCase: GetProjectsUseCase
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', domain: 'Projects' };
  }

  @Post()
  @ApiOperation({ summary: 'Create Project' })
  create(@Body() dto: CreateProjectDto) {
    return this.createProjectUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List Projects' })
  findAll() {
    return this.getProjectsUseCase.execute();
  }
}
