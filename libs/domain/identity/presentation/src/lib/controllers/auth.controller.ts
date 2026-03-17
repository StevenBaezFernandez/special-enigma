import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, UseGuards, Inject, Optional, Session } from '@nestjs/common';
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
    VerifyPasskeyLoginUseCase
} from '@virteex/domain-identity-application';
import { LoginUserDto, VerifyMfaDto, RefreshTokenDto, InitiateSignupDto, VerifySignupDto, CompleteOnboardingDto } from '@virteex/domain-identity-contracts';
import { Request, Response } from 'express';
import { Public, JwtAuthGuard, SecretManagerService } from '@virteex/kernel-auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GeoIpPort, GEO_IP_PORT } from '@virteex/domain-identity-domain';
import { SessionGuard } from '../guards/session.guard';
import { buildAccessCookieOptions, buildRefreshCookieOptions } from '@virteex/kernel-auth';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard, JwtAuthGuard, SessionGuard)
export class AuthController {
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
    @Inject(GEO_IP_PORT) private readonly geoIpPort: GeoIpPort,
    @Optional() private readonly secretManager?: SecretManagerService
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const context = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.loginUserUseCase.execute(dto, context);

    if (result.mfaRequired) {
        return result;
    }

    this.setCookies(res, result.accessToken!, result.refreshToken!, dto.rememberMe);

    // Secure Response: No tokens in body
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
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
      };
      const result = await this.completeOnboardingUseCase.execute(dto, context);

      this.setCookies(res, result.accessToken, result.refreshToken);

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
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.verifyMfaUseCase.execute(dto, context);

    this.setCookies(res, result.accessToken!, result.refreshToken!);

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
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    const dto: RefreshTokenDto = { refreshToken };
    const result = await this.refreshTokenUseCase.execute(dto, context);

    this.setCookies(res, result.accessToken!, result.refreshToken!);

    return {
        expiresIn: result.expiresIn
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const cookieContext = this.getCookieContext();
      res.clearCookie('access_token', { path: '/', domain: cookieContext.domain });
      res.clearCookie('refresh_token', { path: '/auth/refresh', domain: cookieContext.domain });

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
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.handleSocialLoginUseCase.execute(req.user as any, context);
    this.setCookies(res, result.accessToken!, result.refreshToken!);

    const frontendUrl = this.secretManager?.getSecret('FRONTEND_URL', 'http://localhost:4200');
    res.redirect(`${frontendUrl}/dashboard`);
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
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
      };

      const result = await this.verifyPasskeyLoginUseCase.execute(body, currentOptions, context);
      delete (req as any).session.loginOptions;

      this.setCookies(res, result.accessToken!, result.refreshToken!);
      return {
          expiresIn: result.expiresIn,
          mfaRequired: false
      };
  }

  @Public()
  @Post('security/context-check')
  @HttpCode(HttpStatus.OK)
  async checkContext(@Body() body: { urlCountry: string }, @Req() req: Request) {
      let ip: string = req.ip || '127.0.0.1';
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
          if (Array.isArray(forwarded)) {
              ip = forwarded[0];
          } else {
              ip = forwarded.split(',')[0].trim();
          }
      }

      return this.checkSecurityContextUseCase.execute({
          urlCountry: body.urlCountry,
          ip
      });
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = true) {
      const cookieContext = this.getCookieContext();
      res.cookie('access_token', accessToken, buildAccessCookieOptions(cookieContext));
      res.cookie('refresh_token', refreshToken, buildRefreshCookieOptions(cookieContext, rememberMe));
  }

  private getCookieContext() {
      const isProd = this.secretManager?.getSecret('NODE_ENV', 'development') === 'production' || process.env['NODE_ENV'] === 'production';
      const secure = this.secretManager?.getSecret('COOKIE_SECURE', String(isProd)) === 'true';
      const sameSite = (this.secretManager?.getSecret('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none') || 'lax';
      const domain = this.secretManager?.getSecret('COOKIE_DOMAIN', '');
      return { secure, sameSite, domain: domain || undefined };
  }

  @Public()
  @Get('location')
  @ApiOperation({ summary: 'Get client location' })
  async getLocation(@Req() req: Request): Promise<any> {
    try {
      let ip: string = req.ip || '127.0.0.1';
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
          if (Array.isArray(forwarded)) {
              ip = forwarded[0];
          } else {
              ip = forwarded.split(',')[0].trim();
          }
      }

      const geo = await this.geoIpPort.lookup(ip);

      if (!geo) {
          const isProd = this.secretManager?.getSecret('NODE_ENV', 'development') === 'production' || process.env['NODE_ENV'] === 'production';
          if (!isProd) {
             return {
                 country_code: 'MX',
                 city: 'Development City',
                 region: 'DEV',
                 timezone: 'America/Mexico_City',
                 ip
             };
          }
          return { country_code: null, city: 'Unknown', ip };
      }

      return {
          country_code: geo.country,
          city: geo.city,
          region: geo.region,
          timezone: geo.timezone,
          ip
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      return { country_code: null };
    }
  }
}
