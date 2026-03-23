import { User } from '../entities/user.entity';

export abstract class NotificationService {
  abstract sendWelcomeEmail(user: User, tempPassword?: string): Promise<void>;
  abstract sendInvitationEmail(user: User, token: string): Promise<void>;
  abstract sendOtp(email: string, otp: string): Promise<void>;
  abstract sendPasswordResetEmail(user: User, token: string): Promise<void>;
}
