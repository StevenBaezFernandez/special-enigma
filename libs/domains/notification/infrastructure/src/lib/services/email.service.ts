import { Injectable, Logger, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SecretManagerService } from '@virteex/kernel-auth';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(@Optional() private readonly secretManager?: SecretManagerService) {
    this.transporter = nodemailer.createTransport({
      host: this.secretManager?.getSecret('SMTP_HOST', 'smtp.ethereal.email') || process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(this.secretManager?.getSecret('SMTP_PORT', '587') || process.env.SMTP_PORT || '587'),
      secure: (this.secretManager?.getSecret('SMTP_SECURE', 'false') || process.env.SMTP_SECURE) === 'true',
      auth: {
        user: this.secretManager?.getSecret('SMTP_USER', 'ethereal.user') || process.env.SMTP_USER || 'ethereal.user',
        pass: this.secretManager?.getSecret('SMTP_PASS', 'ethereal.pass') || process.env.SMTP_PASS || 'ethereal.pass',
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      this.logger.log(`Sending email to ${to} with subject "${subject}"`);
      const from = this.secretManager?.getSecret('SMTP_FROM', '"Virteex ERP" <noreply@virteex.com>') || process.env.SMTP_FROM || '"Virteex ERP" <noreply@virteex.com>';
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: body, // plaintext body
        html: `<p>${body}</p>`, // html body
      });
      this.logger.log(`Message sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
