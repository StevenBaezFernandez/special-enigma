import { Injectable, Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository
  ) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): void {
    done(null, user.id || user.sub);
  }

  async deserializeUser(userId: string, done: (err: Error | null, user: any) => void): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
