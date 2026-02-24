import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
    LoginUserUseCase,
    InitiateSignupUseCase,
    VerifySignupUseCase,
    CompleteOnboardingUseCase
} from '@virteex/application-identity-application';
import { LoginInput } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { InitiateSignupInput, VerifySignupInput, CompleteOnboardingInput } from './dto/signup.input';
import { InitiateSignupResponse, VerifySignupResponse } from './dto/signup.response';

@Resolver()
export class IdentityResolver {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly initiateSignupUseCase: InitiateSignupUseCase,
    private readonly verifySignupUseCase: VerifySignupUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase
  ) {}

  @Query(() => String)
  identityHealthCheck(): string {
    return 'Identity Service is running';
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
      return this.loginUserUseCase.execute(input);
  }

  @Mutation(() => InitiateSignupResponse)
  async initiateSignup(@Args('input') input: InitiateSignupInput): Promise<InitiateSignupResponse> {
      // Note: UseCase currently only uses email/password for OTP generation.
      // Other fields like companyName are collected but used later or stored in cache if modified UseCase.
      await this.initiateSignupUseCase.execute({ email: input.email, password: input.password });
      return { success: true, message: 'Verification code sent' };
  }

  @Mutation(() => VerifySignupResponse)
  async verifySignup(@Args('input') input: VerifySignupInput): Promise<VerifySignupResponse> {
      const result = await this.verifySignupUseCase.execute({ email: input.email, otp: input.code });
      return { success: true, accessToken: result.onboardingToken };
  }

  @Mutation(() => LoginResponse)
  async completeOnboarding(
      @Args('input') input: CompleteOnboardingInput,
      @Context() context: any
  ): Promise<LoginResponse> {
      // Extract IP and UA from context (assumes Express/Fastify request object structure)
      const req = context.req || context.request;
      const ip = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';
      const userAgent = req?.headers?.['user-agent'] || 'unknown';

      const result = await this.completeOnboardingUseCase.execute(input, { ip, userAgent });

      return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn
      };
  }
}
