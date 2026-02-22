import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, UseGuards, Inject } from '@nestjs/common';
import {
  LoginUserDto, VerifyMfaDto,
  LoginUserUseCase, VerifyMfaUseCase,
  RefreshTokenDto, RefreshTokenUseCase,
  InitiateSignupUseCase, VerifySignupUseCase, CompleteOnboardingUseCase,
  InitiateSignupDto, VerifySignupDto, CompleteOnboardingDto
} from '@virteex/identity-application';
import { Request, Response } from 'express';
import { Public, JwtAuthGuard } from '@virteex/auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as geoip from 'geoip-lite';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CachePort } from '@virteex/identity-domain';
import { SessionGuard } from '../guards/session.guard';

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
    @Inject(CachePort) private readonly cachePort: CachePort
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

    // Return Access Token (but not Refresh Token) in body
    return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        mfaRequired: false,
        user: (result as any).user
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
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
          user: result.user
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
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: (result as any).user
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
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      const user = (req as any).user;
      if (user && user.sessionId) {
          await this.cachePort.del(`session:${user.sessionId}`);
      }

      return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
      return (req as any).user;
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = true) {
      res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000
      });

      const refreshOptions: any = {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax',
          path: '/auth/refresh'
      };

      if (rememberMe) {
          refreshOptions.maxAge = 7 * 24 * 3600 * 1000;
      }
      // If !rememberMe, no maxAge -> Session Cookie

      res.cookie('refresh_token', refreshToken, refreshOptions);
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

      const geo = geoip.lookup(ip);

      if (!geo) {
          if (process.env['NODE_ENV'] !== 'production') {
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
