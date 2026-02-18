import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException } from '@nestjs/common';
import {
  RegisterUserDto, LoginUserDto, VerifyMfaDto,
  RegisterUserUseCase, LoginUserUseCase, VerifyMfaUseCase,
  LoginResponseDto, RefreshTokenUseCase
} from '@virteex/identity-application';
import { User } from '@virteex/identity-domain';
import { Request, Response } from 'express';
import { Public } from '@virteex/auth';
import { ApiOperation } from '@nestjs/swagger';
import * as geoip from 'geoip-lite';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyMfaUseCase: VerifyMfaUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto, @Req() req: Request): Promise<User> {
    const context = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      country: undefined // Could be extracted from headers like 'cf-ipcountry'
    };
    return this.registerUserUseCase.execute(dto, context);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Partial<LoginResponseDto>> {
    const context = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.loginUserUseCase.execute(dto, context);
    this.setCookies(res, result);
    const { accessToken, refreshToken, ...rest } = result;
    return rest;
  }

  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Partial<LoginResponseDto>> {
    const context = {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    const result = await this.verifyMfaUseCase.execute(dto, context);
    this.setCookies(res, result);
    const { accessToken, refreshToken, ...rest } = result;
    return rest;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Partial<LoginResponseDto>> {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
        throw new UnauthorizedException('No refresh token found in cookies');
    }

    const context = {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    const result = await this.refreshTokenUseCase.execute({ refreshToken }, context);
    this.setCookies(res, result);
    const { accessToken: at, refreshToken: rt, ...rest } = result;
    return rest;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('access_token', {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax',
      });
      res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax',
      });
      return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
      return (req as any).user;
  }

  private setCookies(res: Response, result: LoginResponseDto) {
      if (result.accessToken) {
          res.cookie('access_token', result.accessToken, {
              httpOnly: true,
              secure: process.env['NODE_ENV'] === 'production',
              sameSite: 'lax', // Use 'lax' for better UX with redirections, or 'strict' if SPA is on same domain
              maxAge: 3600 * 1000 // 1 hour
          });
      }
      if (result.refreshToken) {
          res.cookie('refresh_token', result.refreshToken, {
              httpOnly: true,
              secure: process.env['NODE_ENV'] === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 3600 * 1000 // 7 days
          });
      }
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

      // geoip.lookup might return null for private/local IPs
      const geo = geoip.lookup(ip);

      if (!geo) {
          // Robust fallback for development or private networks
          if (process.env['NODE_ENV'] !== 'production') {
             return {
                 country_code: 'MX', // Default to Mexico for dev
                 city: 'Development City',
                 region: 'DEV',
                 timezone: 'America/Mexico_City',
                 ip
             };
          }
          // Default fallback for localhost or unknown IPs
          // Returning null country_code to indicate failure/unknown
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
