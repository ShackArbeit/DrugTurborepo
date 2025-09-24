// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppMailService {
  private readonly logger = new Logger(AppMailService.name);

  constructor(private readonly mailer: MailerService,
              private readonly config: ConfigService,) {}

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
        template: 'reset-password', // e.g. templates/reset-password.hbs
        context: { username, resetUrl, expiresMinutes },
      });
    } catch (err) {
      this.logger.error(`Failed to send reset mail to ${to}`, err?.stack || String(err));
      throw err;
    }
  }

  async sendSuccessSignUpMail(opts: {
    to: string;
    username: string;
    rawPassword: string;   // 明碼
  }): Promise<void> {
    const appName = this.config.get('APP_NAME') ?? '數位鑑識系統';
    const loginUrl = `${this.config.get('FRONTEND_URL') ?? ''}/login`|| 'http://localhost:3000/login';
    const resetUrl = `${this.config.get('FRONTEND_URL') ?? ''}/Forget`|| 'http://localhost:3000/Forget';
    const supportEmail = this.config.get('SUPPORT_EMAIL') || 'thpocic@gmail.com';
    const { to, username, rawPassword } = opts;
    try {
      await this.mailer.sendMail({
        to,
        subject: '註冊成功通知',
        template: 'success-signup', 
        context: {
          username,
          appName,
          password: rawPassword, 
          loginUrl,
          resetUrl,
          supportEmail,
          note: '請妥善保管此帳密；如忘記密碼，請回系統以忘記密碼功能重設。',
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send signup mail to ${to}`, err?.stack || String(err));
      throw err;
    }
  }
}
