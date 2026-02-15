import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  RegisterUserDto, LoginUserDto, VerifyMfaDto,
  RegisterUserUseCase, LoginUserUseCase, VerifyMfaUseCase,
  LoginResponseDto
} from '@virteex/identity-application';
import { User } from '@virteex/identity-domain';
import { Request } from 'express';
import { Public } from '@virteex/auth';
import { ApiOperation } from '@nestjs/swagger';
import * as geoip from 'geoip-lite';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyMfaUseCase: VerifyMfaUseCase
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
  async login(@Body() dto: LoginUserDto, @Req() req: Request): Promise<LoginResponseDto> {
    const context = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    return this.loginUserUseCase.execute(dto, context);
  }

  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request): Promise<LoginResponseDto> {
    const context = {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    return this.verifyMfaUseCase.execute(dto, context);
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
