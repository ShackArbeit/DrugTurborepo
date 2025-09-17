import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppMailService {
  private readonly logger = new Logger(AppMailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendResetPasswordMail(opts: {
    to: string;
    username: string;
    resetUrl: string;
    expiresMinutes: number;
  }): Promise<void> {
    const { to, username, resetUrl, expiresMinutes } = opts;
    try {
      await this.mailer.sendMail({
        to,
        subject: '重設密碼說明',
        template: 'reset-password', 
        context: {
          username,
          resetUrl,
          expiresMinutes,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send reset mail to ${to}`, err?.stack || err);
      throw err;
    }
  }
}

