import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { AppMailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        // host: 'smtp.gmail.com',
        host:'smtp.moj.gov.tw',
        port: 25,
        secure: true,
        auth: {
          user:'g0972222165@gmail.com',
          pass:'acja tqug jnnw aoif', 
        },
      },
      defaults: {
        from: '"Forensics" <g0972222165@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'src', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [AppMailService],
  exports:   [AppMailService],
})
export class MailModule {}
