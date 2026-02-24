import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService, User } from '@virteex/domain-identity-domain';
import { MailQueueProducer } from './mail-queue.producer';

@Injectable()
export class NodemailerNotificationService implements NotificationService {
  private readonly logger = new Logger(NodemailerNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailQueueProducer: MailQueueProducer
  ) {}

  async sendWelcomeEmail(user: User, tempPassword?: string): Promise<void> {
    this.logger.log(`Queueing welcome email for ${user.email}`);

    let htmlContent = `
        <h1>Welcome to Virteex ERP</h1>
        <p>Hello <strong>${user.email}</strong>,</p>
        <p>Your company <strong>${user.company.name}</strong> has been registered successfully.</p>
    `;

    if (tempPassword) {
      htmlContent += `
        <p>You have been invited to join the platform. Your temporary password is:</p>
        <p style="font-size: 1.2em; font-weight: bold; background-color: #f0f0f0; padding: 10px; display: inline-block;">${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
      `;
    } else {
      htmlContent += `<p>You can now login and start using the platform.</p>`;
    }

    const textContent = `Welcome ${user.email} to Virteex ERP! Your company ${user.company.name} has been registered successfully.${tempPassword ? ' Your temporary password is: ' + tempPassword : ''}`;

    await this.mailQueueProducer.addEmailJob({
      to: user.email,
      subject: 'Welcome to Virteex ERP',
      text: textContent,
      html: htmlContent,
    });
  }

  async sendInvitationEmail(user: User, token: string): Promise<void> {
    this.logger.log(`Queueing invitation email for ${user.email}`);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:4200';
    const inviteUrl = `${frontendUrl}/auth/invite?token=${token}`;

    const htmlContent = `
        <h1>You have been invited to Virteex ERP</h1>
        <p>Hello,</p>
        <p>You have been invited to join <strong>${user.company.name}</strong> on Virteex.</p>
        <p>Click the button below to set your password and access your account:</p>
        <p><a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
        <p>Or copy this link: ${inviteUrl}</p>
    `;
    const textContent = `You have been invited to Virteex ERP. Click here to accept: ${inviteUrl}`;

    await this.mailQueueProducer.addEmailJob({
      to: user.email,
      subject: 'Invitation to Virteex ERP',
      text: textContent,
      html: htmlContent,
    });
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    this.logger.log(`Queueing OTP email for ${email}`);

    const htmlContent = `
        <h1>Virteex Verification</h1>
        <p>Your verification code is:</p>
        <p style="font-size: 2em; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px; display: inline-block;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
    `;
    const textContent = `Your Virteex verification code is: ${otp}`;

    await this.mailQueueProducer.addEmailJob({
      to: email,
      subject: 'Verify your email - Virteex',
      text: textContent,
      html: htmlContent,
    });
  }
}
