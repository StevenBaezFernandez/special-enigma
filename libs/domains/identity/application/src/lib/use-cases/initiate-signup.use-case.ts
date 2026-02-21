import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { AuthService, NotificationService, UserRepository, CachePort } from '@virteex/identity-domain';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class InitiateSignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}

@Injectable()
export class InitiateSignupUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(CachePort) private readonly cachePort: CachePort
  ) {}

  async execute(dto: InitiateSignupDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
        throw new ConflictException('User already exists');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = JSON.stringify({
        passwordHash,
        otp,
        timestamp: Date.now()
    });

    await this.cachePort.set(`signup:${dto.email}`, payload, 600);

    await this.notificationService.sendOtp(dto.email, otp);
  }
}
