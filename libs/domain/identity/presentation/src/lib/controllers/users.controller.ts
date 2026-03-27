import { Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUserProfileUseCase, UpdateUserProfileUseCase, InviteUserUseCase, UploadAvatarUseCase, GetJobTitlesUseCase, GetAuditLogsUseCase } from '@virteex/domain-identity-application';
import { UpdateUserDto, InviteUserDto } from '@virteex/domain-identity-contracts';
import { JwtAuthGuard, CurrentUser, StepUp, StepUpGuard } from '@virteex/kernel-auth';
import { UserMapper } from '../mappers/user.mapper';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { UserResponseDto, AuditLogDto } from '@virteex/domain-identity-contracts';

@Controller('users')
@UseGuards(JwtAuthGuard, StepUpGuard)
export class UsersController {
  constructor(
    private readonly getProfile: GetUserProfileUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
    private readonly inviteUser: InviteUserUseCase,
    private readonly uploadAvatar: UploadAvatarUseCase,
    private readonly getJobTitlesUseCase: GetJobTitlesUseCase,
    private readonly getAuditLogsUseCase: GetAuditLogsUseCase
  ) {}

  @Get('job-titles')
  async getJobTitles(): Promise<string[]> {
    const titles = await this.getJobTitlesUseCase.execute();
    return titles.map(t => t.title);
  }

  @Get('profile')
  async getMyProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    const userId = user?.sub;
    const userEntity = await this.getProfile.execute(userId);
    return UserMapper.toDto(userEntity);
  }

  @Get('audit-logs')
  async getMyAuditLogs(@CurrentUser() user: any): Promise<AuditLogDto[]> {
    const userId = user?.sub;
    const logs = await this.getAuditLogsUseCase.execute(userId);
    return AuditLogMapper.toDtoList(logs);
  }

  @Patch('profile')
  async updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    const userId = user?.sub;
    const userEntity = await this.updateProfile.execute(userId, dto);
    return UserMapper.toDto(userEntity);
  }

  @Post('invite')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async invite(@CurrentUser() user: any, @Body() dto: InviteUserDto): Promise<UserResponseDto> {
    const currentUserId = user?.sub;
    const userEntity = await this.inviteUser.execute(dto, currentUserId);
    return UserMapper.toDto(userEntity);
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@CurrentUser() user: any, @UploadedFile() file: any): Promise<{ url: string }> {
    if (!file) {
        throw new Error('No file uploaded');
    }
    const userId = user?.sub;
    const buffer = file.buffer;
    const originalName = file.originalname;
    const fileName = `${userId}-${Date.now()}-${originalName}`;
    const url = await this.uploadAvatar.execute(userId, fileName, buffer);
    return { url };
  }
}
