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
        secure: false,
        requireTLS: true,
        auth: {
          user:'shackarbeit@mail.moj.gov.tw',
          pass:'Wang81191@',
        },
        tls: { servername: 'smtp.moj.gov.tw',rejectUnauthorized: false, },
      },
      defaults: {
        from: '"Forensics" <shackarbeit@mail.moj.gov.tw>',
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
