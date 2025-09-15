import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppMailService } from './mail.service';

@Module({
  imports: [
    ConfigModule, // 確保能注入 ConfigService
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST', 'localhost');
        const port = Number(config.get<string>('SMTP_PORT', '1025'));
        const user = config.get<string>('SMTP_USER', '');
        const pass = config.get<string>('SMTP_PASS', '');

        return {
          transport: {
            host,
            port,
            secure: false, // 如果是 465 可能要設 true
            auth: user && pass ? { user, pass } : undefined,
          },
          defaults: {
            from: config.get<string>('MAIL_FROM', '"Forensics" <no-reply@forensics.local>'),
          },
          template: {
            dir: join(process.cwd(), 'src', 'mail', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [AppMailService],
  exports: [AppMailService],
})
export class MailModule {}
