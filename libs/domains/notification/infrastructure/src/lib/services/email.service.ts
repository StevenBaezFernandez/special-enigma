import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user',
        pass: process.env.SMTP_PASS || 'ethereal.pass',
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      this.logger.log(`Sending email to ${to} with subject "${subject}"`);
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Virteex ERP" <noreply@virteex.com>',
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
