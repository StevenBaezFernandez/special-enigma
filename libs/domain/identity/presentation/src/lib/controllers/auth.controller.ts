import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, UseGuards, Inject, Optional, Session, Logger, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    LoginUserUseCase,
    VerifyMfaUseCase,
    RefreshTokenUseCase,
    InitiateSignupUseCase,
    VerifySignupUseCase,
    CompleteOnboardingUseCase,
    CheckSecurityContextUseCase,
    LogoutUserUseCase,
    HandleSocialLoginUseCase,
    GeneratePasskeyRegistrationOptionsUseCase,
    VerifyPasskeyRegistrationUseCase,
    GeneratePasskeyLoginOptionsUseCase,
    VerifyPasskeyLoginUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    SetPasswordUseCase,
    GetSocialRegisterInfoUseCase
} from '@virteex/domain-identity-application';
import {
    LoginUserDto,
    VerifyMfaDto,
    RefreshTokenDto,
    InitiateSignupDto,
    VerifySignupDto,
    CompleteOnboardingDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    SetPasswordDto
} from '@virteex/domain-identity-contracts';
import { Request, Response } from 'express';
import { Public, JwtAuthGuard, SecretManagerService } from '@virteex/kernel-auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SessionGuard } from '../guards/session.guard';
import { RequestContextService } from '../services/request-context.service';
import { CookiePolicyService } from '../services/cookie-policy.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard, JwtAuthGuard, SessionGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyMfaUseCase: VerifyMfaUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly initiateSignupUseCase: InitiateSignupUseCase,
    private readonly verifySignupUseCase: VerifySignupUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    private readonly checkSecurityContextUseCase: CheckSecurityContextUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly handleSocialLoginUseCase: HandleSocialLoginUseCase,
    private readonly generatePasskeyRegistrationOptionsUseCase: GeneratePasskeyRegistrationOptionsUseCase,
    private readonly verifyPasskeyRegistrationUseCase: VerifyPasskeyRegistrationUseCase,
    private readonly generatePasskeyLoginOptionsUseCase: GeneratePasskeyLoginOptionsUseCase,
    private readonly verifyPasskeyLoginUseCase: VerifyPasskeyLoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    private readonly getSocialRegisterInfoUseCase: GetSocialRegisterInfoUseCase,
    private readonly requestContextService: RequestContextService,
    private readonly cookiePolicyService: CookiePolicyService,
    @Optional() private readonly secretManager?: SecretManagerService
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const context = {
      ip: this.requestContextService.extractIp(req),
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.loginUserUseCase.execute(dto, context);

    if (result.mfaRequired) {
        return result;
    }

    this.cookiePolicyService.setAuthCookies(res, result.accessToken!, result.refreshToken!, dto.rememberMe);

    return {
        expiresIn: result.expiresIn,
        mfaRequired: false
    };
  }

  @Public()
  @Post('signup/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateSignup(@Body() dto: InitiateSignupDto) {
      await this.initiateSignupUseCase.execute(dto);
      return { message: 'OTP sent' };
  }

  @Public()
  @Post('signup/verify')
  @HttpCode(HttpStatus.OK)
  async verifySignup(@Body() dto: VerifySignupDto) {
      return this.verifySignupUseCase.execute(dto);
  }

  @Public()
  @Post('signup/complete')
  @HttpCode(HttpStatus.CREATED)
  async completeOnboarding(@Body() dto: CompleteOnboardingDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const context = {
          ip: this.requestContextService.extractIp(req),
          userAgent: req.headers['user-agent'] || 'unknown'
      };
      const result = await this.completeOnboardingUseCase.execute(dto, context);

      this.cookiePolicyService.setAuthCookies(res, result.accessToken, result.refreshToken);

      return {
          expiresIn: result.expiresIn
      };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const context = {
        ip: this.requestContextService.extractIp(req),
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.verifyMfaUseCase.execute(dto, context);

    this.cookiePolicyService.setAuthCookies(res, result.accessToken!, result.refreshToken!);

    return {
        expiresIn: result.expiresIn,
        mfaRequired: false
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let refreshToken = req.cookies['refresh_token'];

    if (!refreshToken && req.body && req.body.refreshToken) {
        refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
        throw new UnauthorizedException('No refresh token found in cookies or body');
    }

    const context = {
        ip: this.requestContextService.extractIp(req),
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    const dto: RefreshTokenDto = { refreshToken };
    const result = await this.refreshTokenUseCase.execute(dto, context);

    this.cookiePolicyService.setAuthCookies(res, result.accessToken!, result.refreshToken!);

    return {
        expiresIn: result.expiresIn
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      this.cookiePolicyService.clearAuthCookies(res);

      const user = (req as any).user;
      if (user && user.sessionId) {
          await this.logoutUserUseCase.execute(user.sessionId);
      }

      return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
      return (req as any).user;
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
      const context = {
          ip: this.requestContextService.extractIp(req),
          userAgent: req.headers['user-agent'] || 'unknown'
      };
      await this.forgotPasswordUseCase.execute(dto, context);
      return { message: 'If the email exists, a reset link has been sent.' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
      const context = {
          ip: this.requestContextService.extractIp(req),
          userAgent: req.headers['user-agent'] || 'unknown'
      };
      await this.resetPasswordUseCase.execute(dto, context);
      return { message: 'Password has been reset successfully.' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  async setPassword(@Body() dto: SetPasswordDto, @Req() req: Request) {
      const context = {
          ip: this.requestContextService.extractIp(req),
          userAgent: req.headers['user-agent'] || 'unknown'
      };
      await this.setPasswordUseCase.execute(dto, context);
      return { message: 'Password has been set successfully.' };
  }

  @Public()
  @Get('social-register-info')
  async getSocialRegisterInfo(@Query('token') token: string) {
      return this.getSocialRegisterInfoUseCase.execute(token);
  }

  // --- Social Login ---

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.handleSocialCallback(req, res);
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Redirects to Microsoft
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.handleSocialCallback(req, res);
  }

  @Public()
  @Get('okta')
  @UseGuards(AuthGuard('okta'))
  async oktaAuth() {
    // Redirects to Okta
  }

  @Public()
  @Get('okta/callback')
  @UseGuards(AuthGuard('okta'))
  async oktaAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.handleSocialCallback(req, res);
  }

  private async handleSocialCallback(req: Request, res: Response) {
    const context = {
        ip: this.requestContextService.extractIp(req),
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.handleSocialLoginUseCase.execute(req.user as any, context);
    this.cookiePolicyService.setAuthCookies(res, result.accessToken!, result.refreshToken!);

    const frontendUrl = this.secretManager?.getSecret('FRONTEND_URL', 'http://localhost:4200');
    res.redirect(`${frontendUrl}/accounting`);
  }

  // --- Passkeys (WebAuthn) ---

  @Get('passkey/register-options')
  async passkeyRegisterOptions(@Req() req: Request) {
      const user = (req as any).user;
      const options = await this.generatePasskeyRegistrationOptionsUseCase.execute(user.sub);
      (req as any).session.registrationOptions = options;
      return options;
  }

  @Post('passkey/register-verify')
  async passkeyRegisterVerify(@Body() body: any, @Req() req: Request) {
      const user = (req as any).user;
      const currentOptions = (req as any).session.registrationOptions;
      if (!currentOptions) throw new UnauthorizedException('Registration options not found in session');

      const result = await this.verifyPasskeyRegistrationUseCase.execute(user.sub, currentOptions, body);
      delete (req as any).session.registrationOptions;
      return result;
  }

  @Public()
  @Post('passkey/login-options')
  async passkeyLoginOptions(@Body() body: { email?: string }, @Req() req: Request) {
      const options = await this.generatePasskeyLoginOptionsUseCase.execute(body.email);
      (req as any).session.loginOptions = { ...options, userEmail: body.email };
      return options;
  }

  @Public()
  @Post('passkey/login-verify')
  async passkeyLoginVerify(@Body() body: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const currentOptions = (req as any).session.loginOptions;
      if (!currentOptions) throw new UnauthorizedException('Login options not found in session');

      const context = {
          ip: this.requestContextService.extractIp(req),
          userAgent: req.headers['user-agent'] || 'unknown'
      };

      const result = await this.verifyPasskeyLoginUseCase.execute(body, currentOptions, context);
      delete (req as any).session.loginOptions;

      this.cookiePolicyService.setAuthCookies(res, result.accessToken!, result.refreshToken!);
      return {
          expiresIn: result.expiresIn,
          mfaRequired: false
      };
  }

  @Public()
  @Post('security/context-check')
  @HttpCode(HttpStatus.OK)
  async checkContext(@Body() body: { urlCountry: string }, @Req() req: Request) {
      const ip = this.requestContextService.extractIp(req);
      return this.checkSecurityContextUseCase.execute({
          urlCountry: body.urlCountry,
          ip
      });
  }

  @Public()
  @Get('location')
  @ApiOperation({ summary: 'Get client location' })
  async getLocation(@Req() req: Request): Promise<any> {
    try {
      const ip = this.requestContextService.extractIp(req);
      return await this.requestContextService.getGeoLocation(ip);
    } catch (error) {
      this.logger.error('Error fetching location:', error);
      return { country_code: null };
    }
  }
}
