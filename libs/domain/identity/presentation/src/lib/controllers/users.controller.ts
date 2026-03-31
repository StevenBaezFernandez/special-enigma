import { Controller, Get, Patch, Put, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UploadAvatarUseCase,
    GetJobTitlesUseCase,
    GetAuditLogsUseCase,
    ListUsersUseCase,
    DeleteUserUseCase,
    UpdateUserUseCase,
    BlockUserUseCase,
    ForceLogoutUseCase,
    ForgotPasswordUseCase
} from '@virteex/domain-identity-application';
import { UserRepository } from '@virteex/domain-identity-domain';
import { UpdateUserDto, InviteUserDto, PaginatedUsersResponse } from '@virteex/domain-identity-contracts';
import { JwtAuthGuard, CurrentUser, StepUp, StepUpGuard, TenantGuard } from '@virteex/kernel-auth';
import { UserMapper } from '../mappers/user.mapper';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { UserResponseDto, AuditLogDto } from '@virteex/domain-identity-contracts';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, StepUpGuard)
export class UsersController {
  constructor(
    private readonly getProfile: GetUserProfileUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
    private readonly inviteUser: InviteUserUseCase,
    private readonly uploadAvatar: UploadAvatarUseCase,
    private readonly getJobTitlesUseCase: GetJobTitlesUseCase,
    private readonly getAuditLogsUseCase: GetAuditLogsUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly forceLogoutUseCase: ForceLogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly userRepository: UserRepository
  ) {}

  @Get()
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async listUsers(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('searchTerm') searchTerm?: string,
    @Query('statusFilter') statusFilter?: string,
    @Query('sortColumn') sortColumn?: string,
    @Query('sortDirection') sortDirection?: 'ASC' | 'DESC'
  ): Promise<PaginatedUsersResponse> {
    const tenantId = user?.tenantId;
    const result = await this.listUsersUseCase.execute({
      page: Number(page),
      pageSize: Number(pageSize),
      searchTerm,
      statusFilter,
      sortColumn,
      sortDirection,
      tenantId
    });

    return {
      data: result.data.map(u => UserMapper.toDto(u)),
      total: result.total
    };
  }

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

  @Patch(':id')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any): Promise<UserResponseDto> {
    const userEntity = await this.updateUserUseCase.execute(id, dto, user.tenantId);
    return UserMapper.toDto(userEntity);
  }

  @Delete(':id')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async delete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    await this.deleteUserUseCase.execute(id, user.tenantId);
  }

  @Post('invite')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async invite(@CurrentUser() user: any, @Body() dto: InviteUserDto): Promise<UserResponseDto> {
    const currentUserId = user?.sub;
    const userEntity = await this.inviteUser.execute(dto, currentUserId);
    return UserMapper.toDto(userEntity);
  }

  @Post(':id/force-logout')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async forceLogout(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    // We should ideally verify if the target user belongs to the same tenant here or in the use case
    const targetUser = await this.userRepository.findById(id, user.tenantId);
    if (!targetUser) throw new Error('User not found in tenant context');
    await this.forceLogoutUseCase.execute(id);
  }

  @Post(':id/block-and-logout')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async blockAndLogout(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    const targetUser = await this.userRepository.findById(id, user.tenantId);
    if (!targetUser) throw new Error('User not found in tenant context');
    await this.blockUserUseCase.execute(id);
  }

  @Put(':id/status')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async setUserStatus(@Param('id') id: string, @Body() body: { isOnline: boolean }, @CurrentUser() user: any): Promise<UserResponseDto> {
    const userEntity = await this.updateUserUseCase.execute(id, { status: body.isOnline ? 'ONLINE' : 'OFFLINE' } as any, user.tenantId);
    return UserMapper.toDto(userEntity);
  }

  @Post(':id/reset-password')
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  async sendPasswordReset(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    await this.forgotPasswordUseCase.execute({ email: user.email, recaptchaToken: '' }, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    }, true);
    return { message: 'Password reset email sent' };
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
