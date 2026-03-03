import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Virteex ERP" <no-reply@virteex.com>',
        to,
        subject,
        text: body,
        html: `<div>${body}</div>`,
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`Error sending email to ${to}: ${err.message}`);
      throw err;
    }
  }
}
