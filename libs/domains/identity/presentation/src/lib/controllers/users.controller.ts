import {
  Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile,
  Req, UnauthorizedException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  GetUserProfileUseCase, UpdateUserProfileUseCase, InviteUserUseCase, UploadAvatarUseCase,
  UpdateUserDto, InviteUserDto, GetJobTitlesUseCase
} from '@virteex/identity-application';
import { User } from '@virteex/identity-domain';
import { JwtAuthGuard } from '@virteex/auth';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getProfile: GetUserProfileUseCase,
    private readonly updateProfile: UpdateUserProfileUseCase,
    private readonly inviteUser: InviteUserUseCase,
    private readonly uploadAvatar: UploadAvatarUseCase,
    private readonly getJobTitlesUseCase: GetJobTitlesUseCase
  ) {}

  @Get('job-titles')
  async getJobTitles(): Promise<string[]> {
    const titles = await this.getJobTitlesUseCase.execute();
    return titles.map(t => t.title);
  }

  @Get('profile')
  async getMyProfile(@Req() req: any): Promise<User> {
    const userId = req.user?.sub;
    return this.getProfile.execute(userId);
  }

  @Patch('profile')
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateUserDto): Promise<User> {
    const userId = req.user?.sub;
    return this.updateProfile.execute(userId, dto);
  }

  @Post('invite')
  async invite(@Req() req: any, @Body() dto: InviteUserDto): Promise<User> {
    const currentUserId = req.user?.sub;
    return this.inviteUser.execute(dto, currentUserId);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Req() req: any, @UploadedFile() file: any): Promise<{ url: string }> {
    if (!file) {
        throw new Error('No file uploaded');
    }
    const userId = req.user?.sub;
    const buffer = file.buffer;
    const originalName = file.originalname;
    const fileName = `${userId}-${Date.now()}-${originalName}`;
    const url = await this.uploadAvatar.execute(userId, fileName, buffer);
    return { url };
  }
}
